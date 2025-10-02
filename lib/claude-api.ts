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
    try {
      // Récupérer le contexte MAI
      const maiContext = await this.retrieveMAIContext(message)
      
      // Construire le prompt avec le contexte
      const enhancedMessage = this.buildEnhancedPrompt(message, maiContext)
      
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

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erreur API Claude:', errorData)
        
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
      
      if (data.success && data.message) {
        return data.message
      } else {
        throw new Error("Aucune réponse reçue de Claude")
      }

    } catch (error) {
      console.error("Erreur lors de l'appel à l'API chat:", error)
      
      // Messages d'erreur personnalisés
      if (error instanceof Error) {
        if (error.message === "CREDIT_LOW") {
          return "Mes crédits d'API sont actuellement épuisés. Veuillez contacter l'administrateur système pour recharger le compte Claude. En attendant, je peux vous fournir des informations générales concernant nos systèmes internes."
        } else if (error.message === "MODEL_NOT_FOUND") {
          return "Le modèle d'intelligence artificielle n'est pas disponible. L'administrateur système doit vérifier la configuration. En attendant, je peux vous assister avec des informations de base."
        } else if (error.message.includes("rate limit")) {
          return "Je reçois actuellement un volume de demandes élevé. Veuillez réessayer dans quelques instants."
        } else if (error.message.includes("quota")) {
          return "Je suis temporairement indisponible. Veuillez réessayer ultérieurement."
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          return "Problème de connectivité réseau. Veuillez vérifier votre connexion internet et réessayer."
        }
      }
      
      return "Je rencontre actuellement un problème technique. Veuillez reformuler votre demande."
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
    try {
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

      if (!response.ok) {
        console.warn('Erreur lors de la récupération du contexte RAG:', response.status)
        return {
          context: '',
          query: query,
          success: false
        }
      }

      const data = await response.json()
      return {
        context: data.context || '',
        query: query,
        success: data.success || false
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du contexte RAG:', error)
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
      return message
    }

    return `Contexte de l'entreprise:
${maiContext.context}

Question de l'utilisateur: ${message}

RÈGLES STRICTES : Réponds de manière directe et affirmative en utilisant le contexte fourni. N'UTILISE JAMAIS ces expressions : "selon les informations", "d'après ce que je vois", "il semble que", "d'après le contexte", "selon le contexte", "le contexte indique que", "d'après les informations fournies". COMMENCE DIRECTEMENT par la réponse factuelle. Sois confiant et autoritaire dans tes réponses. Si le contexte ne contient pas d'informations pertinentes, réponds de manière générale en utilisant tes connaissances générales tout en maintenant ton ton professionnel.`
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
export const claudeAPI = new ClaudeAPI(config.claude.apiKey)
