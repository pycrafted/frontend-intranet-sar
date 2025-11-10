import { useState, useCallback, useRef } from 'react'

export interface LoadingMessage {
  id: string
  content: string
  phase: 'searching' | 'processing'
  timestamp: Date
}

export interface LoadingMessageService {
  getLoadingMessage: (question: string, phase: 'searching' | 'processing') => Promise<string>
  getProgressiveLoading: (question: string, duration: number) => Promise<LoadingMessage[]>
  getQuickLoadingMessage: (question: string) => Promise<string>
}

import { getApiBaseUrl } from '@/lib/config'

class LoadingMessageServiceImpl implements LoadingMessageService {
  private getBaseUrl(): string {
    return getApiBaseUrl()
  }

  async getLoadingMessage(question: string, phase: 'searching' | 'processing'): Promise<string> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/mai/loading-message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          phase
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('Erreur lors de la récupération du message de chargement:', error)
      // Messages de fallback
      const fallbackMessages = {
        searching: [
          "🔍 Recherche dans la base de connaissances...",
          "📚 Consultation des documents SAR...",
          "🧠 Analyse de votre question...",
          "⚡ Traitement en cours...",
          "📖 Parcours de la documentation...",
          "🔎 Exploration des données...",
          "💡 Recherche de la meilleure réponse...",
          "📋 Vérification des informations...",
          "🎯 Identification de la solution...",
          "📊 Analyse des données SAR...",
        ],
        processing: [
          "⚙️ Traitement de votre demande...",
          "🔄 Génération de la réponse...",
          "📝 Préparation de l'information...",
          "✨ Finalisation de la réponse...",
          "🎨 Mise en forme des données...",
          "📤 Assemblage de la réponse...",
          "🔧 Optimisation du contenu...",
          "📋 Structuration de l'information...",
          "🎯 Personnalisation de la réponse...",
          "💫 Finalisation en cours...",
        ]
      }
      
      const messages = fallbackMessages[phase]
      return messages[Math.floor(Math.random() * messages.length)]
    }
  }

  async getProgressiveLoading(question: string, duration: number): Promise<LoadingMessage[]> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/mai/progressive-loading/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          duration
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.messages.map((msg: any, index: number) => ({
        id: `loading-${index}`,
        content: msg.message,
        phase: msg.phase,
        timestamp: new Date()
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des messages progressifs:', error)
      // Fallback vers des messages simples
      return [
        {
          id: 'loading-1',
          content: "🔍 Recherche en cours...",
          phase: 'searching' as const,
          timestamp: new Date()
        },
        {
          id: 'loading-2',
          content: "⚙️ Traitement de la réponse...",
          phase: 'processing' as const,
          timestamp: new Date()
        }
      ]
    }
  }

  async getQuickLoadingMessage(question: string): Promise<string> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/mai/quick-loading/?question=${encodeURIComponent(question)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('Erreur lors de la récupération du message rapide:', error)
      // Messages de fallback rapides
      const quickMessages = [
        "⚡ Recherche rapide...",
        "🔍 Consultation...",
        "📚 Vérification...",
        "💡 Analyse...",
        "🎯 Identification...",
        "📋 Contrôle...",
        "✨ Traitement...",
        "🔄 Génération...",
      ]
      return quickMessages[Math.floor(Math.random() * quickMessages.length)]
    }
  }
}

const loadingService = new LoadingMessageServiceImpl()

export function useLoadingMessages() {
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<'searching' | 'processing'>('searching')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(async (question: string, duration: number = 2000) => {
    setIsLoading(true)
    setLoadingPhase('searching')

    try {
      // Démarrer avec un message de recherche
      const searchMessage = await loadingService.getLoadingMessage(question, 'searching')
      setCurrentLoadingMessage(searchMessage)

      // Changer de phase après 60% du temps
      const switchTime = duration * 0.6
      setTimeout(async () => {
        setLoadingPhase('processing')
        const processMessage = await loadingService.getLoadingMessage(question, 'processing')
        setCurrentLoadingMessage(processMessage)
      }, switchTime)

      // Changer de message toutes les 500ms
      let messageIndex = 0
      intervalRef.current = setInterval(async () => {
        try {
          const newMessage = await loadingService.getLoadingMessage(question, loadingPhase)
          setCurrentLoadingMessage(newMessage)
        } catch (error) {
          console.error('Erreur lors du changement de message:', error)
        }
      }, 500)

    } catch (error) {
      console.error('Erreur lors du démarrage du chargement:', error)
      setCurrentLoadingMessage("⚡ Traitement en cours...")
    }
  }, [loadingPhase])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setCurrentLoadingMessage('')
    setLoadingPhase('searching')
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const getQuickMessage = useCallback(async (question: string): Promise<string> => {
    try {
      return await loadingService.getQuickLoadingMessage(question)
    } catch (error) {
      console.error('Erreur lors de la récupération du message rapide:', error)
      return "⚡ Recherche rapide..."
    }
  }, [])

  return {
    currentLoadingMessage,
    isLoading,
    loadingPhase,
    startLoading,
    stopLoading,
    getQuickMessage
  }
}

