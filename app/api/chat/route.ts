import { NextRequest, NextResponse } from 'next/server'
import { loadEnvConfig } from '@next/env'
import { readFileSync } from 'fs'
import { join } from 'path'

// ⚠️ IMPORTANT: Charger explicitement les variables d'environnement depuis .env.local
// Next.js ne les charge pas automatiquement dans toutes les routes API
const projectDir = process.cwd()
console.log('📂 [CHAT API] ========== CHARGEMENT VARIABLES D\'ENVIRONNEMENT ==========')
console.log('📂 [CHAT API] Répertoire du projet:', projectDir)

// Méthode 1: loadEnvConfig de Next.js
const { loadedEnvFiles } = loadEnvConfig(projectDir)
console.log('📂 [CHAT API] Fichiers .env chargés par loadEnvConfig:', loadedEnvFiles.length)
if (loadedEnvFiles.length > 0) {
  console.log('✅ [CHAT API] Fichiers trouvés:', loadedEnvFiles.map(f => f.path).join(', '))
  loadedEnvFiles.forEach(file => {
    console.log(`📄 [CHAT API] Fichier ${file.path}:`, file.contents.substring(0, 200) + (file.contents.length > 200 ? '...' : ''))
  })
} else {
  console.warn('⚠️ [CHAT API] Aucun fichier .env trouvé par loadEnvConfig')
}

// Méthode 2: Lecture directe du fichier .env.local et parsing manuel
// ⚠️ IMPORTANT: loadEnvConfig ne charge PAS les variables dans process.env automatiquement
// Il faut les parser et les injecter manuellement
let envLocalContent = ''
let envLocalParsed: Record<string, string> = {}
try {
  const envLocalPath = join(projectDir, '.env.local')
  console.log('📄 [CHAT API] Tentative de lecture directe:', envLocalPath)
  envLocalContent = readFileSync(envLocalPath, 'utf-8')
  console.log('✅ [CHAT API] Fichier .env.local lu avec succès (', envLocalContent.length, 'caractères)')
  
  // Parser le contenu ligne par ligne
  // Gérer les cas : KEY=value, KEY="value", KEY='value', KEY=value # comment
  // ⚠️ IMPORTANT: Gérer l'encodage UTF-8 (le fichier doit être en UTF-8, pas UTF-16)
  const lines = envLocalContent.split(/\r?\n/)
  lines.forEach((line, index) => {
    // Nettoyer la ligne (retirer BOM UTF-8 si présent)
    let trimmedLine = line.trim()
    if (trimmedLine.charCodeAt(0) === 0xFEFF) {
      trimmedLine = trimmedLine.substring(1)
    }
    
    // Ignorer les lignes vides et les commentaires
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim()
        let value = trimmedLine.substring(equalIndex + 1).trim()
        
        // Retirer les guillemets si présents
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        // Retirer les commentaires en fin de ligne
        const commentIndex = value.indexOf('#')
        if (commentIndex > 0) {
          value = value.substring(0, commentIndex).trim()
        }
        
        envLocalParsed[key] = value
        if (key.includes('CLAUDE')) {
          console.log(`🔑 [CHAT API] Clé parsée depuis .env.local: ${key} = ${value.substring(0, 15)}... (${value.length} chars)`)
        }
      }
    }
  })
  console.log('📊 [CHAT API] Nombre total de variables parsées depuis .env.local:', Object.keys(envLocalParsed).length)
  console.log('📊 [CHAT API] Variables parsées:', Object.keys(envLocalParsed).join(', '))
} catch (error) {
  console.error('❌ [CHAT API] Erreur lors de la lecture de .env.local:', error instanceof Error ? error.message : String(error))
  console.error('❌ [CHAT API] Stack:', error instanceof Error ? error.stack : 'N/A')
}

// ⚠️ CRITIQUE: Injecter FORCÉMENT les variables dans process.env
// loadEnvConfig ne modifie PAS process.env, il faut le faire manuellement
Object.keys(envLocalParsed).forEach(key => {
  const oldValue = process.env[key]
  const newValue = envLocalParsed[key]
  
  // Toujours injecter, même si la variable existe déjà
  // Cela garantit que les variables du .env.local sont prioritaires
  process.env[key] = newValue
  
  if (key.includes('CLAUDE')) {
    console.log(`💉 [CHAT API] Variable ${key} FORCÉE dans process.env:`, {
      ancienne: oldValue ? `${oldValue.substring(0, 10)}... (${oldValue.length} chars)` : 'undefined',
      nouvelle: `${newValue.substring(0, 10)}... (${newValue.length} chars)`,
      remplacée: oldValue !== newValue
    })
  }
})

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

