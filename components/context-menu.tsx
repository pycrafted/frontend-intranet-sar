"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  MoreVertical,
  FileText,
  Folder
} from 'lucide-react'

interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  item: {
    id: string
    type: 'folder' | 'document'
    name: string
  }
  onView?: () => void
  onDownload?: () => void
  onDelete?: () => void
  onRename?: () => void
}

export function ContextMenu({
  isOpen,
  position,
  onClose,
  item,
  onView,
  onDownload,
  onDelete,
  onRename
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [touchStartTime, setTouchStartTime] = useState<number>(0)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleTouchOutside = (event: TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleTouchOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleTouchOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartTime(Date.now())
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTime
    // Si le touch dure plus de 500ms, considérer comme un long press
    if (touchDuration > 500) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (!isOpen) return null

  const menuItems = [
    ...(item.type === 'document' && onView ? [{
      icon: Eye,
      label: 'Voir',
      action: onView,
      color: 'text-gray-700'
    }] : []),
    ...(item.type === 'document' && onDownload ? [{
      icon: Download,
      label: 'Télécharger',
      action: onDownload,
      color: 'text-gray-700'
    }] : []),
    ...(onRename ? [{
      icon: Edit,
      label: 'Renommer',
      action: onRename,
      color: 'text-gray-700'
    }] : []),
    ...(onDelete ? [{
      icon: Trash2,
      label: 'Supprimer',
      action: onDelete,
      color: 'text-red-600'
    }] : [])
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {menuItems.map((menuItem, index) => {
        const Icon = menuItem.icon
        return (
          <button
            key={index}
            onClick={() => {
              menuItem.action()
              onClose()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition-colors text-left"
          >
            <Icon className={`h-4 w-4 ${menuItem.color}`} />
            <span className={menuItem.color}>{menuItem.label}</span>
          </button>
        )
      })}
    </div>
  )
}
