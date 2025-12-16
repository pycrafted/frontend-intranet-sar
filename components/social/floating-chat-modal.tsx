"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X, Send, Minimize2, Maximize2 } from "lucide-react"
import { useSocialNetwork } from "@/hooks/useSocialNetwork"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { GifPicker } from "./gif-picker"
import { useScreenSize } from "@/hooks/useScreenSize"

interface FloatingChatModalProps {
  userId: number
  userName: string
  userAvatar?: string | null
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  isMinimized?: boolean
}

export function FloatingChatModal({
  userId,
  userName,
  userAvatar,
  isOpen,
  onClose,
  onMinimize,
  isMinimized = false
}: FloatingChatModalProps) {
  const { user: currentUser } = useAuth()
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()
  const {
    conversations,
    messages,
    isLoadingMessages,
    fetchMessages,
    sendMessage,
    createConversationWithUser,
    markMessagesAsRead,
    checkNewMessages
  } = useSocialNetwork()

  const [messageInput, setMessageInput] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const isPollingRef = useRef(false)

  // Trouver ou créer la conversation avec cet utilisateur
  useEffect(() => {
    if (!isOpen || !currentUser) return

    const initializeConversation = async () => {
      setIsInitializing(true)
      try {
        // Chercher une conversation existante avec cet utilisateur
        const existingConv = conversations.find(conv => {
          if (conv.type === 'direct' && conv.participants) {
            return conv.participants.some(p => p.id === userId)
          }
          return false
        })

        if (existingConv) {
          setConversationId(existingConv.id)
          await fetchMessages(existingConv.id)
          await markMessagesAsRead(existingConv.id)
        } else {
          // Créer une nouvelle conversation
          const newConv = await createConversationWithUser(userId)
          if (newConv) {
            setConversationId(newConv.id)
            await fetchMessages(newConv.id)
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la conversation:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeConversation()
  }, [isOpen, userId, currentUser, conversations, createConversationWithUser, fetchMessages, markMessagesAsRead])

  // Polling pour les nouveaux messages
  useEffect(() => {
    if (!isOpen || !conversationId || isPollingRef.current) return

    const pollInterval = setInterval(async () => {
      if (!isPollingRef.current) {
        isPollingRef.current = true
        await checkNewMessages(conversationId)
        isPollingRef.current = false
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [isOpen, conversationId, checkNewMessages])

  // Auto-scroll vers le bas
  useEffect(() => {
    if (shouldAutoScrollRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [messages[conversationId || ""]])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId || isLoadingMessages) return

    const content = messageInput.trim()
    setMessageInput("")
    shouldAutoScrollRef.current = true

    try {
      await sendMessage(conversationId, content)
      // Marquer comme lu après envoi
      await markMessagesAsRead(conversationId)
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
    }
  }

  const handleGifSelect = (gifUrl: string) => {
    if (!conversationId) return
    const gifMessage = `![GIF](${gifUrl})`
    sendMessage(conversationId, gifMessage)
  }

  // Fonction pour rendre le contenu avec support des images markdown et liens
  const renderMessageContent = (text: string) => {
    // Détecter les images markdown ![alt](url)
    const parts = text.split(/(!\[.*?\]\(.*?\))/g)
    
    return (
      <>
        {parts.map((part, index) => {
          const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/)
          if (imageMatch) {
            const [, alt, url] = imageMatch
            return (
              <img
                key={index}
                src={url}
                alt={alt || "GIF"}
                className="max-w-xs h-auto rounded-lg my-2"
                loading="lazy"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            )
          }
          // Détecter les liens dans le texte restant
          const urlRegex = /(https?:\/\/[^\s]+)/g
          const textWithLinks = part.split(urlRegex).map((segment, segIndex) => {
            // Vérifier si le segment est une URL
            if (segment.match(/^https?:\/\/[^\s]+$/)) {
              return (
                <a
                  key={segIndex}
                  href={segment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400 hover:text-blue-300"
                >
                  {segment}
                </a>
              )
            }
            return <span key={segIndex}>{segment}</span>
          })
          return <span key={index}>{textWithLinks}</span>
        })}
      </>
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const conversationMessages = conversationId ? messages[conversationId] || [] : []

  if (!isOpen) return null

  // Fonction pour obtenir les classes de taille responsives (même que l'assistant IA)
  const getChatWindowClasses = () => {
    if (isMobile) {
      return cn(
        "flex-1 flex flex-col shadow-2xl border-2",
        "rounded-none overflow-hidden"
      )
    }
    
    return cn(
      "flex flex-col shadow-2xl border-2 overflow-hidden rounded-2xl",
      // Tailles responsives (même que l'assistant IA)
      isSmallMobile ? "w-[95vw] h-[90vh]" : isMobile ? "w-[95vw] h-[90vh]" : isTablet ? "w-[450px] h-[650px]" : "w-[500px] h-[700px]"
    )
  }

  // Classes de position pour le conteneur (même que l'assistant IA)
  const getChatContainerClasses = () => {
    if (isMobile) {
      return cn(
        "fixed inset-0 z-50 flex flex-col"
      )
    }
    
    return "" // Sur desktop, le positionnement est géré par FloatingChatManager
  }

  if (isMinimized) {
    return (
      <Card className={cn("shadow-2xl border-2", isMobile ? "w-[95vw]" : "w-80")}>
        <div className="p-3 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg cursor-pointer" onClick={onMinimize}>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar || "/placeholder-user.jpg"} alt={userName} />
              <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm">{userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={getChatContainerClasses()}>
      <Card className={getChatWindowClasses()}>
      {/* Header */}
      <div className="p-3 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar || "/placeholder-user.jpg"} alt={userName} />
            <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{userName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar"
        onScroll={() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
            shouldAutoScrollRef.current = isNearBottom
          }
        }}
      >
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              <p>Aucun message</p>
              <p className="text-sm">Commencez la conversation</p>
            </div>
          </div>
        ) : (
          conversationMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.sent ? "justify-end" : "justify-start"
              )}
            >
              {!message.sent && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={userAvatar || "/placeholder-user.jpg"} alt={userName} />
                  <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  message.sent
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 border"
                )}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {renderMessageContent(message.text)}
                </div>
                <p className={cn("text-xs mt-1", message.sent ? "text-blue-100" : "text-gray-500")}>
                  {message.time}
                </p>
              </div>
              {message.sent && currentUser && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentUser.avatar_url || "/placeholder-user.jpg"} alt={currentUser.full_name || currentUser.username} />
                  <AvatarFallback>{(currentUser.full_name || currentUser.username).split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-end gap-2">
          <GifPicker onGifSelect={handleGifSelect} className="flex-shrink-0" />
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1"
            disabled={isLoadingMessages || !conversationId}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isLoadingMessages || !conversationId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </Card>
    </div>
  )
}

