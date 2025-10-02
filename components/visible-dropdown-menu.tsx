"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VisibleDropdownMenuProps {
  onEdit?: () => void
  onDelete?: () => void
}

export function VisibleDropdownMenu({ onEdit, onDelete }: VisibleDropdownMenuProps) {
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
      {/* Bouton trigger - Toujours visible */}
      <button
        className="h-8 w-8 p-0 opacity-80 hover:opacity-100 transition-all duration-200 hover:bg-gray-100 rounded-md flex items-center justify-center group"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        title="Options"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 top-9 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation()
                handleItemClick(onEdit)
              }}
            >
              <Edit className="w-4 h-4 text-gray-600" />
              Modifier
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150"
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



