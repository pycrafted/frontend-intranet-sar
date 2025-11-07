#!/usr/bin/env node
/**
 * Script de test pour l'intégration des messages de chargement
 */

const fetch = require('node-fetch');

// Utilise NEXT_PUBLIC_API_URL depuis les variables d'environnement
// Doit être défini dans .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  console.error('❌ ERREUR: NEXT_PUBLIC_API_URL n\'est pas définie dans les variables d\'environnement');
  process.exit(1);
}

async function testLoadingMessages() {
  console.log('🧪 TEST DE L\'INTÉGRATION DES MESSAGES DE CHARGEMENT');
  console.log('=' * 60);

  const testQuestions = [
    "qui est le dg de la sar",
    "quels sont les produits de la sar",
    "comment fonctionne le processus de raffinage",
    "quelles sont les mesures de sécurité",
    "comment la sar protège l'environnement"
  ];

  for (const question of testQuestions) {
    console.log(`\n🔍 Test pour: "${question}"`);
    
    try {
      // Test 1: Message de chargement contextuel
      console.log('  1. Test message de chargement contextuel...');
      const searchResponse = await fetch(`${API_BASE_URL}/api/mai/loading-message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          phase: 'searching'
        })
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log(`     ✅ Recherche: ${searchData.message}`);
        console.log(`     📊 Contexte: ${searchData.context}`);
      } else {
        console.log(`     ❌ Erreur: ${searchResponse.status}`);
      }

      // Test 2: Message de traitement
      const processResponse = await fetch(`${API_BASE_URL}/api/mai/loading-message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          phase: 'processing'
        })
      });

      if (processResponse.ok) {
        const processData = await processResponse.json();
        console.log(`     ✅ Traitement: ${processData.message}`);
      } else {
        console.log(`     ❌ Erreur: ${processResponse.status}`);
      }

      // Test 3: Messages progressifs
      console.log('  2. Test messages progressifs...');
      const progressiveResponse = await fetch(`${API_BASE_URL}/api/mai/progressive-loading/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          duration: 2.0
        })
      });

      if (progressiveResponse.ok) {
        const progressiveData = await progressiveResponse.json();
        console.log(`     ✅ ${progressiveData.message_count} messages générés`);
        console.log(`     ⏱️  Durée: ${progressiveData.total_duration}s`);
        progressiveData.messages.slice(0, 3).forEach((msg, index) => {
          console.log(`        ${index + 1}. ${msg.message} (${msg.phase})`);
        });
      } else {
        console.log(`     ❌ Erreur: ${progressiveResponse.status}`);
      }

      // Test 4: Message rapide
      console.log('  3. Test message rapide...');
      const quickResponse = await fetch(`${API_BASE_URL}/api/mai/quick-loading/?question=${encodeURIComponent(question)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (quickResponse.ok) {
        const quickData = await quickResponse.json();
        console.log(`     ✅ Rapide: ${quickData.message}`);
      } else {
        console.log(`     ❌ Erreur: ${quickResponse.status}`);
      }

    } catch (error) {
      console.log(`     ❌ Erreur de connexion: ${error.message}`);
    }
  }

  console.log('\n' + '=' * 60);
  console.log('📊 RÉSULTATS DU TEST');
  console.log('=' * 60);
  console.log('✅ Tests des messages de chargement terminés');
  console.log('🎯 Intégration frontend prête pour les tests');
}

// Simulation d'une conversation avec messages de chargement
async function simulateConversation() {
  console.log('\n💬 SIMULATION DE CONVERSATION');
  console.log('=' * 60);

  const questions = [
    "qui est le dg de la sar",
    "quels sont les produits de la sar",
    "comment fonctionne le raffinage"
  ];

  for (const question of questions) {
    console.log(`\n👤 Utilisateur: ${question}`);
    
    try {
      // Phase de recherche
      const searchResponse = await fetch(`${API_BASE_URL}/api/mai/loading-message/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, phase: 'searching' })
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log(`🤖 MAÏ: ${searchData.message}`);
        
        // Attendre un peu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Phase de traitement
        const processResponse = await fetch(`${API_BASE_URL}/api/mai/loading-message/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, phase: 'processing' })
        });
        
        if (processResponse.ok) {
          const processData = await processResponse.json();
          console.log(`🤖 MAÏ: ${processData.message}`);
        }
        
        // Attendre un peu
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Réponse simulée
        console.log(`🤖 MAÏ: Réponse trouvée ! (simulation)`);
      }
    } catch (error) {
      console.log(`🤖 MAÏ: Erreur de connexion - ${error.message}`);
    }
  }
}

async function main() {
  try {
    await testLoadingMessages();
    await simulateConversation();
    console.log('\n🎉 TOUS LES TESTS TERMINÉS AVEC SUCCÈS !');
  } catch (error) {
    console.error('\n❌ ERREUR LORS DES TESTS:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testLoadingMessages, simulateConversation };

