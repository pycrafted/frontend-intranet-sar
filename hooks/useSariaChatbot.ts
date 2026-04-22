import { useState, useCallback, useEffect } from 'react'
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
  isMaintenance: boolean
}

export interface SariaChatbotActions {
  toggleChat: () => void
  sendMessage: (content: string, file?: File) => void
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
    loadingPhase: 'searching',
    isMaintenance: false
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

  const sendMessage = useCallback(async (content: string, file?: File) => {
    const messageId = Date.now().toString()
    console.log(`\n🤖 [MAI-CHATBOT] ========== NOUVEAU MESSAGE [${messageId}] ==========`)
    
    if (!content.trim() && !file) {
      console.log(`⚠️ [MAI-CHATBOT] [${messageId}] Message vide sans fichier, ignoré`)
      return
    }

    console.log(`📝 [MAI-CHATBOT] [${messageId}] Message utilisateur:`, content.trim().substring(0, 100) + (content.trim().length > 100 ? '...' : ''))

    // Ajouter le message de l'utilisateur
    const displayContent = file
      ? (content.trim() ? `${content.trim()}\n📎 ${file.name}` : `📎 ${file.name}`)
      : content.trim()
    addMessage({
      content: displayContent,
      sender: 'user'
    })
    console.log(`✅ [MAI-CHATBOT] [${messageId}] Message utilisateur ajouté à l'historique`)

    // Démarrer les messages de chargement intelligents
    console.log(`⏳ [MAI-CHATBOT] [${messageId}] Démarrage des messages de chargement...`)
    await startLoading(content.trim(), 2000)
    
    // Activer l'indicateur de frappe
    setState(prev => ({ 
      ...prev, 
      isTyping: true,
      loadingMessage: currentLoadingMessage,
      loadingPhase: loadingPhase
    }))
    console.log(`⏳ [MAI-CHATBOT] [${messageId}] Indicateur de frappe activé`)

    try {
      // Convertir l'historique des messages pour Claude
      console.log(`🔄 [MAI-CHATBOT] [${messageId}] Conversion de l'historique (${state.messages.length} messages)...`)
      const claudeMessages = claudeAPI.convertToClaudeMessages(state.messages)
      console.log(`🔄 [MAI-CHATBOT] [${messageId}] Historique converti:`, claudeMessages.length, 'messages Claude')
      
      // Appeler l'API Claude
      console.log(`🌐 [MAI-CHATBOT] [${messageId}] Appel à claudeAPI.sendMessage...`)
      const response = await claudeAPI.sendMessage(content.trim(), claudeMessages, file)
      console.log(`✅ [MAI-CHATBOT] [${messageId}] Réponse reçue de Claude (longueur:`, response.length, 'caractères)')
      
      // Détecter si MAÏ est en maintenance
      const maintenance = response === 'MAÏ est actuellement en maintenance. Veuillez réessayer dans quelques instants.'
      setState(prev => ({ ...prev, isMaintenance: maintenance }))

      // Ajouter la réponse de MAÏ
      addMessage({
        content: response,
        sender: 'mai'
      })
      console.log(`✅ [MAI-CHATBOT] [${messageId}] Réponse ajoutée à l'historique`)
      console.log(`✅ [MAI-CHATBOT] [${messageId}] ========== MESSAGE TRAITÉ AVEC SUCCÈS ==========\n`)
      
    } catch (error) {
      console.error(`\n❌ [MAI-CHATBOT] [${messageId}] ========== ERREUR ==========`)
      console.error(`❌ [MAI-CHATBOT] [${messageId}] Type:`, error instanceof Error ? error.constructor.name : typeof error)
      console.error(`❌ [MAI-CHATBOT] [${messageId}] Message:`, error instanceof Error ? error.message : String(error))
      console.error(`❌ [MAI-CHATBOT] [${messageId}] Stack:`, error instanceof Error ? error.stack : 'N/A')
      
      // Utiliser les réponses de fallback intelligentes
      console.log(`🔄 [MAI-CHATBOT] [${messageId}] Utilisation de la réponse de fallback...`)
      const fallbackResponse = findFallbackResponse(content.trim())
      console.log(`✅ [MAI-CHATBOT] [${messageId}] Réponse de fallback générée (longueur:`, fallbackResponse.length, 'caractères)')
      
      addMessage({
        content: fallbackResponse,
        sender: 'mai'
      })
      console.log(`✅ [MAI-CHATBOT] [${messageId}] Réponse de fallback ajoutée`)
      console.log(`✅ [MAI-CHATBOT] [${messageId}] ========== ERREUR GÉRÉE ==========\n`)
    } finally {
      // Arrêter les messages de chargement
      stopLoading()
      console.log(`⏹️ [MAI-CHATBOT] [${messageId}] Messages de chargement arrêtés`)
      
      // Désactiver l'indicateur de frappe
      setState(prev => ({ 
        ...prev, 
        isTyping: false,
        loadingMessage: '',
        loadingPhase: 'searching'
      }))
      console.log(`⏹️ [MAI-CHATBOT] [${messageId}] Indicateur de frappe désactivé`)
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
