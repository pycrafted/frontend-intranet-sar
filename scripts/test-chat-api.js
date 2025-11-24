const http = require('http')
require('dotenv').config({ path: '.env.local' })

// Charger les variables d'environnement
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL

if (!FRONTEND_URL) {
  console.error('❌ Erreur: NEXT_PUBLIC_FRONTEND_URL doit être définie dans .env.local')
  process.exit(1)
}

// Extraire le hostname et le port depuis l'URL
let FRONTEND_HOST
let FRONTEND_PORT

try {
  const url = new URL(FRONTEND_URL)
  FRONTEND_HOST = url.hostname
  FRONTEND_PORT = url.port || (url.protocol === 'https:' ? '443' : '80')
} catch (error) {
  console.error('❌ Erreur: NEXT_PUBLIC_FRONTEND_URL doit être une URL valide (ex: http://127.0.0.1:3000 ou http://example.com:3000)')
  process.exit(1)
}

console.log('🧪 ========== TEST API CHAT ==========\n')
console.log(`📍 Configuration: ${FRONTEND_URL} (port: ${FRONTEND_PORT})`)

const testMessage = {
  message: 'salut',
  conversationHistory: [],
  maiContext: null
}

const postData = JSON.stringify(testMessage)

const options = {
  hostname: FRONTEND_HOST,
  port: parseInt(FRONTEND_PORT, 10),
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}

console.log('📤 Envoi de la requête...')
console.log(`   URL: ${FRONTEND_URL}/api/chat`)
console.log('   Message:', testMessage.message)
console.log('')

const req = http.request(options, (res) => {
  console.log(`📥 Réponse reçue - Status: ${res.statusCode} ${res.statusMessage}`)
  console.log('   Headers:', res.headers)
  console.log('')

  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('📄 Corps de la réponse:')
    try {
      const json = JSON.parse(data)
      console.log(JSON.stringify(json, null, 2))
      
      if (json.error) {
        console.log('\n❌ ERREUR DÉTECTÉE:')
        console.log('   Type:', json.type)
        console.log('   Message:', json.error)
        console.log('   Détails:', json.details)
        process.exit(1)
      } else if (json.success && json.message) {
        console.log('\n✅ SUCCÈS!')
        console.log('   Réponse:', json.message.substring(0, 100) + (json.message.length > 100 ? '...' : ''))
        process.exit(0)
      } else {
        console.log('\n⚠️ Réponse inattendue')
        process.exit(1)
      }
    } catch (e) {
      console.log('   (Réponse non-JSON)')
      console.log(data)
      process.exit(1)
    }
  })
})

req.on('error', (e) => {
  console.error('❌ Erreur de requête:', e.message)
  console.error(`   Assurez-vous que le serveur Next.js est démarré sur ${FRONTEND_URL}`)
  process.exit(1)
})

req.write(postData)
req.end()

