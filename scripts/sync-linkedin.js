#!/usr/bin/env node
/**
 * sync-linkedin.js
 * Récupère TOUS les posts + images de l'organisation SAR depuis LinkedIn
 * et les synchronise vers le backend Django.
 */

const fs = require('fs').promises
const path = require('path')
const https = require('https')
const http = require('http')

const CONFIG_FILE = path.join(process.cwd(), 'data', 'linkedin-config.json')
const POSTS_CACHE  = path.join(process.cwd(), 'data', 'linkedin-posts.json')
const API_URL      = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const IMG_DIR      = path.join(process.cwd(), 'public', 'media', 'linkedin')

// ─── Helper fetch avec timeout ────────────────────────────────────────────────
async function fetchJSON(url, options = {}, timeout = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return { ok: res.ok, status: res.status, data: await res.json() }
  } catch (e) {
    clearTimeout(timer)
    return { ok: false, status: 0, data: null, error: e.message }
  }
}

// ─── Résoudre un URN LinkedIn en URL CDN ──────────────────────────────────────
async function resolveLinkedInUrn(urn, accessToken) {
  if (!urn || !urn.startsWith('urn:li:')) return null

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': '202304',
  }

  // 1) urn:li:image:XXX  → REST /images endpoint (nouveau format)
  if (urn.startsWith('urn:li:image:')) {
    const { ok, data } = await fetchJSON(
      `https://api.linkedin.com/rest/images/${encodeURIComponent(urn)}`,
      { headers }
    )
    if (ok && data?.downloadUrl) return data.downloadUrl
  }

  // 2) urn:li:digitalmediaAsset:XXX → Assets API
  if (urn.startsWith('urn:li:digitalmediaAsset:')) {
    const { ok, data } = await fetchJSON(
      `https://api.linkedin.com/v2/assets/${encodeURIComponent(urn)}?projection=(displayImage~:playableStreams)`,
      { headers }
    )
    if (ok && data) {
      const elements = data['displayImage~']?.elements || []
      // Prendre le stream de meilleure qualité (dernier = plus grand)
      for (let i = elements.length - 1; i >= 0; i--) {
        const id = elements[i]?.identifiers?.[0]?.identifier
        if (id) return id
      }
    }
  }

  // 3) urn:li:multiPhoto:XXX → multiImages API (legacy)
  if (urn.startsWith('urn:li:multiPhoto:')) {
    const { ok, data } = await fetchJSON(
      `https://api.linkedin.com/v2/multiImages/${encodeURIComponent(urn)}?projection=(displayImage~:playableStreams)`,
      { headers }
    )
    if (ok && data) {
      const elements = data['displayImage~']?.elements || []
      for (let i = elements.length - 1; i >= 0; i--) {
        const id = elements[i]?.identifiers?.[0]?.identifier
        if (id) return id
      }
    }
  }

  return null
}

// ─── Télécharger une image et retourner le chemin local ──────────────────────
async function downloadImage(imageUrl, filename) {
  if (!imageUrl) return null
  try {
    await fs.mkdir(IMG_DIR, { recursive: true })
    const filePath = path.join(IMG_DIR, filename)

    await new Promise((resolve, reject) => {
      const proto = imageUrl.startsWith('https') ? https : http
      const file = require('fs').createWriteStream(filePath)
      proto.get(imageUrl, (res) => {
        if (res.statusCode !== 200) { file.close(); reject(new Error(`HTTP ${res.statusCode}`)); return }
        res.pipe(file)
        file.on('finish', () => { file.close(); resolve() })
        file.on('error', reject)
      }).on('error', reject)
    })

    return `/media/linkedin/${filename}`
  } catch {
    return null
  }
}

// ─── Fetch UNE page de posts LinkedIn ────────────────────────────────────────
async function fetchLinkedInPage(accessToken, organizationUrn, start = 0, count = 50) {
  const { ok, status, data } = await fetchJSON(
    `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${encodeURIComponent(organizationUrn)})&count=${count}&start=${start}&sortBy=LAST_MODIFIED`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304',
      },
    },
    15000
  )
  if (status === 401) throw new Error('Token LinkedIn expiré. Lancez: npm run setup-linkedin')
  if (!ok) throw new Error(`LinkedIn API error ${status}`)
  return { elements: data?.elements || [], paging: data?.paging || {} }
}

// ─── Fetch TOUS les posts ─────────────────────────────────────────────────────
async function fetchAllPosts(config) {
  const { accessToken, organizationUrn } = config
  if (!accessToken) throw new Error('accessToken manquant. Lancez: npm run setup-linkedin')

  const all = []
  let start = 0
  const count = 50

  while (true) {
    const { elements, paging } = await fetchLinkedInPage(accessToken, organizationUrn, start, count)
    all.push(...elements)
    process.stdout.write(` [p${Math.floor(start/count)+1}:${elements.length}]`)
    start += count
    const total = paging.total
    if (elements.length < count || (total !== undefined && start >= total)) break
    await new Promise(r => setTimeout(r, 300))
  }
  console.log(`\n   ${all.length} posts récupérés`)
  return all
}

