"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

interface AIChatbotContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggleChat: () => void
  isMinimized: boolean
  toggleMinimize: () => void
}

const AIChatbotContext = createContext<AIChatbotContextType | undefined>(undefined)

const STORAGE_KEY_AI_CHATBOT_OPEN = 'ai_chatbot_open'
const STORAGE_KEY_AI_CHATBOT_MINIMIZED = 'ai_chatbot_minimized'

// Fonction pour charger depuis sessionStorage
const loadFromStorage = () => {
  if (typeof window === 'undefined') return { isOpen: false, isMinimized: false }
  
  try {
    const storedOpen = sessionStorage.getItem(STORAGE_KEY_AI_CHATBOT_OPEN)
    const storedMinimized = sessionStorage.getItem(STORAGE_KEY_AI_CHATBOT_MINIMIZED)
    
    const isOpen = storedOpen === 'true'
    const isMinimized = storedMinimized === 'true'
    
    return { isOpen, isMinimized }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'état de l\'assistant IA depuis sessionStorage:', error)
    return { isOpen: false, isMinimized: false }
  }
}

// Fonction pour sauvegarder dans sessionStorage
const saveToStorage = (isOpen: boolean, isMinimized: boolean) => {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(STORAGE_KEY_AI_CHATBOT_OPEN, String(isOpen))
    sessionStorage.setItem(STORAGE_KEY_AI_CHATBOT_MINIMIZED, String(isMinimized))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'état de l\'assistant IA dans sessionStorage:', error)
  }
}

export function AIChatbotProvider({ children }: { children: ReactNode }) {
  // Charger l'état initial depuis sessionStorage
  const { isOpen: initialIsOpen, isMinimized: initialIsMinimized } = loadFromStorage()
  const [isOpen, setIsOpenState] = useState(initialIsOpen)
  const [isMinimized, setIsMinimized] = useState(initialIsMinimized)
  
  // Sauvegarder dans sessionStorage à chaque changement
  useEffect(() => {
    saveToStorage(isOpen, isMinimized)
  }, [isOpen, isMinimized])

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open)
    // Si on ferme le chat, désactiver aussi la minimisation
    if (!open) {
      setIsMinimized(false)
    }
  }, [])

  const toggleChat = useCallback(() => {
    setIsOpenState(prev => {
      const newState = !prev
      // Si on ferme le chat, désactiver aussi la minimisation
      if (!newState) {
        setIsMinimized(false)
      }
      return newState
    })
  }, [])

  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [])

  return (
    <AIChatbotContext.Provider value={{ isOpen, setIsOpen, toggleChat, isMinimized, toggleMinimize }}>
      {children}
    </AIChatbotContext.Provider>
  )
}

export function useAIChatbot() {
  const context = useContext(AIChatbotContext)
  if (!context) {
    throw new Error("useAIChatbot must be used within AIChatbotProvider")
  }
  return context
}

