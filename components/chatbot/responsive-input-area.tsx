"use client"

import React, { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Send, Paperclip, X, FileText, Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { useScreenSize } from "@/hooks/useScreenSize"

interface ResponsiveInputAreaProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSendMessage: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isTyping: boolean
  inputRef: React.RefObject<HTMLInputElement>
  selectedFile: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  className?: string
}

export function ResponsiveInputArea({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyDown,
  isTyping,
  inputRef,
  selectedFile,
  onFileSelect,
  onFileRemove,
  className
}: ResponsiveInputAreaProps) {
  const { isMobile, isSmallMobile } = useScreenSize()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
    // reset pour permettre de re-sélectionner le même fichier
    e.target.value = ''
  }

  const isImage = selectedFile?.type.startsWith('image/')

  const canSend = (inputValue.trim() || selectedFile) && !isTyping

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-gray-50/80 backdrop-blur-sm border-t border-gray-200/50",
        isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-6",
        className
      )}
      style={{ background: "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(52, 66, 86, 0.05))" }}
    >
      {/* Prévisualisation du fichier sélectionné */}
      {selectedFile && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border max-w-[260px]"
            style={{ backgroundColor: 'rgba(52,66,86,0.07)', borderColor: 'rgba(52,66,86,0.2)', color: '#344256' }}
          >
            {isImage ? (
              <Image className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            <span className="truncate font-medium">{selectedFile.name}</span>
            <span className="text-gray-400 flex-shrink-0">
              {(selectedFile.size / 1024).toFixed(0)} Ko
            </span>
          </div>
          <button
            onClick={onFileRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Retirer le fichier"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        {/* Bouton d'attachement */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isTyping}
          title="Joindre une image ou un PDF"
          className={cn(
            "flex-shrink-0 rounded-xl transition-all duration-200 flex items-center justify-center",
            isSmallMobile ? "h-9 w-9" : "h-10 w-10",
            selectedFile
              ? "text-white"
              : "text-gray-400 hover:text-gray-600 bg-white border border-gray-200"
          )}
          style={selectedFile ? { backgroundColor: '#344256' } : undefined}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* Champ de texte */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={selectedFile ? "Ajouter un commentaire (optionnel)..." : "Décrivez votre problème IT ou SAP..."}
            className={cn(
              "w-full bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none transition-all duration-200 shadow-lg placeholder-gray-400",
              isSmallMobile ? "px-3 py-2 text-sm" : isMobile ? "px-4 py-2.5 text-sm" : "px-4 py-3 text-sm"
            )}
            style={{ borderColor: "rgba(229, 231, 235, 0.5)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(52, 66, 86, 0.5)"
              e.target.style.boxShadow = "0 0 0 2px rgba(52, 66, 86, 0.2)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(229, 231, 235, 0.5)"
              e.target.style.boxShadow = "none"
            }}
            disabled={isTyping}
          />
        </div>

        {/* Bouton d'envoi */}
        <Button
          onClick={onSendMessage}
          disabled={!canSend}
          size="icon"
          className={cn(
            "flex-shrink-0 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-2xl",
            isSmallMobile ? "h-9 w-9" : isMobile ? "h-10 w-10" : "h-11 w-11"
          )}
          style={{ backgroundColor: "#344256" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#2a3441" }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#344256" }}
          aria-label="Envoyer"
        >
          <Send className={cn(isSmallMobile ? "h-4 w-4" : "h-4 w-4")} />
        </Button>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 mt-2 px-1">
        Entrée pour envoyer · Images &amp; PDF acceptés (max 10 Mo)
      </p>
    </div>
  )
}
