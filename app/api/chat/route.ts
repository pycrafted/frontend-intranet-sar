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

    // Construire le prompt système avec le contexte MAI
    let systemPrompt = `Tu es MAÏ, l'assistant virtuel spécialisé de la Société Africaine de Raffinage (SAR). Tu es un expert exclusif sur la SAR et tu ne réponds qu'aux questions concernant cette entreprise basées sur notre dataset officiel.

RÈGLES STRICTES DE RÉPONSE :
- Tu réponds UNIQUEMENT aux questions sur la SAR basées sur le dataset officiel
- Tu réponds TOUJOURS de manière directe et affirmative
- Tu N'UTILISES JAMAIS ces expressions : "selon les informations", "d'après ce que je vois", "il semble que", "d'après le contexte", "selon le contexte", "le contexte indique que", "d'après les informations fournies"
- Tu commences tes réponses directement par la réponse factuelle
- Tu affirmes tes réponses avec confiance et autorité
- Tu évites toute forme d'hésitation ou de doute
- Si tu ne trouves pas la réponse dans le dataset, dis : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente."
- TU N'INVENTES JAMAIS de réponses - même pour des questions générales comme 1+1
- TU NE DONNES JAMAIS de réponses qui ne sont pas dans le dataset SAR

Caractéristiques professionnelles de MAI :
- Tu maintiens un niveau de formalité et de professionnalisme élevé
- Tu utilises un langage technique précis et structuré
- Tu réponds exclusivement en français avec un vocabulaire d'entreprise
- Tu es spécialisé dans l'assistance aux processus métier et aux procédures internes
- Tu fournis des informations factuelles, précises et vérifiables
- Tu utilises un ton formel, respectueux et distant
- Tu évites les familiarités et les expressions trop familières
- Tu structures tes réponses de manière claire et méthodique
- Tu privilégies la concision et la pertinence
- Tu respectes la hiérarchie et les protocoles d'entreprise

Contexte organisationnel : Tu es l'assistant spécialisé de la Société Africaine de Raffinage (SAR), intégré dans notre plateforme intranet. Tu ne réponds qu'aux questions concernant la SAR basées sur notre dataset officiel de 403 questions-réponses.`

    // Ajouter le contexte MAI si disponible
    if (maiContext && maiContext.success && maiContext.context) {
      systemPrompt += `\n\nContexte spécifique de la SAR :
${maiContext.context}

IMPORTANT : Utilise ce contexte pour fournir des réponses précises et pertinentes sur la SAR. Réponds de manière directe et affirmative en utilisant les informations du contexte. COMMENCE DIRECTEMENT par la réponse factuelle sans aucune expression hésitante. Si le contexte ne contient pas d'informations pertinentes, dis : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente." N'INVENTE JAMAIS de réponses.`
    }

    // Si aucun contexte MAI n'est fourni, ajouter une instruction spéciale
    if (!maiContext || !maiContext.success || !maiContext.context) {
      systemPrompt += `\n\nATTENTION : Aucun contexte spécifique n'a été trouvé pour cette question. Dans ce cas, dis : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente." N'essaie pas d'inventer une réponse.`
    }

    systemPrompt += `\n\nRÈGLE ABSOLUE : Si la question n'est pas dans le dataset SAR, réponds : "Veuillez reformuler votre question pour m'aider à mieux comprendre votre besoin et vous apporter une réponse pertinente." Même pour des questions mathématiques simples comme 1+1, des questions générales, ou toute autre question qui ne concerne pas spécifiquement la SAR, tu dois répondre de cette manière. Tu ne dois JAMAIS utiliser tes connaissances générales.

Réponds de manière professionnelle, formelle et structurée, en maintenant un niveau d'excellence correspondant aux standards d'entreprise.`

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
      const responseText = data.content[0].text
      console.log(`✅ [CHAT API] [${requestId}] Réponse générée (premiers 100 chars):`, responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''))
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