// ─── Extraire l'URL image d'un élément media ──────────────────────────────────
async function extractImageUrl(mediaItem, accessToken) {
  if (!mediaItem) return null

  // URL directe (cas le plus simple)
  if (mediaItem.originalUrl) return mediaItem.originalUrl
  if (mediaItem.thumbnails?.length > 0) {
    // Prendre la plus grande miniature
    const sorted = [...mediaItem.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0))
    if (sorted[0]?.url) return sorted[0].url
  }

  // URN à résoudre via API
  if (mediaItem.media && typeof mediaItem.media === 'string') {
    return await resolveLinkedInUrn(mediaItem.media, accessToken)
  }

  return null
}

// ─── Transformer un post LinkedIn ─────────────────────────────────────────────
async function transformPost(element, accessToken) {
  const postId = element.id
  const date   = new Date(element.created?.time || Date.now())

  const shareContent = element.specificContent?.['com.linkedin.ugc.ShareContent'] || {}
  const commentary   = shareContent.shareCommentary?.text || ''
  const mediaList    = shareContent.media || []

  // Chercher la première image disponible (peu importe le nombre)
  let localImage = null
  for (const mediaItem of mediaList) {
    const imgUrl = await extractImageUrl(mediaItem, accessToken)
    if (imgUrl) {
      const shortId = postId.split(':').pop()
      // Les URLs LinkedIn CDN n'ont pas d'extension significative → toujours .jpg
      localImage    = await downloadImage(imgUrl, `${shortId}.jpg`)
      if (localImage) break
    }
  }

  return {
    id:         postId,
    title:      commentary.slice(0, 200),
    content:    commentary,
    titleEn:    commentary.slice(0, 200),
    contentEn:  commentary,
    dateIso:    date.toISOString(),
    image:      localImage,   // chemin local ex: /media/linkedin/7448...jpg  ou null
    linkedInUrl: `https://www.linkedin.com/feed/update/${postId}`,
  }
}

// ─── Sync vers Django par batch ───────────────────────────────────────────────
async function syncToDjango(posts) {
  const BATCH = 50
  let created = 0, updated = 0, errors = 0

  for (let i = 0; i < posts.length; i += BATCH) {
    const batch = posts.slice(i, i + BATCH)
    const res = await fetch(`${API_URL}/actualites/sync-linkedin/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts: batch }),
    })
    if (!res.ok) {
      console.error(`\n  Batch ${Math.floor(i/BATCH)+1} FAIL ${res.status}:`, (await res.text()).slice(0, 200))
      continue
    }
    const r = await res.json()
    created += r.stats?.created || 0
    updated += r.stats?.updated || 0
    errors  += r.stats?.errors  || 0
    process.stdout.write(` [b${Math.floor(i/BATCH)+1}:+${r.stats?.created}u${r.stats?.updated}]`)
  }
  console.log()
  return { created, updated, errors }
}

// ─── Récupérer les IDs déjà en base Django ───────────────────────────────────
async function fetchExistingIds() {
  const { ok, data } = await fetchJSON(`${API_URL}/actualites/linkedin-ids/`)
  if (!ok || !data?.ids) return new Set()
  return new Set(data.ids)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Synchronisation LinkedIn → Django\n')

  const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf-8').catch(() => {
    throw new Error('Config non trouvée. Lancez: npm run setup-linkedin')
  }))

  console.log('🗄️  Récupération des IDs existants en base...')
  const existingIds = await fetchExistingIds()
  console.log(`   ${existingIds.size} posts déjà en base`)

  console.log('📡 Récupération des posts LinkedIn...')
  const elements = await fetchAllPosts(config)

  // Filtrer uniquement les nouveaux posts
  const newElements = elements.filter(el => !existingIds.has(el.id))
  console.log(`   ${newElements.length} nouveaux posts à traiter (${elements.length - newElements.length} ignorés car déjà présents)`)

  if (newElements.length === 0) {
    console.log('✅ Aucun nouveau post — base déjà à jour')
    return
  }

  console.log('🖼️  Transformation + téléchargement images...')
  const posts = []
  let imgCount = 0
  for (const el of newElements) {
    try {
      const post = await transformPost(el, config.accessToken)
      if (post.image) imgCount++
      posts.push(post)
      process.stdout.write(post.image ? '🖼' : '.')
    } catch {
      process.stdout.write('x')
    }
  }
  console.log(`\n   ${posts.length} posts (${imgCount} avec image)`)

  await fs.mkdir(path.dirname(POSTS_CACHE), { recursive: true })
  await fs.writeFile(POSTS_CACHE, JSON.stringify(posts, null, 2))
  console.log('💾 Cache sauvegardé')

  console.log('📤 Sync vers Django...')
  const stats = await syncToDjango(posts)
  console.log(`✅ Terminé: ${stats.created} créés, ${stats.updated} mis à jour, ${stats.errors} erreurs`)
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1) })
