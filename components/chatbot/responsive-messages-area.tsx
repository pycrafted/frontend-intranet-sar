"use client"

import React from 'react'
import { cn } from "@/lib/utils"
import { useScreenSize } from "@/hooks/useScreenSize"
import { LoadingMessage } from "../loading-message"
import { Message } from "@/hooks/useSariaChatbot"

interface ResponsiveMessagesAreaProps {
  messages: Message[]
  isTyping: boolean
  loadingMessage: string
  loadingPhase: 'searching' | 'processing'
  user?: any
  messagesEndRef: React.RefObject<HTMLDivElement>
  className?: string
}

export function ResponsiveMessagesArea({
  messages,
  isTyping,
  loadingMessage,
  loadingPhase,
  user,
  messagesEndRef,
  className
}: ResponsiveMessagesAreaProps) {
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()

  return (
    <div className={cn(
      "flex-1 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent to-red-50/30",
      // Padding responsif
      isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-6",
      className
    )}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 saria-message group",
            message.sender === 'user' ? "justify-end" : "justify-start"
          )}
        >
          {/* Avatar MAÏ */}
          {message.sender === 'mai' && (
            <div className="relative flex-shrink-0 mt-1">
              <div className={cn(
                "rounded-full ring-2 ring-red-200 overflow-hidden shadow-lg",
                // Tailles d'avatar responsives
                isSmallMobile ? "h-8 w-8" : isMobile ? "h-10 w-10" : "h-12 w-12"
              )} style={{backgroundColor: '#ccd0d1'}}>
                <img 
                  src="/saria-avatar.png" 
                  alt="SARIA" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
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
          
          {/* Message */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-lg transition-all duration-200 group-hover:shadow-xl",
              message.sender === 'user'
                ? "bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-br-md"
                : "bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-md border border-gray-200/50",
              // Largeurs responsives
              isSmallMobile ? "max-w-[85%]" : isMobile ? "max-w-[80%]" : "max-w-[75%]"
            )}
          >
            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs",
              message.sender === 'user' ? "text-red-100" : "text-gray-500"
            )}>
              <div className={cn(
                "rounded-full",
                message.sender === 'user' ? "bg-red-200" : "bg-gray-400",
                isSmallMobile ? "h-0.5 w-0.5" : "h-1 w-1"
              )}></div>
              <span>
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
          
          {/* Avatar utilisateur */}
          {message.sender === 'user' && (
            <div className="relative flex-shrink-0 mt-1">
              <div className={cn(
                "rounded-full ring-2 ring-gray-200 overflow-hidden shadow-lg",
                // Tailles d'avatar responsives
                isSmallMobile ? "h-8 w-8" : isMobile ? "h-9 w-9" : "h-10 w-10"
              )} style={{backgroundColor: '#ccd0d1'}}>
                <img 
                  src={user?.avatar_url || user?.google_avatar_url || "/placeholder-user.jpg"} 
                  alt={user?.full_name || "Utilisateur"} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
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
      
      {/* Indicateur de frappe avec messages intelligents */}
      {isTyping && (
        <div className="flex gap-3 justify-start saria-message group">
          <div className="relative flex-shrink-0 mt-1">
            <div className={cn(
              "rounded-full ring-2 ring-red-200 overflow-hidden shadow-lg",
              // Tailles d'avatar responsives
              isSmallMobile ? "h-8 w-8" : isMobile ? "h-10 w-10" : "h-12 w-12"
            )} style={{backgroundColor: '#ccd0d1'}}>
              <img 
                src="/saria-avatar.png" 
                alt="SARIA" 
                className="h-full w-full object-cover"
                onError={(e) => {
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
          <div className={cn(
            "bg-white/80 backdrop-blur-sm text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-lg border border-gray-200/50",
            // Largeurs responsives
            isSmallMobile ? "max-w-[85%]" : isMobile ? "max-w-[80%]" : "max-w-[75%]"
          )}>
            {loadingMessage ? (
              <LoadingMessage 
                message={loadingMessage}
                phase={loadingPhase}
              />
            ) : (
              <div className="flex items-center gap-3">
                {/* Animation de chargement par défaut */}
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <div className="text-gray-700 font-medium animate-pulse">
                  Traitement en cours...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
