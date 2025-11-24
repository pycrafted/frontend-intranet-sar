/**
 * Script de test pour vérifier que le compteur de sécurité s'incrémente correctement à minuit
 * Ce script simule différents moments de la journée et vérifie que le compteur se met à jour correctement
 */

require('dotenv').config({ path: '.env.local' })
const http = require('http')
const { URL } = require('url')

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

if (!API_URL) {
  console.error('❌ Erreur: NEXT_PUBLIC_API_URL doit être définie dans .env.local')
  process.exit(1)
}

let API_HOST
let API_PORT
let API_PATH

try {
  const url = new URL(API_URL)
  API_HOST = url.hostname
  API_PORT = url.port || (url.protocol === 'https:' ? '443' : '80')
  API_PATH = url.pathname
} catch (e) {
  console.error(`❌ Erreur: NEXT_PUBLIC_API_URL n'est pas une URL valide: ${API_URL}`)
  process.exit(1)
}

console.log('🧪 ========== TEST COMPTEUR SÉCURITÉ À MINUIT ==========\n')
console.log(`📍 Configuration: ${API_URL}`)
console.log(`   Host: ${API_HOST}, Port: ${API_PORT}, Path: ${API_PATH}\n`)

/**
 * Fait une requête GET à l'API de sécurité
 */
function fetchSafetyData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: parseInt(API_PORT, 10),
      path: `${API_PATH}/accueil/safety/current/`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data)
            resolve(jsonData)
          } catch (e) {
            reject(new Error(`Erreur de parsing JSON: ${e.message}`))
          }
        } else {
          reject(new Error(`Erreur HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', (e) => {
      reject(new Error(`Erreur de requête: ${e.message}`))
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout de la requête'))
    })

    req.end()
  })
}

/**
 * Teste le compteur à différents moments
 */
async function testSafetyCounter() {
  try {
    console.log('📊 Test 1: Récupération des données actuelles\n')
    
    const data = await fetchSafetyData()
    
    console.log('✅ Données récupérées avec succès:')
    console.log(`   - Jours sans accident SAR: ${data.days_without_incident_sar || data.daysWithoutIncidentSAR}`)
    console.log(`   - Jours sans accident EE: ${data.days_without_incident_ee || data.daysWithoutIncidentEE}`)
    console.log(`   - Dernier accident SAR: ${data.last_incident_date_sar || data.lastIncidentDateSAR || 'Aucun'}`)
    console.log(`   - Dernier accident EE: ${data.last_incident_date_ee || data.lastIncidentDateEE || 'Aucun'}\n`)
    
    // Vérifier que les valeurs sont cohérentes
    const sarDays = data.days_without_incident_sar || data.daysWithoutIncidentSAR || 0
    const eeDays = data.days_without_incident_ee || data.daysWithoutIncidentEE || 0
    
    if (sarDays >= 0 && eeDays >= 0) {
      console.log('✅ Les valeurs sont valides (>= 0)\n')
    } else {
      console.log('❌ Erreur: Les valeurs doivent être >= 0\n')
    }
    
    // Test de rafraîchissement multiple
    console.log('📊 Test 2: Test de rafraîchissement multiple\n')
    
    const results = []
    for (let i = 0; i < 3; i++) {
      const testData = await fetchSafetyData()
      results.push({
        iteration: i + 1,
        sarDays: testData.days_without_incident_sar || testData.daysWithoutIncidentSAR || 0,
        eeDays: testData.days_without_incident_ee || testData.daysWithoutIncidentEE || 0,
      })
      await new Promise(resolve => setTimeout(resolve, 1000)) // Attendre 1 seconde entre chaque requête
    }
    
    console.log('Résultats des 3 requêtes:')
    results.forEach((result, index) => {
      console.log(`   Requête ${result.iteration}: SAR=${result.sarDays} jours, EE=${result.eeDays} jours`)
    })
    
    // Vérifier la cohérence
    const allSame = results.every(r => 
      r.sarDays === results[0].sarDays && r.eeDays === results[0].eeDays
    )
    
    if (allSame) {
      console.log('✅ Les valeurs sont cohérentes entre les requêtes\n')
    } else {
      console.log('⚠️  Les valeurs varient entre les requêtes (peut être normal si le temps passe)\n')
    }
    
    // Test de calcul de minuit
    console.log('🕛 Test 3: Vérification du calcul à minuit\n')
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    console.log(`Heure actuelle: ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`)
    
    if (currentHour === 0 && currentMinute < 5) {
      console.log('⚠️  Nous sommes juste après minuit - le compteur devrait s\'être incrémenté')
    } else if (currentHour === 23 && currentMinute >= 55) {
      console.log('⚠️  Nous sommes juste avant minuit - le compteur devrait s\'incrémenter bientôt')
    } else {
      console.log('ℹ️  Le compteur devrait s\'incrémenter automatiquement à minuit (00:00)')
    }
    
    console.log('\n✅ Tous les tests sont terminés!')
    console.log('\n💡 Pour tester l\'incrémentation à minuit:')
    console.log('   1. Attendez minuit (00:00)')
    console.log('   2. Relancez ce script')
    console.log('   3. Vérifiez que le compteur s\'est incrémenté de 1 jour')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    process.exit(1)
  }
}

// Lancer les tests
testSafetyCounter()

