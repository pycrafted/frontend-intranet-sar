"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useScreenSize } from "@/hooks/useScreenSize"

interface ResponsiveFloatingButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function ResponsiveFloatingButton({ 
  isOpen, 
  onClick, 
  className 
}: ResponsiveFloatingButtonProps) {
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()

  if (isOpen) return null

  return (
    <div className={cn("relative", className)}>
      {/* Effet de pulsation */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-pink-600 animate-ping opacity-20"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-pink-600 animate-pulse opacity-30"></div>
      
      <Button
        onClick={onClick}
        size="icon"
        className={cn(
          "relative rounded-full bg-gradient-to-br from-red-500 via-pink-600 to-orange-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:rotate-3 saria-floating-button",
          // Tailles responsives
          isSmallMobile ? "h-12 w-12" : isMobile ? "h-14 w-14" : isTablet ? "h-16 w-16" : "h-16 w-16"
        )}
        aria-label="Ouvrir le chat SARIA"
      >
        <div className="relative">
          <MessageCircle className={cn(
            // Tailles d'icônes responsives
            isSmallMobile ? "h-5 w-5" : isMobile ? "h-6 w-6" : "h-7 w-7"
          )} />
          <div className={cn(
            "absolute -top-1 -right-1 bg-green-400 rounded-full animate-pulse",
            // Tailles des indicateurs responsives
            isSmallMobile ? "h-2 w-2" : isMobile ? "h-2.5 w-2.5" : "h-3 w-3"
          )}></div>
        </div>
      </Button>
    </div>
  )
}

