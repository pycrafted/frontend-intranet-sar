"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useScreenSize } from "@/hooks/useScreenSize"

interface ResponsiveChatHeaderProps {
  onClose: () => void
  className?: string
}

export function ResponsiveChatHeader({ 
  onClose, 
  className 
}: ResponsiveChatHeaderProps) {
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()

  return (
    <div className={cn(
      "relative flex items-center justify-between text-white",
      // Padding responsif
      isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-5",
      className
    )}>
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      
      <div className="relative flex items-center gap-4 min-w-0 flex-1">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "rounded-full ring-2 ring-white/30 overflow-hidden",
            // Tailles d'avatar responsives
            isSmallMobile ? "h-12 w-12" : isMobile ? "h-14 w-14" : "h-16 w-16"
          )} style={{backgroundColor: '#ccd0d1'}}>
            <img 
              src="/saria-avatar.png" 
              alt="SARIA Assistant" 
              className="h-full w-full object-cover"
              onError={(e) => {
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

        {/* Informations */}
        <div className="min-w-0 flex-1">
          <h3 className={cn(
            "font-bold flex items-center gap-2 truncate",
            // Tailles de titre responsives
            isSmallMobile ? "text-base" : isMobile ? "text-lg" : "text-lg"
          )}>
            MAÏ
            <Sparkles className={cn(
              "text-yellow-300 animate-pulse flex-shrink-0",
              isSmallMobile ? "h-3 w-3" : isMobile ? "h-4 w-4" : "h-4 w-4"
            )} />
          </h3>
          <div className={cn(
            "text-red-100 flex items-center gap-1 truncate",
            isSmallMobile ? "text-xs" : "text-sm"
          )}>
            <div className={cn(
              "bg-green-400 rounded-full animate-pulse flex-shrink-0",
              isSmallMobile ? "h-1.5 w-1.5" : "h-2 w-2"
            )}></div>
            <span className="truncate">En ligne</span>
          </div>
        </div>
      </div>
      
      {/* Bouton fermer */}
      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cn(
            "hover:bg-red-500/20 text-white hover:text-red-200 transition-all duration-200",
            // Tailles de bouton responsives
            isSmallMobile ? "h-8 w-8" : isMobile ? "h-9 w-9" : "h-9 w-9"
          )}
          aria-label="Fermer le chat"
        >
          <X className={cn(
            isSmallMobile ? "h-3 w-3" : isMobile ? "h-4 w-4" : "h-4 w-4"
          )} />
        </Button>
      </div>
    </div>
  )
}

