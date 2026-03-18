"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useScreenSize } from "@/hooks/useScreenSize"

interface ResponsiveInputAreaProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isTyping: boolean
  inputRef: React.RefObject<HTMLInputElement>
  className?: string
}

export function ResponsiveInputArea({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyPress,
  isTyping,
  inputRef,
  className
}: ResponsiveInputAreaProps) {
  const { isMobile, isTablet, isSmallMobile } = useScreenSize()

  return (
    <div className={cn(
      "bg-gradient-to-r from-gray-50/80 backdrop-blur-sm border-t border-gray-200/50",
      // Padding responsif
      isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-6",
      className
    )}
    style={{ background: "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(52, 66, 86, 0.05))" }}
    >
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Posez une question sur la SAR, QualiPro ou SAP..."
            className={cn(
              "w-full bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none transition-all duration-200 shadow-lg placeholder-gray-500",
              // Tailles d'input responsives
              isSmallMobile ? "px-3 py-2 text-sm" : isMobile ? "px-4 py-2.5 text-sm" : "px-4 py-3 text-sm"
            )}
            style={{
              borderColor: "rgba(229, 231, 235, 0.5)"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(52, 66, 86, 0.5)";
              e.target.style.boxShadow = "0 0 0 2px rgba(52, 66, 86, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(229, 231, 235, 0.5)";
              e.target.style.boxShadow = "none";
            }}
            disabled={isTyping}
          />
        </div>
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isTyping}
          size="icon"
          className={cn(
            "text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-2xl",
            // Tailles de bouton responsives
            isSmallMobile ? "h-10 w-10" : isMobile ? "h-11 w-11" : "h-12 w-12"
          )}
          style={{ 
            backgroundColor: "#344256",
          }}
          onMouseEnter={(e) => {
            if (typeof window !== 'undefined' && window.innerWidth >= 640) {
              e.currentTarget.style.backgroundColor = "#2a3441";
            }
          }}
          onMouseLeave={(e) => {
            if (typeof window !== 'undefined' && window.innerWidth >= 640) {
              e.currentTarget.style.backgroundColor = "#344256";
            }
          }}
          aria-label="Envoyer le message"
        >
          <Send className={cn(
            // Tailles d'icônes responsives
            isSmallMobile ? "h-4 w-4" : isMobile ? "h-4 w-4" : "h-5 w-5"
          )} />
        </Button>
      </div>
    </div>
  )
}

