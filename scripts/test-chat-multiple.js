const http = require('http')

console.log('🧪 ========== TESTS MULTIPLES API CHAT ==========\n')

const tests = [
  { message: 'salut', expected: 'success' },
  { message: 'qui est le dg de la sar', expected: 'success' },
  { message: 'bonjour', expected: 'success' }
]

let completed = 0
let passed = 0
let failed = 0

function runTest(test, index) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      message: test.message,
      conversationHistory: [],
      maiContext: null
    })

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    }

    console.log(`\n📤 Test ${index + 1}/${tests.length}: "${test.message}"`)
    
    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        completed++
        try {
          const json = JSON.parse(data)
          
          if (res.statusCode === 200 && json.success && json.message) {
            console.log(`   ✅ SUCCÈS (${res.statusCode})`)
            console.log(`   Réponse: ${json.message.substring(0, 80)}...`)
            passed++
          } else if (json.error) {
            console.log(`   ❌ ERREUR (${res.statusCode})`)
            console.log(`   Type: ${json.type || 'unknown'}`)
            console.log(`   Message: ${json.error}`)
            if (json.details) {
              console.log(`   Détails: ${json.details.substring(0, 100)}...`)
            }
            failed++
          } else {
            console.log(`   ⚠️ Réponse inattendue (${res.statusCode})`)
            console.log(`   Données: ${JSON.stringify(json).substring(0, 100)}...`)
            failed++
          }
        } catch (e) {
          console.log(`   ❌ Erreur de parsing JSON`)
          console.log(`   Réponse brute: ${data.substring(0, 200)}...`)
          failed++
        }
        
        if (completed === tests.length) {
          printSummary()
        }
        resolve()
      })
    })
    
    req.on('error', (e) => {
      completed++
      failed++
      console.log(`   ❌ Erreur de connexion: ${e.message}`)
      if (completed === tests.length) {
        printSummary()
      }
      resolve()
    })
    
    req.on('timeout', () => {
      req.destroy()
      completed++
      failed++
      console.log(`   ❌ Timeout`)
      if (completed === tests.length) {
        printSummary()
      }
      resolve()
    })
    
    req.write(postData)
    req.end()
  })
}

function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSUMÉ DES TESTS')
  console.log('='.repeat(50))
  console.log(`Total: ${tests.length}`)
  console.log(`✅ Réussis: ${passed}`)
  console.log(`❌ Échoués: ${failed}`)
  console.log(`📈 Taux de réussite: ${((passed / tests.length) * 100).toFixed(1)}%`)
  console.log('='.repeat(50))
  
  if (failed === 0) {
    console.log('\n🎉 Tous les tests sont passés !')
    process.exit(0)
  } else {
    console.log('\n⚠️ Certains tests ont échoué')
    process.exit(1)
  }
}

// Lancer tous les tests
console.log(`Lancement de ${tests.length} tests...\n`)
tests.forEach((test, index) => {
  setTimeout(() => {
    runTest(test, index)
  }, index * 1000) // Espacer les requêtes de 1 seconde
})


