"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

interface OpenChat {
  userId: number
  userName: string
  userAvatar?: string | null
  id: string
}

interface FloatingChatContextType {
  openChats: OpenChat[]
  minimizedChats: Set<string> // IDs des chats minimisés
  openChat: (userId: number, userName: string, userAvatar?: string | null) => void
  closeChat: (chatId: string) => void
  toggleMinimize: (chatId: string) => void
}

const FloatingChatContext = createContext<FloatingChatContextType | undefined>(undefined)

const STORAGE_KEY_OPEN_CHATS = 'floating_chats_open'
const STORAGE_KEY_MINIMIZED_CHATS = 'floating_chats_minimized'

// Fonction pour charger depuis sessionStorage
const loadFromStorage = () => {
  if (typeof window === 'undefined') return { chats: [], minimized: new Set<string>() }
  
  try {
    const storedChats = sessionStorage.getItem(STORAGE_KEY_OPEN_CHATS)
    const storedMinimized = sessionStorage.getItem(STORAGE_KEY_MINIMIZED_CHATS)
    
    const chats: OpenChat[] = storedChats ? JSON.parse(storedChats) : []
    const minimized = storedMinimized ? new Set<string>(JSON.parse(storedMinimized)) : new Set<string>()
    
    return { chats, minimized }
  } catch (error) {
    console.error('Erreur lors du chargement des chats depuis sessionStorage:', error)
    return { chats: [], minimized: new Set<string>() }
  }
}

// Fonction pour sauvegarder dans sessionStorage
const saveToStorage = (chats: OpenChat[], minimized: Set<string>) => {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(STORAGE_KEY_OPEN_CHATS, JSON.stringify(chats))
    sessionStorage.setItem(STORAGE_KEY_MINIMIZED_CHATS, JSON.stringify(Array.from(minimized)))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des chats dans sessionStorage:', error)
  }
}

export function FloatingChatProvider({ children }: { children: ReactNode }) {
  // Charger l'état initial depuis sessionStorage
  const { chats: initialChats, minimized: initialMinimized } = loadFromStorage()
  const [openChats, setOpenChats] = useState<OpenChat[]>(initialChats)
  const [minimizedChats, setMinimizedChats] = useState<Set<string>>(initialMinimized)
  
  // Sauvegarder dans sessionStorage à chaque changement
  useEffect(() => {
    saveToStorage(openChats, minimizedChats)
  }, [openChats, minimizedChats])

  const openChat = useCallback((userId: number, userName: string, userAvatar?: string | null) => {
    // Vérifier si le chat est déjà ouvert et ajouter le nouveau chat
    setOpenChats(prev => {
      const existingChat = prev.find(chat => chat.userId === userId)
      if (existingChat) {
        // Si le chat existe mais est minimisé, le restaurer
        setMinimizedChats(prevMin => {
          const newMin = new Set(prevMin)
          newMin.delete(existingChat.id)
          return newMin
        })
        return prev // Chat déjà ouvert
      }

      // Ajouter le nouveau chat
      const newChat: OpenChat = {
        userId,
        userName,
        userAvatar,
        id: `chat-${userId}-${Date.now()}`
      }

      return [...prev, newChat]
    })
  }, [])

  const closeChat = useCallback((chatId: string) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== chatId))
    setMinimizedChats(prev => {
      const newMin = new Set(prev)
      newMin.delete(chatId)
      return newMin
    })
  }, [])

  const toggleMinimize = useCallback((chatId: string) => {
    setMinimizedChats(prev => {
      const newMin = new Set(prev)
      if (newMin.has(chatId)) {
        newMin.delete(chatId) // Restaurer
      } else {
        newMin.add(chatId) // Minimiser
      }
      return newMin
    })
  }, [])

  return (
    <FloatingChatContext.Provider value={{ openChats, minimizedChats, openChat, closeChat, toggleMinimize }}>
      {children}
    </FloatingChatContext.Provider>
  )
}

export function useFloatingChats() {
  const context = useContext(FloatingChatContext)
  if (!context) {
    throw new Error("useFloatingChats must be used within FloatingChatProvider")
  }
  return context
}

