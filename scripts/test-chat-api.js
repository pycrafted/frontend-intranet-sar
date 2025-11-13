const http = require('http')

console.log('🧪 ========== TEST API CHAT ==========\n')

const testMessage = {
  message: 'salut',
  conversationHistory: [],
  maiContext: null
}

const postData = JSON.stringify(testMessage)

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}

console.log('📤 Envoi de la requête...')
console.log('   URL: http://localhost:3001/api/chat')
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
  console.error('   Assurez-vous que le serveur Next.js est démarré sur http://localhost:3001')
  process.exit(1)
})

req.write(postData)
req.end()

