"use client"

import { FloatingChatModal } from "./floating-chat-modal"
import { useFloatingChats } from "@/contexts/FloatingChatContext"

export function FloatingChatManager() {
  const { openChats, closeChat } = useFloatingChats()

  // Calculer les positions pour empiler les chats (comme Facebook/LinkedIn)
  // Chaque chat est décalé vers la gauche
  const getChatPosition = (index: number, total: number) => {
    // Le chatbot MAÏ est à right-6 (24px), largeur ~500px sur desktop
    // On place le premier chat à right-[540px] (24px + 500px + 16px d'espacement), puis on décale chaque chat suivant
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024
    const chatbotWidth = isMobile ? 0 : isTablet ? 450 : 500 // Largeur du chatbot selon la taille d'écran
    const chatWidth = isMobile ? 0 : isTablet ? 450 : 500 // Largeur du chat (même que l'assistant IA)
    const spacing = 16 // Espacement entre les chats
    const baseRight = 24 + chatbotWidth + spacing // right du chatbot + largeur + espacement
    const offset = index * (chatWidth + spacing) // Décalage de la largeur du chat + espacement
    return {
      right: `${baseRight + offset}px`,
      zIndex: 40 + index // z-index croissant pour que le dernier ouvert soit au-dessus
    }
  }

  return (
    <>
      {openChats.map((chat, index) => {
        const position = getChatPosition(index, openChats.length)
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
        
        // Sur mobile, le modal gère lui-même son positionnement (inset-0)
        // Sur desktop, on utilise le positionnement calculé
        if (isMobile) {
          return (
            <FloatingChatModal
              key={chat.id}
              userId={chat.userId}
              userName={chat.userName}
              userAvatar={chat.userAvatar}
              isOpen={true}
              onClose={() => closeChat(chat.id)}
              onMinimize={() => closeChat(chat.id)}
              isMinimized={false}
            />
          )
        }
        
        return (
          <div
            key={chat.id}
            style={{
              position: 'fixed',
              bottom: '24px', // bottom-6
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
              onMinimize={() => closeChat(chat.id)}
              isMinimized={false}
            />
          </div>
        )
      })}
    </>
  )
}

