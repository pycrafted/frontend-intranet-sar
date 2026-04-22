#!/usr/bin/env node
/**
 * setup-linkedin.js
 * Authentification OAuth LinkedIn — génère et sauvegarde l'access token.
 * Usage : node scripts/setup-linkedin.js
 */

const http = require('http')
const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')

const CONFIG_FILE = path.join(process.cwd(), 'data', 'linkedin-config.json')

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set')
const REDIRECT_URI = 'http://localhost:8080/callback'
const SCOPES = ['r_organization_social', 'rw_organization_admin', 'r_basicprofile', 'openid', 'profile', 'email']

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? `start "" "${url}"`
    : process.platform === 'darwin' ? `open "${url}"`
    : `xdg-open "${url}"`
  exec(cmd, err => { if (err) console.log('\n⚠️  Ouvrez manuellement :', url) })
}

async function loadConfig() {
  try { return JSON.parse(await fs.readFile(CONFIG_FILE, 'utf-8')) } catch { return {} }
}

async function exchangeCode(code) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code', code,
    redirect_uri: REDIRECT_URI, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
  })
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data
}

async function main() {
  console.log('🔐 Configuration OAuth LinkedIn\n')
  const existing = await loadConfig()

  const authUrl = 'https://www.linkedin.com/oauth/v2/authorization?' + new URLSearchParams({
    response_type: 'code', client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI, scope: SCOPES.join(' '),
    state: Math.random().toString(36).slice(2),
  })

  console.log('🌐 Ouverture du navigateur...')
  openBrowser(authUrl)

  await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:8080')
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')
        if (!code && !error) { res.end('<p>En attente...</p>'); return }
        if (error) {
          res.end(`<h2>Erreur: ${error}</h2>`)
          server.close(); reject(new Error(error)); return
        }
        res.end('<h2>✅ Autorisation accordée ! Vous pouvez fermer cet onglet.</h2>')
        server.close()

        const tokenData = await exchangeCode(code)
        console.log(`✅ Token obtenu (expire dans ${Math.round(tokenData.expires_in / 86400)} jours)`)

        await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true })
        await fs.writeFile(CONFIG_FILE, JSON.stringify({
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectUri: REDIRECT_URI,
          accessToken: tokenData.access_token,
          organizationUrn: existing.organizationUrn || 'urn:li:organization:91588959',
        }, null, 2), 'utf-8')
        console.log('✅ Config sauvegardée dans data/linkedin-config.json')
        resolve()
      } catch (err) {
        res.writeHead(500); res.end('Erreur interne')
        server.close(); reject(err)
      }
    })
    server.listen(8080, () => console.log('👂 Serveur sur http://localhost:8080/callback\n'))
    server.on('error', err => { if (err.code === 'EADDRINUSE') console.error('❌ Port 8080 déjà utilisé'); reject(err) })
  })
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
