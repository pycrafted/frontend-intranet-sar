import { useState, useCallback } from 'react'
import { claudeAPI } from '@/lib/claude-api'
import { config } from '@/lib/config'
import { findFallbackResponse } from '@/lib/fallback-responses'
import { useLoadingMessages } from './useLoadingMessages'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'mai'
  timestamp: Date
  isTyping?: boolean
}

export interface SariaChatbotState {
  isOpen: boolean
  messages: Message[]
  isTyping: boolean
  loadingMessage: string
  loadingPhase: 'searching' | 'processing'
}

export interface SariaChatbotActions {
  toggleChat: () => void
  sendMessage: (content: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  clearMessages: () => void
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: config.chatbot.welcomeMessage,
    sender: 'mai',
    timestamp: new Date()
  }
]

export function useSariaChatbot() {
  const [state, setState] = useState<SariaChatbotState>({
    isOpen: false,
    messages: initialMessages,
    isTyping: false,
    loadingMessage: '',
    loadingPhase: 'searching'
  })

  const { startLoading, stopLoading, currentLoadingMessage, isLoading, loadingPhase } = useLoadingMessages()

  const toggleChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }))
  }, [])

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }))
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    const messageId = Date.now().toString()
    console.log(`\n🤖 [SARIA-CHATBOT] ========== NOUVEAU MESSAGE [${messageId}] ==========`)
    
    if (!content.trim()) {
      console.log(`⚠️ [SARIA-CHATBOT] [${messageId}] Message vide, ignoré`)
      return
    }

    console.log(`📝 [SARIA-CHATBOT] [${messageId}] Message utilisateur:`, content.trim().substring(0, 100) + (content.trim().length > 100 ? '...' : ''))

    // Ajouter le message de l'utilisateur
    addMessage({
      content: content.trim(),
      sender: 'user'
    })
    console.log(`✅ [SARIA-CHATBOT] [${messageId}] Message utilisateur ajouté à l'historique`)

    // Démarrer les messages de chargement intelligents
    console.log(`⏳ [SARIA-CHATBOT] [${messageId}] Démarrage des messages de chargement...`)
    await startLoading(content.trim(), 2000)
    
    // Activer l'indicateur de frappe
    setState(prev => ({ 
      ...prev, 
      isTyping: true,
      loadingMessage: currentLoadingMessage,
      loadingPhase: loadingPhase
    }))
    console.log(`⏳ [SARIA-CHATBOT] [${messageId}] Indicateur de frappe activé`)

    try {
      // Convertir l'historique des messages pour Claude
      console.log(`🔄 [SARIA-CHATBOT] [${messageId}] Conversion de l'historique (${state.messages.length} messages)...`)
      const claudeMessages = claudeAPI.convertToClaudeMessages(state.messages)
      console.log(`🔄 [SARIA-CHATBOT] [${messageId}] Historique converti:`, claudeMessages.length, 'messages Claude')
      
      // Appeler l'API Claude
      console.log(`🌐 [SARIA-CHATBOT] [${messageId}] Appel à claudeAPI.sendMessage...`)
      const response = await claudeAPI.sendMessage(content.trim(), claudeMessages)
      console.log(`✅ [SARIA-CHATBOT] [${messageId}] Réponse reçue de Claude (longueur:`, response.length, 'caractères)')
      
      // Ajouter la réponse de MAÏ
      addMessage({
        content: response,
        sender: 'mai'
      })
      console.log(`✅ [SARIA-CHATBOT] [${messageId}] Réponse ajoutée à l'historique`)
      console.log(`✅ [SARIA-CHATBOT] [${messageId}] ========== MESSAGE TRAITÉ AVEC SUCCÈS ==========\n`)
      
    } catch (error) {
      console.error(`\n❌ [SARIA-CHATBOT] [${messageId}] ========== ERREUR ==========`)
      console.error(`❌ [SARIA-CHATBOT] [${messageId}] Type:`, error instanceof Error ? error.constructor.name : typeof error)
      console.error(`❌ [SARIA-CHATBOT] [${messageId}] Message:`, error instanceof Error ? error.message : String(error))
      console.error(`❌ [SARIA-CHATBOT] [${messageId}] Stack:`, error instanceof Error ? error.stack : 'N/A')
      
      // Utiliser les réponses de fallback intelligentes
      console.log(`🔄 [SARIA-CHATBOT] [${messageId}] Utilisation de la réponse de fallback...`)
      const fallbackResponse = findFallbackResponse(content.trim())
      console.log(`✅ [SARIA-CHATBOT] [${messageId}] Réponse de fallback générée (longueur:`, fallbackResponse.length, 'caractères)')
      
      addMessage({
        content: fallbackResponse,
        sender: 'mai'
      })
      console.log(`✅ [SARIA-CHATBOT] [${messageId}] Réponse de fallback ajoutée`)
      console.log(`✅ [SARIA-CHATBOT] [${messageId}] ========== ERREUR GÉRÉE ==========\n`)
    } finally {
      // Arrêter les messages de chargement
      stopLoading()
      console.log(`⏹️ [SARIA-CHATBOT] [${messageId}] Messages de chargement arrêtés`)
      
      // Désactiver l'indicateur de frappe
      setState(prev => ({ 
        ...prev, 
        isTyping: false,
        loadingMessage: '',
        loadingPhase: 'searching'
      }))
      console.log(`⏹️ [SARIA-CHATBOT] [${messageId}] Indicateur de frappe désactivé`)
    }
  }, [addMessage, state.messages, startLoading, stopLoading, currentLoadingMessage, loadingPhase])

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: initialMessages
    }))
  }, [])

  return {
    ...state,
    toggleChat,
    sendMessage,
    addMessage,
    clearMessages
  }
}
