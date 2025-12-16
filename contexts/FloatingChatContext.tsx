"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface OpenChat {
  userId: number
  userName: string
  userAvatar?: string | null
  id: string
}

interface FloatingChatContextType {
  openChats: OpenChat[]
  openChat: (userId: number, userName: string, userAvatar?: string | null) => void
  closeChat: (chatId: string) => void
}

const FloatingChatContext = createContext<FloatingChatContextType | undefined>(undefined)

export function FloatingChatProvider({ children }: { children: ReactNode }) {
  const [openChats, setOpenChats] = useState<OpenChat[]>([])

  const openChat = useCallback((userId: number, userName: string, userAvatar?: string | null) => {
    // Vérifier si le chat est déjà ouvert et ajouter le nouveau chat
    setOpenChats(prev => {
      const existingChat = prev.find(chat => chat.userId === userId)
      if (existingChat) {
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
  }, [])

  return (
    <FloatingChatContext.Provider value={{ openChats, openChat, closeChat }}>
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

