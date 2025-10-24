"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSariaChatbot } from "@/hooks/useSariaChatbot"
import { useAuth } from "@/contexts/AuthContext"
import { useScreenSize } from "@/hooks/useScreenSize"
import { ResponsiveFloatingButton } from "./chatbot/responsive-floating-button"
import { ResponsiveChatHeader } from "./chatbot/responsive-chat-header"
import { ResponsiveMessagesArea } from "./chatbot/responsive-messages-area"
import { ResponsiveInputArea } from "./chatbot/responsive-input-area"

interface MaiChatbotProps {
  className?: string
}

export function MaiChatbot({ className }: MaiChatbotProps) {
  const {
    isOpen,
    messages,
    isTyping,
    loadingMessage,
    loadingPhase,
    toggleChat,
    sendMessage
  } = useSariaChatbot()
  
  const { user } = useAuth()
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()
  
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
        "flex-1 flex flex-col shadow-2xl border-0 bg-gradient-to-br from-white/95 via-red-50/95 to-pink-50/95 backdrop-blur-xl",
        "rounded-none overflow-hidden"
      )
    }
    
    return cn(
      "flex flex-col shadow-2xl border-0 bg-gradient-to-br from-white/95 via-red-50/95 to-pink-50/95 backdrop-blur-xl transition-all duration-500 saria-chat-window",
      "rounded-2xl overflow-hidden",
      // Tailles responsives
      isSmallMobile ? "w-[95vw] h-[90vh]" : isMobile ? "w-[95vw] h-[90vh]" : isTablet ? "w-[450px] h-[650px]" : "w-[500px] h-[700px]"
    )
  }


  return (
    <>
      {/* Bouton flottant - Tous les écrans, positionné indépendamment */}
      {!isOpen && (
        <div className={getFloatingButtonClasses()}>
          <ResponsiveFloatingButton
            isOpen={isOpen}
            onClick={toggleChat}
          />
        </div>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className={getChatbotClasses()}>
          <Card className={getChatWindowClasses()}>
          {/* Header avec gradient */}
            <ResponsiveChatHeader
              onClose={toggleChat}
              className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-500"
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