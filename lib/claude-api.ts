// Service API pour Claude
import { config } from './config'

export interface ClaudeMessage {
  role: "user" | "assistant"
  content: string
}

export interface ClaudeResponse {
  content: Array<{
    type: "text"
    text: string
  }>
  id: string
  model: string
  role: string
  stop_reason: string
  stop_sequence: null | string
  type: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export interface ClaudeError {
  error: {
    type: string
    message: string
  }
}

export interface MAIContext {
  context: string
  query: string
  success: boolean
}

export class ClaudeAPI {
  private apiKey: string
  private apiUrl: string
  private model: string
  private maxTokens: number
  private maxHistory: number

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.apiUrl = config.claude.apiUrl
    this.model = config.claude.model
    this.maxTokens = config.claude.maxTokens
    this.maxHistory = config.claude.maxHistory
  }

  async sendMessage(
    message: string,
    conversationHistory: ClaudeMessage[] = []
  ): Promise<string> {
    const requestId = Date.now().toString()
    console.log(`\n💬 [CLAUDE-API] ========== NOUVELLE REQUÊTE [${requestId}] ==========`)
    console.log(`💬 [CLAUDE-API] [${requestId}] Message original:`, message?.substring(0, 100) + (message?.length > 100 ? '...' : ''))
    console.log(`💬 [CLAUDE-API] [${requestId}] Historique:`, conversationHistory.length, 'messages')
    
    try {
      // Récupérer le contexte MAI
      console.log(`🔍 [CLAUDE-API] [${requestId}] Récupération du contexte MAI...`)
      const maiContext = await this.retrieveMAIContext(message)
      console.log(`🔍 [CLAUDE-API] [${requestId}] Contexte MAI récupéré:`, {
        success: maiContext.success,
        contextLength: maiContext.context?.length || 0,
        query: maiContext.query
      })
      
      // Construire le prompt avec le contexte
      const enhancedMessage = this.buildEnhancedPrompt(message, maiContext)
      console.log(`📝 [CLAUDE-API] [${requestId}] Message enrichi construit (longueur:`, enhancedMessage.length, 'caractères)')
      
      console.log(`🌐 [CLAUDE-API] [${requestId}] Appel à /api/chat...`)
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: enhancedMessage,
          conversationHistory: conversationHistory,
          maiContext: maiContext
        })
      })

      console.log(`📡 [CLAUDE-API] [${requestId}] Réponse reçue - Status:`, response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ [CLAUDE-API] [${requestId}] Erreur API Claude:`, JSON.stringify(errorData, null, 2))
        console.error(`❌ [CLAUDE-API] [${requestId}] Status HTTP:`, response.status)
        
        // Gestion spécifique des erreurs
        if (errorData.error === 'CREDIT_LOW') {
          throw new Error('CREDIT_LOW')
        } else if (errorData.error === 'MODEL_NOT_FOUND') {
          throw new Error('MODEL_NOT_FOUND')
        } else if (errorData.details && errorData.details.includes('credit balance')) {
          throw new Error('CREDIT_LOW')
        } else if (errorData.details && errorData.details.includes('model')) {
          throw new Error('MODEL_NOT_FOUND')
        }
        
        throw new Error(`Erreur API: ${errorData.details || errorData.error}`)
      }

      const data = await response.json()
      console.log(`✅ [CLAUDE-API] [${requestId}] Données reçues:`, {
        success: data.success,
        hasMessage: !!data.message,
        messageLength: data.message?.length || 0
      })
      
      if (data.success && data.message) {
        console.log(`✅ [CLAUDE-API] [${requestId}] Réponse générée (premiers 100 chars):`, data.message.substring(0, 100) + (data.message.length > 100 ? '...' : ''))
        console.log(`✅ [CLAUDE-API] [${requestId}] ========== REQUÊTE RÉUSSIE ==========\n`)
        return data.message
      } else {
        console.error(`❌ [CLAUDE-API] [${requestId}] Réponse invalide:`, data)
        throw new Error("Aucune réponse reçue de Claude")
      }

    } catch (error) {
      console.error(`\n❌ [CLAUDE-API] [${requestId}] ========== ERREUR EXCEPTION ==========`)
      console.error(`❌ [CLAUDE-API] [${requestId}] Type:`, error instanceof Error ? error.constructor.name : typeof error)
      console.error(`❌ [CLAUDE-API] [${requestId}] Message:`, error instanceof Error ? error.message : String(error))
      console.error(`❌ [CLAUDE-API] [${requestId}] Stack:`, error instanceof Error ? error.stack : 'N/A')
      console.error(`❌ [CLAUDE-API] [${requestId}] ======================================\n`)
      
      // Messages d'erreur personnalisés et informatifs
      if (error instanceof Error) {
        if (error.message === "CREDIT_LOW") {
          return "Un incident technique est survenu. Veuillez contacter le service informatique pour assistance."
        } else if (error.message === "MODEL_NOT_FOUND") {
          return "Un incident technique est survenu. Veuillez contacter le service informatique pour assistance."
        } else if (error.message.includes("rate limit")) {
          return "Je reçois actuellement un volume de demandes élevé. Veuillez réessayer dans quelques instants."
        } else if (error.message.includes("quota")) {
          return "Je suis temporairement indisponible. Veuillez réessayer ultérieurement."
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          return "Problème de connectivité réseau. Veuillez vérifier votre connexion internet et réessayer."
        } else if (error.message.includes("Configuration API manquante") || error.message.includes("clé API")) {
          return "Erreur de configuration système. Veuillez contacter le service informatique."
        } else if (error.message.includes("backend") || error.message.includes("404")) {
          return "Le service de recherche est temporairement indisponible. Veuillez réessayer dans quelques instants."
        }
      }
      
      // Message d'erreur générique amélioré
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`❌ [CLAUDE-API] Message d'erreur générique retourné pour:`, errorMsg)
      return "Je rencontre actuellement un problème technique. Veuillez reformuler votre demande ou réessayer dans quelques instants."
    }
  }

  // Convertir les messages du chatbot vers le format Claude
  convertToClaudeMessages(messages: Array<{sender: 'user' | 'mai', content: string}>): ClaudeMessage[] {
    return messages
      .filter(msg => msg.sender === 'user' || msg.sender === 'mai')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      .slice(-this.maxHistory) // Garder seulement les derniers messages pour éviter les tokens excessifs
  }

  /**
   * Récupérer le contexte RAG pour une requête
   */
  private async retrieveMAIContext(query: string): Promise<MAIContext> {
    const contextId = Date.now().toString()
    console.log(`🔍 [CLAUDE-API] [CONTEXT-${contextId}] Récupération du contexte RAG pour:`, query?.substring(0, 50) + (query?.length > 50 ? '...' : ''))
    
    try {
      console.log(`🌐 [CLAUDE-API] [CONTEXT-${contextId}] Appel à /api/rag/search...`)
      const response = await fetch('/api/rag/search', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          query: query,
          max_documents: 5
        })
      })

      console.log(`📡 [CLAUDE-API] [CONTEXT-${contextId}] Réponse RAG - Status:`, response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Impossible de lire la réponse')
        console.warn(`⚠️ [CLAUDE-API] [CONTEXT-${contextId}] Erreur lors de la récupération du contexte RAG:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 200)
        })
        return {
          context: '',
          query: query,
          success: false
        }
      }

      const data = await response.json()
      console.log(`✅ [CLAUDE-API] [CONTEXT-${contextId}] Contexte RAG récupéré:`, {
        success: data.success,
        contextLength: data.context?.length || 0,
        method: data.method,
        responseTime: data.response_time_ms
      })
      
      return {
        context: data.context || '',
        query: query,
        success: data.success || false
      }
    } catch (error) {
      console.warn(`⚠️ [CLAUDE-API] [CONTEXT-${contextId}] Erreur exception lors de la récupération du contexte RAG:`, {
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error)
      })
      return {
        context: '',
        query: query,
        success: false
      }
    }
  }

  /**
   * Construire un prompt enrichi avec le contexte MAI
   */
  private buildEnhancedPrompt(message: string, maiContext: MAIContext): string {
    if (!maiContext.success || !maiContext.context) {
      // Pas de contexte: ne pas autoriser l'usage de connaissances générales
      return `Question de l'utilisateur: ${message}

RÈGLE: Si l'information n'est pas strictement présente dans le dataset SAR, réponds exactement: "Je n'ai pas cette information".`
    }

    return `Contexte de l'entreprise:
${maiContext.context}

Question de l'utilisateur: ${message}

RÈGLES STRICTES : Réponds de manière directe et affirmative en utilisant UNIQUEMENT le contexte fourni. N'UTILISE JAMAIS ces expressions : "selon les informations", "d'après ce que je vois", "il semble que", "d'après le contexte", "selon le contexte", "le contexte indique que", "d'après les informations fournies". COMMENCE DIRECTEMENT par la réponse factuelle. Sois confiant et autoritaire dans tes réponses. Si le contexte ne contient pas l'information demandée, réponds exactement: "Je n'ai pas cette information".`
  }

  /**
   * Méthode alternative pour envoyer un message avec RAG explicite
   */
  async sendMessageWithRAG(
    message: string,
    conversationHistory: ClaudeMessage[] = []
  ): Promise<string> {
    try {
      // Récupérer le contexte RAG
      const ragContext = await this.retrieveRAGContext(message)
      
      // Construire le prompt avec le contexte
      const enhancedPrompt = this.buildEnhancedPrompt(message, ragContext)
      
      // Appeler Claude avec le contexte
      return await this.sendMessage(enhancedPrompt, conversationHistory)
    } catch (error) {
      console.error("Erreur lors de l'appel RAG:", error)
      // Fallback vers le système actuel
      return this.sendMessage(message, conversationHistory)
    }
  }
}

// Instance singleton
// ⚠️ La clé API doit être définie dans NEXT_PUBLIC_CLAUDE_API_KEY
// Si elle n'est pas définie, une chaîne vide sera utilisée et l'API échouera
export const claudeAPI = new ClaudeAPI(config.claude.apiKey || '')
