"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSariaChatbot } from "@/hooks/useSariaChatbot"
import { useAuth } from "@/contexts/AuthContext"
import { useScreenSize } from "@/hooks/useScreenSize"
import { useAIChatbot } from "@/contexts/AIChatbotContext"
import { ResponsiveFloatingButton } from "./chatbot/responsive-floating-button"
import { ResponsiveChatHeader } from "./chatbot/responsive-chat-header"
import { ResponsiveMessagesArea } from "./chatbot/responsive-messages-area"
import { ResponsiveInputArea } from "./chatbot/responsive-input-area"
import { Maximize2, Sparkles, X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface MaiChatbotProps {
  className?: string
}

export function MaiChatbot({ className }: MaiChatbotProps) {
  const {
    isOpen: hookIsOpen,
    messages,
    isTyping,
    loadingMessage,
    loadingPhase,
    toggleChat: hookToggleChat,
    sendMessage
  } = useSariaChatbot()
  
  const { isOpen: contextIsOpen, setIsOpen: setContextIsOpen, toggleChat: contextToggleChat, isMinimized, toggleMinimize } = useAIChatbot()
  const { user } = useAuth()
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()
  
  // Utiliser l'état du contexte comme source de vérité, mais synchroniser avec le hook
  const isOpen = contextIsOpen
  const toggleChat = () => {
    hookToggleChat() // Mettre à jour le hook
    contextToggleChat() // Mettre à jour le contexte
  }
  
  // Synchroniser l'état du hook avec le contexte au montage
  useEffect(() => {
    if (hookIsOpen !== contextIsOpen) {
      setContextIsOpen(hookIsOpen)
    }
  }, [hookIsOpen, contextIsOpen, setContextIsOpen])
  
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const messageContent = inputValue.trim()
    setInputValue('')
    await sendMessage(messageContent)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Classes responsives pour le conteneur principal
  const getChatbotClasses = () => {
    if (isMobile) {
      return cn(
        "fixed inset-0 z-50 flex flex-col",
        className
      )
    }
    
    return cn(
      "fixed bottom-6 right-6 z-50",
      className
    )
  }

  // Classes pour le bouton flottant (toujours visible)
  const getFloatingButtonClasses = () => {
    if (isMobile) {
      return cn(
        "fixed bottom-4 right-4 z-50",
        className
      )
    }
    
    return cn(
      "fixed bottom-6 right-6 z-50",
      className
    )
  }

  // Classes responsives pour la fenêtre de chat
  const getChatWindowClasses = () => {
    if (isMobile) {
      return cn(
        "flex-1 flex flex-col shadow-2xl border-0 bg-gradient-to-br from-white/95 via-[#344256]/5 to-[#344256]/10 backdrop-blur-xl",
        "rounded-none overflow-hidden"
      )
    }
    
      return cn(
        "flex flex-col shadow-2xl border-0 bg-gradient-to-br from-white/95 via-[#344256]/5 to-[#344256]/10 backdrop-blur-xl transition-all duration-500 saria-chat-window",
        "rounded-2xl overflow-hidden",
        // Tailles responsives
        isSmallMobile ? "w-[95vw] h-[90vh]" : isMobile ? "w-[95vw] h-[90vh]" : isTablet ? "w-[450px] h-[650px]" : "w-[500px] h-[700px]"
      )
  }


  return (
    <>
      {/* Bouton flottant - Tous les écrans, positionné indépendamment - seulement si complètement fermé */}
      {!isOpen && (
        <div className={getFloatingButtonClasses()}>
          <ResponsiveFloatingButton
            isOpen={isOpen}
            onClick={toggleChat}
          />
        </div>
      )}

      {/* Modal minimisé - visible sur toutes les pages tant qu'il n'est pas complètement fermé */}
      {isOpen && isMinimized && !isMobile && (
        <div className={getChatbotClasses()}>
          <Card className="shadow-2xl border-0 rounded-t-lg overflow-hidden w-80">
            <div 
              className="p-3 flex items-center justify-between text-white cursor-pointer hover:opacity-90 transition-opacity" 
              style={{ backgroundColor: "#344256" }}
              onClick={toggleMinimize}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-full ring-2 ring-white/30 overflow-hidden flex-shrink-0" style={{backgroundColor: '#ccd0d1'}}>
                  <img 
                    src="/saria-avatar.png" 
                    alt="MAÏ Assistant" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm truncate">MAÏ</span>
                    <Sparkles className="h-3 w-3 text-yellow-300 flex-shrink-0" />
                  </div>
                  <div className="text-white/80 text-xs flex items-center gap-1">
                    <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                    <span>En ligne</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-white hover:bg-white/20" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleChat(); 
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-white hover:bg-white/20" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleMinimize(); 
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Fenêtre de chat complète */}
      {isOpen && !isMinimized && (
        <div className={getChatbotClasses()}>
          <Card className={getChatWindowClasses()}>
          {/* Header avec gradient */}
            <ResponsiveChatHeader
              onClose={toggleChat}
              onMinimize={toggleMinimize}
              className=""
              style={{ backgroundColor: "#344256" }}
            />

          {/* Zone des messages */}
            <ResponsiveMessagesArea
              messages={messages}
              isTyping={isTyping}
              loadingMessage={loadingMessage}
              loadingPhase={loadingPhase}
              user={user}
              messagesEndRef={messagesEndRef}
            />

          {/* Zone de saisie */}
            <ResponsiveInputArea
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={handleSendMessage}
                      onKeyPress={handleKeyPress}
              isTyping={isTyping}
              inputRef={inputRef}
            />
          </Card>
          </div>
      )}
    </>
  )
}