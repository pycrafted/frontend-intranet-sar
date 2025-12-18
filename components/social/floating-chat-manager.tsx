"use client"

import { FloatingChatModal } from "./floating-chat-modal"
import { useFloatingChats } from "@/contexts/FloatingChatContext"
import { useAIChatbot } from "@/contexts/AIChatbotContext"
import { useScreenSize } from "@/hooks/useScreenSize"

export function FloatingChatManager() {
  const { openChats, minimizedChats, closeChat, toggleMinimize } = useFloatingChats()
  const { isOpen: isAIChatbotOpen, isMinimized: isAIChatbotMinimized } = useAIChatbot()
  const { isMobile, isTablet } = useScreenSize()

  // Calculer les positions pour les chats ouverts (empilés horizontalement)
  const getChatPosition = (index: number) => {
    const chatbotWidth = isMobile ? 0 : isTablet ? 450 : 500 // Largeur du chatbot selon la taille d'écran
    const minimizedChatbotWidth = 320 // Largeur du chatbot minimisé (w-80 = 320px)
    const chatWidth = isMobile ? 0 : isTablet ? 450 : 500 // Largeur du chat ouvert (même que l'assistant IA)
    const minimizedChatWidth = 320 // Largeur du chat minimisé (w-80 = 320px)
    const spacing = 16 // Espacement entre les chats
    const buttonSize = 64 // Taille du bouton flottant de l'assistant IA (quand fermé) - h-16 = 64px
    const buttonSpacing = 8 // Espacement entre le bouton et le modal pour éviter le chevauchement
    
    // Si l'assistant IA est ouvert et non minimisé, utiliser sa largeur complète
    // Si l'assistant IA est minimisé, utiliser sa largeur minimisée
    // Si l'assistant IA est fermé, utiliser seulement la taille du bouton + espacement pour éviter le chevauchement
    let aiSpace: number
    let aiSpacing: number
    
    if (!isAIChatbotOpen) {
      aiSpace = buttonSize
      aiSpacing = buttonSpacing
    } else if (isAIChatbotMinimized) {
      aiSpace = minimizedChatbotWidth
      aiSpacing = spacing
    } else {
      aiSpace = chatbotWidth
      aiSpacing = spacing
    }
    
    const baseRight = 24 + aiSpace + aiSpacing // right-6 (24px) + largeur/taille de l'IA + espacement
    
    // Calculer l'offset en tenant compte de TOUS les chats avant celui-ci (minimisés ou non)
    let offset = 0
    for (let i = 0; i < index; i++) {
      const previousChat = openChats[i]
      const isPreviousMinimized = minimizedChats.has(previousChat.id)
      const previousChatWidth = isPreviousMinimized ? minimizedChatWidth : chatWidth
      offset += previousChatWidth + spacing
    }
    
    return {
      right: `${baseRight + offset}px`,
      zIndex: 9999 + index // z-index très élevé pour être au-dessus de tout
    }
  }
  
  // Calculer la position pour les chats minimisés (même position horizontale que lorsqu'ils étaient ouverts)
  const getMinimizedPosition = (chatId: string, originalIndex: number) => {
    // Utiliser la même logique de positionnement que pour les chats ouverts
    const chatbotWidth = isMobile ? 0 : isTablet ? 450 : 500
    const minimizedChatbotWidth = 320 // Largeur du chatbot minimisé (w-80 = 320px)
    const chatWidth = isMobile ? 0 : isTablet ? 450 : 500 // Largeur du chat ouvert
    const minimizedChatWidth = 320 // Largeur du chat minimisé (w-80 = 320px)
    const spacing = 16 // Même espacement que les chats ouverts
    const buttonSize = 64
    const buttonSpacing = 8
    
    let aiSpace: number
    let aiSpacing: number
    
    if (!isAIChatbotOpen) {
      aiSpace = buttonSize
      aiSpacing = buttonSpacing
    } else if (isAIChatbotMinimized) {
      aiSpace = minimizedChatbotWidth
      aiSpacing = spacing
    } else {
      aiSpace = chatbotWidth
      aiSpacing = spacing
    }
    
    const baseRight = 24 + aiSpace + aiSpacing
    
    // Calculer l'offset en tenant compte de TOUS les chats avant celui-ci (minimisés ou non)
    let offset = 0
    for (let i = 0; i < originalIndex; i++) {
      const previousChat = openChats[i]
      const isPreviousMinimized = minimizedChats.has(previousChat.id)
      const previousChatWidth = isPreviousMinimized ? minimizedChatWidth : chatWidth
      offset += previousChatWidth + spacing
    }
    
    return {
      right: `${baseRight + offset}px`,
      zIndex: 9999 + originalIndex + 100 // z-index très élevé pour les minimisés (au-dessus des ouverts)
    }
  }

  return (
    <>
      {openChats.map((chat, index) => {
        const isMinimized = minimizedChats.has(chat.id)
        const position = isMinimized ? getMinimizedPosition(chat.id, index) : getChatPosition(index)
        
        // Sur mobile, le modal gère lui-même son positionnement (inset-0)
        if (isMobile) {
          return (
            <FloatingChatModal
              key={chat.id}
              userId={chat.userId}
              userName={chat.userName}
              userAvatar={chat.userAvatar}
              isOpen={true}
              onClose={() => closeChat(chat.id)}
              onMinimize={() => toggleMinimize(chat.id)}
              isMinimized={isMinimized}
            />
          )
        }
        
        return (
          <div
            key={chat.id}
            style={{
              position: 'fixed',
              bottom: '24px', // Même position verticale pour minimisés et ouverts
              right: position.right,
              zIndex: position.zIndex
            }}
          >
            <FloatingChatModal
              userId={chat.userId}
              userName={chat.userName}
              userAvatar={chat.userAvatar}
              isOpen={true}
              onClose={() => closeChat(chat.id)}
              onMinimize={() => toggleMinimize(chat.id)}
              isMinimized={isMinimized}
            />
          </div>
        )
      })}
    </>
  )
}

