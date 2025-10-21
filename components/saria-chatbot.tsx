"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSariaChatbot } from "@/hooks/useSariaChatbot"
import { useAuth } from "@/contexts/AuthContext"
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Loader2,
  Sparkles,
  Heart
} from "lucide-react"

interface MaiChatbotProps {
  className?: string
}

export function MaiChatbot({ className }: MaiChatbotProps) {
  const {
    isOpen,
    messages,
    isTyping,
    toggleChat,
    sendMessage
  } = useSariaChatbot()
  
  const { user } = useAuth()
  
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


  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Bouton flottant */}
      {!isOpen && (
        <div className="relative">
          {/* Effet de pulsation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-pink-600 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-pink-600 animate-pulse opacity-30"></div>
          
          <Button
            onClick={toggleChat}
            size="icon"
            className="relative h-16 w-16 rounded-full bg-gradient-to-br from-red-500 via-pink-600 to-orange-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:rotate-3 saria-floating-button"
            aria-label="Ouvrir le chat SARIA"
          >
            <div className="relative">
              <MessageCircle className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </Button>
        </div>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <Card className={cn(
          "w-[500px] h-[700px] flex flex-col shadow-2xl border-0 bg-gradient-to-br from-white/95 via-red-50/95 to-pink-50/95 backdrop-blur-xl transition-all duration-500 saria-chat-window",
          "rounded-2xl overflow-hidden"
        )}>
          {/* Header avec gradient */}
          <div className="relative flex items-center justify-between p-5 bg-gradient-to-r from-red-600 via-pink-600 to-orange-500 text-white">
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            
            <div className="relative flex items-center gap-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 rounded-full ring-2 ring-white/30 overflow-hidden" style={{backgroundColor: '#ccd0d1'}}>
                  <img 
                    src="/saria-avatar.png" 
                    alt="SARIA Assistant" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback vers l'icône robot si l'image ne charge pas
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="h-full w-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/></svg></div>';
                      }
                    }}
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg flex items-center gap-2 truncate">
                  MAÏ
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse flex-shrink-0" />
                </h3>
                <div className="text-sm text-red-100 flex items-center gap-1 truncate">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="truncate">
                    En ligne
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="h-9 w-9 hover:bg-red-500/20 text-white hover:text-red-200 transition-all duration-200"
                aria-label="Fermer le chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 saria-messages-container bg-gradient-to-b from-transparent to-red-50/30">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 saria-message group",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === 'mai' && (
                      <div className="relative flex-shrink-0 mt-1">
                        <div className="h-12 w-12 rounded-full ring-2 ring-red-200 overflow-hidden shadow-lg" style={{backgroundColor: '#ccd0d1'}}>
                          <img 
                            src="/saria-avatar.png" 
                            alt="SARIA" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback vers l'icône robot si l'image ne charge pas
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="h-full w-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/></svg></div>';
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-lg transition-all duration-200 group-hover:shadow-xl",
                        message.sender === 'user'
                          ? "bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-br-md"
                          : "bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-md border border-gray-200/50"
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      <div className={cn(
                        "flex items-center gap-1 mt-2 text-xs",
                        message.sender === 'user' ? "text-red-100" : "text-gray-500"
                      )}>
                        <div className={cn(
                          "h-1 w-1 rounded-full",
                          message.sender === 'user' ? "bg-red-200" : "bg-gray-400"
                        )}></div>
                        <span>
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="relative flex-shrink-0 mt-1">
                        <div className="h-10 w-10 rounded-full ring-2 ring-gray-200 overflow-hidden shadow-lg" style={{backgroundColor: '#ccd0d1'}}>
                          <img 
                            src={user?.avatar_url || user?.google_avatar_url || "/placeholder-user.jpg"} 
                            alt={user?.full_name || "Utilisateur"} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback vers l'icône utilisateur si l'image ne charge pas
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="h-full w-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>';
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Indicateur de frappe */}
                {isTyping && (
                  <div className="flex gap-3 justify-start saria-message group">
                    <div className="relative flex-shrink-0 mt-1">
                      <div className="h-12 w-12 rounded-full ring-2 ring-red-200 overflow-hidden shadow-lg" style={{backgroundColor: '#ccd0d1'}}>
                        <img 
                          src="/saria-avatar.png" 
                          alt="SARIA" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback vers l'icône robot si l'image ne charge pas
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="h-full w-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center"><svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/></svg></div>';
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-lg border border-gray-200/50">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        {/* Texte supprimé pour ne laisser que l'animation des trois points */}
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-6 bg-gradient-to-r from-gray-50/80 to-red-50/80 backdrop-blur-sm border-t border-gray-200/50">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre message..."
                      className="w-full px-4 py-3 text-sm bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 shadow-lg placeholder-gray-500"
                      disabled={isTyping}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="icon"
                    className="h-12 w-12 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-2xl"
                    aria-label="Envoyer le message"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
          </div>
        </Card>
      )}
    </div>
  )
}