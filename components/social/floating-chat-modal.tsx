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
    isLoadingConversations,
    isLoadingMessages,
    fetchConversations,
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
  const initializedForUserIdRef = useRef<number | null>(null) // Pour éviter les initialisations multiples pour le même userId

  // Trouver ou créer la conversation avec cet utilisateur (une seule fois à l'ouverture)
  useEffect(() => {
    if (!isOpen || !currentUser) {
      // Réinitialiser quand le modal se ferme
      if (!isOpen) {
        initializedForUserIdRef.current = null
        setConversationId(null)
      }
      return
    }

    // Si on a déjà initialisé pour ce userId et qu'on a déjà une conversationId, ne pas réinitialiser
    if (initializedForUserIdRef.current === userId && conversationId) {
      return
    }

    const initializeConversation = async () => {
      // Marquer comme initialisé pour ce userId
      initializedForUserIdRef.current = userId
      setIsInitializing(true)
      
      try {
        // S'assurer que les conversations sont chargées
        if (conversations.length === 0 && !isLoadingConversations) {
          await fetchConversations()
        }

        // Attendre un peu pour que les conversations soient chargées
        let attempts = 0
        while (conversations.length === 0 && attempts < 10 && !isLoadingConversations) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        // Chercher une conversation existante avec cet utilisateur
        const existingConv = conversations.find(conv => {
          if (conv.type === 'direct' && conv.participants) {
            return conv.participants.some(p => p.id === userId)
          }
          return false
        })

        if (existingConv) {
          console.log('✅ [FLOATING_CHAT] Conversation existante trouvée:', existingConv.id)
          const convId = existingConv.id
          setConversationId(convId)
          // Charger tous les messages de la conversation seulement si pas déjà chargés
          if (!messages[convId] || messages[convId].length === 0) {
            await fetchMessages(convId)
            // Marquer comme lu après chargement (une seule fois)
            await markMessagesAsRead(convId)
          }
        } else {
          console.log('🆕 [FLOATING_CHAT] Création d\'une nouvelle conversation avec l\'utilisateur:', userId)
          // Créer une nouvelle conversation
          const newConv = await createConversationWithUser(userId)
          if (newConv) {
            setConversationId(newConv.id)
            await fetchMessages(newConv.id)
          }
        }
      } catch (error) {
        console.error("❌ [FLOATING_CHAT] Erreur lors de l'initialisation de la conversation:", error)
        initializedForUserIdRef.current = null // Réinitialiser en cas d'erreur
      } finally {
        setIsInitializing(false)
      }
    }

    initializeConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, currentUser?.id]) // Dépendances minimales

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

  // Auto-scroll vers le bas après chargement des messages
  useEffect(() => {
    if (conversationId && messages[conversationId] && messages[conversationId].length > 0) {
      // Attendre un peu pour que le DOM soit mis à jour
      setTimeout(() => {
        if (messagesEndRef.current && shouldAutoScrollRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }
  }, [conversationId, messages])

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
  const renderMessageContent = (text: string, isDeleted: boolean = false) => {
    if (isDeleted) {
      return <span className="italic text-gray-400">Message supprimé</span>
    }

    // Détecter les images markdown ![alt](url) et les liens
    const parts = text.split(/(!\[.*?\]\(.*?\)|https?:\/\/[^\s]+)/g)
    
    return (
      <>
        {parts.map((part, index) => {
          if (!part) return null
          
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
          
          // Détecter les liens dans le texte
          const linkMatch = part.match(/^(https?:\/\/[^\s]+)$/)
          if (linkMatch) {
            return (
              <a
                key={index}
                href={linkMatch[1]}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                {linkMatch[1]}
              </a>
            )
          }
          
          return <span key={index}>{part}</span>
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

  // Récupérer et trier les messages par date (du plus ancien au plus récent)
  const conversationMessages = conversationId 
    ? (messages[conversationId] || []).sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeA - timeB
      })
    : []

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
      <Card className={cn("shadow-2xl border-2 rounded-t-lg overflow-hidden", isMobile ? "w-[95vw]" : "w-80")}>
        <div 
          className="p-3 flex items-center justify-between text-white cursor-pointer hover:opacity-90 transition-opacity" 
          style={{ backgroundColor: "#344256" }} 
          onClick={onMinimize}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={userAvatar || "/placeholder-user.jpg"} alt={userName} />
              <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm truncate">{userName}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-white hover:bg-white/20" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onClose(); 
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
                onMinimize?.(); 
              }}
            >
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
      <div className="p-3 flex items-center justify-between text-white" style={{ backgroundColor: "#344256" }}>
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
          conversationMessages.map((message, index) => {
            // Regrouper les messages consécutifs du même expéditeur (comme Facebook/LinkedIn)
            const prevMessage = index > 0 ? conversationMessages[index - 1] : null
            const showAvatar = !prevMessage || 
                              prevMessage.sent !== message.sent || 
                              (new Date(message.created_at || message.time).getTime() - new Date(prevMessage.created_at || prevMessage.time).getTime()) > 300000 // 5 minutes
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2 group",
                  message.sent ? "justify-end" : "justify-start"
                )}
              >
                {!message.sent && (
                  <Avatar className={cn("h-6 w-6 flex-shrink-0", !showAvatar && "invisible")}>
                    <AvatarImage src={userAvatar || "/placeholder-user.jpg"} alt={userName} />
                    <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 max-w-[75%] shadow-sm",
                    message.sent
                      ? "text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  )}
                  style={message.sent ? { backgroundColor: "#344256" } : undefined}
                >
                  {message.is_deleted ? (
                    <span className="italic text-gray-400 text-sm">Message supprimé</span>
                  ) : (
                    <>
                      <div className={cn(
                        "text-sm whitespace-pre-wrap break-words",
                        message.sent ? "text-white" : "text-gray-900"
                      )}>
                        {renderMessageContent(message.text, message.is_deleted || false)}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 mt-1",
                        message.sent ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-[10px]",
                          message.sent ? "text-white/70" : "text-gray-500"
                        )}>
                          {message.time}
                        </span>
                        {message.is_edited && (
                          <span className={cn(
                            "text-[10px] italic",
                            message.sent ? "text-white/60" : "text-gray-400"
                          )}>
                            modifié
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {message.sent && currentUser && (
                  <Avatar className={cn("h-6 w-6 flex-shrink-0", !showAvatar && "invisible")}>
                    <AvatarImage src={currentUser.avatar_url || "/placeholder-user.jpg"} alt={currentUser.full_name || currentUser.username} />
                    <AvatarFallback>{(currentUser.full_name || currentUser.username).split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })
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
            style={{ backgroundColor: "#344256" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2a3441"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#344256"
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </Card>
    </div>
  )
}

