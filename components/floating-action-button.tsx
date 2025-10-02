"use client"

import { useState } from "react"
import { Plus, FileText, Megaphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  onCreatePublication?: () => void
  onCreateAnnouncement?: () => void
  className?: string
}

export function FloatingActionButton({ 
  onCreatePublication, 
  onCreateAnnouncement,
  className 
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleMainClick = () => {
    setIsExpanded(!isExpanded)
  }

  const handlePublicationClick = () => {
    setIsExpanded(false)
    onCreatePublication?.()
  }

  const handleAnnouncementClick = () => {
    setIsExpanded(false)
    onCreateAnnouncement?.()
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Overlay pour fermer le menu */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Menu des actions rapides */}
      <div className={cn(
        "absolute bottom-16 right-0 mb-2 transition-all duration-300 ease-out",
        isExpanded 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-2 scale-95 pointer-events-none"
      )}>
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[200px]">
          {/* Option Publication */}
          <button
            onClick={handlePublicationClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 group"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Nouvelle Publication</div>
              <div className="text-sm text-gray-500">Partager une actualité</div>
            </div>
          </button>

          {/* Séparateur */}
          <div className="h-px bg-gray-200 my-1" />

          {/* Option Annonce */}
          <button
            onClick={handleAnnouncementClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors duration-200 group"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
              <Megaphone className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Nouvelle Annonce</div>
              <div className="text-sm text-gray-500">Diffuser une information importante</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bouton principal FAB */}
      <Button
        onClick={handleMainClick}
        size="lg"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out",
          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
          "text-white border-0 p-0",
          isExpanded && "rotate-45"
        )}
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>
    </div>
  )
}
