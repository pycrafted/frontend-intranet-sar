"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Edit, Share, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleDropdownMenuProps {
  onEdit?: () => void
  onShare?: () => void
  onDelete?: () => void
}

export function SimpleDropdownMenu({ onEdit, onShare, onDelete }: SimpleDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer le menu en cliquant ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Empêcher le scroll de la page
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleItemClick = (callback?: () => void) => {
    if (callback) {
      callback()
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton trigger */}
      <button
        className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity hover:bg-gray-100 rounded-md flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 top-9 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation()
                handleItemClick(onEdit)
              }}
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation()
                handleItemClick(onShare)
              }}
            >
              <Share className="w-4 h-4" />
              Partager
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation()
                handleItemClick(onDelete)
              }}
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