// Fonction pour obtenir la clé API Claude (chargée à chaque requête)
function getClaudeApiKey(): string {
  // Essayer d'abord CLAUDE_API_KEY (sans préfixe, pour les routes API)
  // Puis NEXT_PUBLIC_CLAUDE_API_KEY (pour compatibilité)
  // Puis depuis envLocalParsed
  const key = process.env.CLAUDE_API_KEY 
    || process.env.NEXT_PUBLIC_CLAUDE_API_KEY 
    || envLocalParsed.CLAUDE_API_KEY
    || envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY
    || ''
  
  return key
}

// Debug initial (une seule fois au chargement du module)
console.log('🔑 [CHAT API] ========== VÉRIFICATION FINALE ==========')
console.log('🔑 [CHAT API] Variables d\'env CLAUDE dans process.env:', Object.keys(process.env).filter(key => key.includes('CLAUDE')))
console.log('🔑 [CHAT API] CLAUDE_API_KEY dans process.env:', process.env.CLAUDE_API_KEY ? `Définie (${process.env.CLAUDE_API_KEY.length} chars)` : 'Non définie')
console.log('🔑 [CHAT API] NEXT_PUBLIC_CLAUDE_API_KEY dans process.env:', process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? `Définie (${process.env.NEXT_PUBLIC_CLAUDE_API_KEY.length} chars)` : 'Non définie')
console.log('🔑 [CHAT API] CLAUDE_API_KEY dans envLocalParsed:', envLocalParsed.CLAUDE_API_KEY ? `Définie (${envLocalParsed.CLAUDE_API_KEY.length} chars)` : 'Non définie')
console.log('🔑 [CHAT API] NEXT_PUBLIC_CLAUDE_API_KEY dans envLocalParsed:', envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY ? `Définie (${envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY.length} chars)` : 'Non définie')
const testKey = getClaudeApiKey()
console.log('🔑 [CHAT API] getClaudeApiKey() retourne:', testKey ? `Oui (${testKey.length} chars, préfixe: ${testKey.substring(0, 10)}...)` : 'Non')
console.log('🔑 [CHAT API] ============================================\n')

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString()
  console.log(`\n🚀 [CHAT API] ========== NOUVELLE REQUÊTE [${requestId}] ==========`)
  
  // Logs détaillés de l'état des variables d'environnement
  console.log(`🔍 [CHAT API] [${requestId}] ========== DIAGNOSTIC VARIABLES D'ENV ==========`)
  console.log(`🔍 [CHAT API] [${requestId}] process.env.CLAUDE_API_KEY existe:`, 'CLAUDE_API_KEY' in process.env)
  console.log(`🔍 [CHAT API] [${requestId}] process.env.CLAUDE_API_KEY valeur:`, process.env.CLAUDE_API_KEY ? `${process.env.CLAUDE_API_KEY.substring(0, 15)}... (${process.env.CLAUDE_API_KEY.length} chars)` : 'undefined')
  console.log(`🔍 [CHAT API] [${requestId}] process.env.NEXT_PUBLIC_CLAUDE_API_KEY existe:`, 'NEXT_PUBLIC_CLAUDE_API_KEY' in process.env)
  console.log(`🔍 [CHAT API] [${requestId}] process.env.NEXT_PUBLIC_CLAUDE_API_KEY valeur:`, process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? `${process.env.NEXT_PUBLIC_CLAUDE_API_KEY.substring(0, 15)}... (${process.env.NEXT_PUBLIC_CLAUDE_API_KEY.length} chars)` : 'undefined')
  console.log(`🔍 [CHAT API] [${requestId}] envLocalParsed.CLAUDE_API_KEY existe:`, 'CLAUDE_API_KEY' in envLocalParsed)
  console.log(`🔍 [CHAT API] [${requestId}] envLocalParsed.CLAUDE_API_KEY valeur:`, envLocalParsed.CLAUDE_API_KEY ? `${envLocalParsed.CLAUDE_API_KEY.substring(0, 15)}... (${envLocalParsed.CLAUDE_API_KEY.length} chars)` : 'undefined')
  console.log(`🔍 [CHAT API] [${requestId}] envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY existe:`, 'NEXT_PUBLIC_CLAUDE_API_KEY' in envLocalParsed)
  console.log(`🔍 [CHAT API] [${requestId}] envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY valeur:`, envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY ? `${envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY.substring(0, 15)}... (${envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY.length} chars)` : 'undefined')
  console.log(`🔍 [CHAT API] [${requestId}] Variables d'env CLAUDE dans process.env:`, Object.keys(process.env).filter(key => key.includes('CLAUDE')))
  console.log(`🔍 [CHAT API] [${requestId}] ===============================================`)
  
  // Charger la clé API à chaque requête
  const CLAUDE_API_KEY = getClaudeApiKey()
  
  console.log(`🔑 [CHAT API] [${requestId}] Clé API Claude chargée:`, CLAUDE_API_KEY ? 'Oui' : 'Non')
  console.log(`🔑 [CHAT API] [${requestId}] Longueur de la clé:`, CLAUDE_API_KEY?.length || 0)
  console.log(`🔑 [CHAT API] [${requestId}] Préfixe de la clé (premiers 10 chars):`, CLAUDE_API_KEY ? CLAUDE_API_KEY.substring(0, 10) + '...' : 'Aucune')
  console.log(`🔑 [CHAT API] [${requestId}] Source de la clé:`, 
    process.env.CLAUDE_API_KEY ? 'process.env.CLAUDE_API_KEY' :
    process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? 'process.env.NEXT_PUBLIC_CLAUDE_API_KEY' :
    envLocalParsed.CLAUDE_API_KEY ? 'envLocalParsed.CLAUDE_API_KEY' :
    envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY ? 'envLocalParsed.NEXT_PUBLIC_CLAUDE_API_KEY' :
    'Aucune source trouvée')
  
  try {
    // Vérifier la clé API avant de traiter la requête
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY.length === 0) {
      console.error(`❌ [CHAT API] [${requestId}] ERREUR CRITIQUE: Clé API Claude non définie!`)
      console.error(`❌ [CHAT API] [${requestId}] Variables d'env disponibles:`, Object.keys(process.env).filter(key => key.includes('CLAUDE')))
      console.error(`❌ [CHAT API] [${requestId}] Toutes les variables d'env (premiers 50):`, Object.keys(process.env).slice(0, 50))
      return NextResponse.json(
        { 
          error: 'Configuration API manquante',
          details: 'La clé API Claude n\'est pas configurée. Veuillez vérifier les variables d\'environnement dans .env.local et redémarrer le serveur Next.js.',
          type: 'configuration_error'
        },
        { status: 500 }
      )
    }

    console.log(`📥 [CHAT API] [${requestId}] Réception de la requête...`)
    const { message, conversationHistory = [], maiContext } = await request.json()
    
    console.log(`📝 [CHAT API] [${requestId}] Message reçu:`, message?.substring(0, 100) + (message?.length > 100 ? '...' : ''))
    console.log(`📝 [CHAT API] [${requestId}] Historique de conversation:`, conversationHistory?.length || 0, 'messages')
    console.log(`📝 [CHAT API] [${requestId}] Contexte MAI fourni:`, maiContext ? (maiContext.success ? 'Oui (succès)' : 'Oui (échec)') : 'Non')

    if (!message || typeof message !== 'string') {
      console.error(`❌ [CHAT API] [${requestId}] Message invalide ou manquant`)
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      )
    }

    // Construire l'historique de conversation
    const messages = [
       {
         role: "assistant",
         content: "Bonjour ! Je suis MAÏ, votre assistant virtuel de la SAR. Comment puis-je vous aider ?"
       },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ]

    // ============================================================
    // PROMPT SYSTÈME CORRIGÉ - VERSION AMÉLIORÉE
    // ============================================================
    let systemPrompt = `Tu es MAÏ, l'assistant virtuel spécialisé de la Société Africaine de Raffinage (SAR).

RÈGLES STRICTES - HIÉRARCHIE DES SOURCES :
1. PRIORITÉ ABSOLUE : Tu réponds UNIQUEMENT en te basant sur le dataset officiel SAR fourni dans le <contexte_sar> ci-dessous
2. Si l'information N'EST PAS explicitement présente dans le <contexte_sar> → tu réponds : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."
3. TU N'UTILISES JAMAIS tes connaissances générales, même pour :
   - Des calculs mathématiques (ex: 1+1)
   - Des questions générales (ex: capitale d'un pays)
   - Des informations qui ne concernent pas la SAR
   - Toute question en dehors du dataset SAR

COMMENT VÉRIFIER ET RÉPONDRE :
✅ ÉTAPE 1 : Vérifie si l'information existe dans le <contexte_sar> fourni
✅ ÉTAPE 2 : Si OUI → réponds de manière directe et factuelle
   - Commence directement par la réponse (pas de "selon", "il semble", "d'après")
   - Termine par [Source:  SAR] pour indiquer la provenance
   - Exemple : "La SAR compte 450 employés en 2024. [Source: Base de données SAR]"
✅ ÉTAPE 3 : Si NON ou si tu n'es PAS SÛR à 100% → réponds UNIQUEMENT :
   "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."

EXPRESSIONS INTERDITES (montrent de l'hésitation) :
❌ "Il semble que"
❌ "Peut-être"
❌ "Je pense que"
❌ "Probablement"
❌ "D'après ce que je vois"

EXPRESSIONS AUTORISÉES (montrent la source) :
✅ "Selon notre documentation"
✅ "D'après la base de données de la SAR"
✅ "[Source: Base de données SAR]"

CARACTÉRISTIQUES PROFESSIONNELLES :
- Ton formel et respectueux (niveau entreprise)
- Vocabulaire technique et précis
- Réponses structurées et méthodiques
- Concision et pertinence
- Pas de familiarités ni d'expressions informelles`

    // Ajouter le contexte MAI si disponible
    if (maiContext && maiContext.success && maiContext.context) {
      systemPrompt += `

<contexte_sar>
${maiContext.context}
</contexte_sar>

INSTRUCTIONS POUR CE CONTEXTE :
- Lis attentivement le <contexte_sar> ci-dessus
- Réponds UNIQUEMENT si l'information est explicitement présente dans ce contexte
- Termine toujours ta réponse par [Source: Base de données SAR]
- Si le contexte ne contient PAS l'information demandée, réponds : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."
- N'essaie PAS de compléter avec tes connaissances générales`
    } else {
      systemPrompt += `

⚠️ ATTENTION : Aucun contexte spécifique n'a été trouvé pour cette question dans la base de données de la SAR.

→ Tu DOIS répondre : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."

→ N'essaie PAS de répondre avec tes connaissances générales`
    }

    // Ajouter des exemples (few-shot learning)
    systemPrompt += `

EXEMPLES DE BONNES RÉPONSES :

📌 Exemple 1 - Question dans le dataset :
Question : "Quel est l'effectif de la SAR ?"
Contexte : <contexte_sar>La SAR compte 450 employés en 2024</contexte_sar>
✅ BONNE réponse : "La SAR compte 450 employés en 2024. [Source: Base de données SAR]"
❌ MAUVAISE réponse : "Il semble que la SAR ait environ 450 employés"

📌 Exemple 2 - Question hors dataset (calcul) :
Question : "Combien font 2+2 ?"
Contexte : <contexte_sar>[Aucune information sur 2+2]</contexte_sar>
✅ BONNE réponse : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."
❌ MAUVAISE réponse : "2+2 font 4"

📌 Exemple 3 - Question hors dataset (générale) :
Question : "Quelle est la capitale de la France ?"
Contexte : <contexte_sar>[Aucune information sur la France]</contexte_sar>
✅ BONNE réponse : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."
❌ MAUVAISE réponse : "La capitale de la France est Paris"

📌 Exemple 4 - Contexte vide :
Question : "Parlez-moi de la SAR"
Contexte : [AUCUN CONTEXTE FOURNI]
✅ BONNE réponse : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."
❌ MAUVAISE réponse : [Inventer des informations sur la SAR]

RÈGLE ABSOLUE FINALE :
Si tu as le MOINDRE DOUTE sur la présence de l'information dans le <contexte_sar>, réponds TOUJOURS par le message de reformulation. Il vaut mieux refuser de répondre que d'inventer ou d'utiliser tes connaissances générales.`

    console.log(`🌐 [CHAT API] [${requestId}] Appel à l'API Claude...`)
    console.log(`🌐 [CHAT API] [${requestId}] URL:`, CLAUDE_API_URL)
    console.log(`🌐 [CHAT API] [${requestId}] Modèle: claude-3-haiku-20240307`)
    console.log(`🌐 [CHAT API] [${requestId}] Nombre de messages:`, messages.length)
    console.log(`🌐 [CHAT API] [${requestId}] Longueur du prompt système:`, systemPrompt.length, 'caractères')
    console.log(`🌐 [CHAT API] [${requestId}] Clé API utilisée (préfixe):`, CLAUDE_API_KEY.substring(0, 10) + '...')
    
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: messages,
        system: systemPrompt
      })
    })

    console.log(`📡 [CHAT API] [${requestId}] Réponse reçue - Status:`, response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`❌ [CHAT API] [${requestId}] Erreur Claude API:`, JSON.stringify(errorData, null, 2))
      console.error(`❌ [CHAT API] [${requestId}] Status HTTP:`, response.status)
      console.error(`❌ [CHAT API] [${requestId}] Type d'erreur:`, errorData.error?.type)
      console.error(`❌ [CHAT API] [${requestId}] Message d'erreur:`, errorData.error?.message)
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Erreur lors de la communication avec Claude'
      let errorDetails = errorData.error?.message || 'Erreur inconnue'
      
      if (errorData.error?.type === 'invalid_request_error') {
        if (errorDetails.includes('credit balance')) {
          errorMessage = 'CREDIT_LOW'
        } else if (errorDetails.includes('model')) {
          errorMessage = 'MODEL_NOT_FOUND'
        }
      } else if (errorData.error?.type === 'not_found_error') {
        errorMessage = 'MODEL_NOT_FOUND'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          type: errorData.error?.type || 'unknown'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ [CHAT API] [${requestId}] Réponse Claude parsée avec succès`)
    console.log(`✅ [CHAT API] [${requestId}] Nombre de contenus:`, data.content?.length || 0)
    console.log(`✅ [CHAT API] [${requestId}] Modèle utilisé:`, data.model)
    console.log(`✅ [CHAT API] [${requestId}] Tokens utilisés:`, data.usage ? `Input: ${data.usage.input_tokens}, Output: ${data.usage.output_tokens}` : 'N/A')
    
    if (data.content && data.content.length > 0) {
      let responseText = data.content[0].text
      console.log(`✅ [CHAT API] [${requestId}] Réponse générée (premiers 100 chars):`, responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''))
      
      // ============================================================
      // VALIDATION POST-GÉNÉRATION (Sécurité supplémentaire)
      // ============================================================
      
      // Cas 1 : Pas de contexte MAI fourni
      if (!maiContext?.success || !maiContext?.context) {
        console.warn(`⚠️ [CHAT API] [${requestId}] Aucun contexte MAI fourni`)
        
        // Vérifier que Claude a bien répondu par le message de reformulation
        const messageReformulation = "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."
        
        if (!responseText.includes("Veuillez reformuler")) {
          console.warn(`⚠️ [CHAT API] [${requestId}] Claude a répondu sans contexte MAI - FORÇAGE du message de reformulation`)
          responseText = messageReformulation
        }
      }
      
      // Cas 2 : Contexte MAI fourni mais réponse suspecte
      else {
        // Supprimer toutes les variations possibles de la citation de source pour éviter les doublons
        const sourcePatterns = [
          /\[Source\s*:\s*Base de données SAR\]/gi,
          /\[Source\s*:\s*SAR\]/gi,
          /\[Source\s*:\s*Base de données\]/gi,
          /\[Source\s*:\s*SAR\]/gi
        ]
        
        // Supprimer toutes les occurrences existantes
        sourcePatterns.forEach(pattern => {
          responseText = responseText.replace(pattern, '').trim()
        })
        
        // Nettoyer les espaces multiples qui pourraient rester
        responseText = responseText.replace(/\s+/g, ' ').trim()
        
        // Ajouter la source une seule fois à la fin si la réponse ne demande pas de reformuler
        if (!responseText.includes("Veuillez reformuler")) {
          responseText += " [Source: Base de données SAR]"
        }
        
        // Vérifier que Claude n'a pas utilisé des expressions interdites
        const expressionsInterdites = [
          "il semble que",
          "peut-être",
          "je pense que",
          "probablement",
          "d'après ce que je vois"
        ]
        
        const expressionTrouvee = expressionsInterdites.find(expr => 
          responseText.toLowerCase().includes(expr)
        )
        
        if (expressionTrouvee) {
          console.warn(`⚠️ [CHAT API] [${requestId}] Expression hésitante détectée: "${expressionTrouvee}"`)
          // On laisse passer mais on log pour monitoring
        }
      }
      
      console.log(`✅ [CHAT API] [${requestId}] ========== REQUÊTE RÉUSSIE ==========\n`)
      
      return NextResponse.json({
        success: true,
        message: responseText
      })
    } else {
      console.error(`❌ [CHAT API] [${requestId}] Aucun contenu dans la réponse Claude`)
      console.error(`❌ [CHAT API] [${requestId}] Données reçues:`, JSON.stringify(data, null, 2))
      return NextResponse.json(
        { error: 'Aucune réponse reçue de Claude' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error(`\n❌ [CHAT API] [${requestId}] ========== ERREUR EXCEPTION ==========`)
    console.error(`❌ [CHAT API] [${requestId}] Type d'erreur:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(`❌ [CHAT API] [${requestId}] Message:`, error instanceof Error ? error.message : String(error))
    console.error(`❌ [CHAT API] [${requestId}] Stack:`, error instanceof Error ? error.stack : 'N/A')
    console.error(`❌ [CHAT API] [${requestId}] ======================================\n`)
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        type: 'server_error'
      },
      { status: 500 }
    )
  }
}