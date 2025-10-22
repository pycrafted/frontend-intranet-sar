"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useScreenSize } from '@/hooks/useScreenSize'

interface LoadingMessageProps {
  message: string
  phase: 'searching' | 'processing'
  className?: string
}

export function LoadingMessage({ message, phase, className }: LoadingMessageProps) {
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()
  
  const getPhaseIcon = () => {
    switch (phase) {
      case 'searching':
        return (
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        )
      case 'processing':
        return (
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        )
      default:
        return (
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        )
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'searching':
        return 'text-blue-600'
      case 'processing':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={cn(
      "flex items-center gap-3",
      // Espacement responsif
      isSmallMobile ? "gap-2" : "gap-3",
      className
    )}>
      {/* Animation de chargement */}
      {getPhaseIcon()}
      
      {/* Message de chargement */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-medium animate-pulse truncate",
          getPhaseColor(),
          // Tailles de texte responsives
          isSmallMobile ? "text-sm" : "text-base"
        )}>
          {message}
        </div>
        <div className={cn(
          "text-gray-500 mt-1 flex items-center gap-2",
          isSmallMobile ? "text-xs" : "text-xs"
        )}>
          <span className="capitalize truncate">{phase}</span>
          <div className="flex space-x-1 flex-shrink-0">
            <div className="h-1 w-1 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="h-1 w-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="h-1 w-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProgressiveLoadingProps {
  messages: Array<{
    content: string
    phase: 'searching' | 'processing'
    delay: number
  }>
  currentIndex: number
  className?: string
}

export function ProgressiveLoading({ messages, currentIndex, className }: ProgressiveLoadingProps) {
  const currentMessage = messages[currentIndex] || messages[messages.length - 1]
  
  if (!currentMessage) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Animation de progression */}
      <div className="flex space-x-1">
        {messages.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              index <= currentIndex 
                ? "bg-gradient-to-r from-blue-500 to-green-500 animate-pulse" 
                : "bg-gray-300"
            )}
          />
        ))}
      </div>
      
      {/* Message actuel */}
      <div className="flex-1">
        <div className="font-medium text-gray-700 animate-pulse">
          {currentMessage.content}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Étape {currentIndex + 1} sur {messages.length} - {currentMessage.phase}
        </div>
      </div>
    </div>
  )
}

interface QuickLoadingProps {
  message: string
  className?: string
}

export function QuickLoading({ message, className }: QuickLoadingProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Animation rapide */}
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-ping"></div>
        <div className="h-2 w-2 bg-orange-500 rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
        <div className="h-2 w-2 bg-red-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
      </div>
      
      {/* Message rapide */}
      <div className="flex-1">
        <div className="font-medium text-gray-700 animate-pulse">
          {message}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Recherche rapide en cours...
        </div>
      </div>
    </div>
  )
}
