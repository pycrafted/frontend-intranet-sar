import { useState, useCallback } from 'react'
import { claudeAPI } from '@/lib/claude-api'
import { config } from '@/lib/config'
import { findFallbackResponse } from '@/lib/fallback-responses'

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
    isTyping: false
  })

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
    if (!content.trim()) return

    // Ajouter le message de l'utilisateur
    addMessage({
      content: content.trim(),
      sender: 'user'
    })

    // Activer l'indicateur de frappe
    setState(prev => ({ ...prev, isTyping: true }))

    try {
      // Convertir l'historique des messages pour Claude
      const claudeMessages = claudeAPI.convertToClaudeMessages(state.messages)
      
      // Appeler l'API Claude
      const response = await claudeAPI.sendMessage(content.trim(), claudeMessages)
      
      // Ajouter la réponse de MAÏ
      addMessage({
        content: response,
        sender: 'mai'
      })
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      
      // Utiliser les réponses de fallback intelligentes
      const fallbackResponse = findFallbackResponse(content.trim())
      
      addMessage({
        content: fallbackResponse,
        sender: 'mai'
      })
    } finally {
      // Désactiver l'indicateur de frappe
      setState(prev => ({ ...prev, isTyping: false }))
    }
  }, [addMessage, state.messages])

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
