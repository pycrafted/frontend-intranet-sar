"use client"

import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Folder, FileText } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  item?: {
    type: 'document' | 'folder' | 'article' | 'news' | 'event' | 'announcement'
    name: string
    title?: string
    id?: number
  }
  article?: {
    type: 'news' | 'event' | 'announcement'
    title: string
    id?: number
  }
  isLoading?: boolean
  isDeleting?: boolean
  isMultiple?: boolean
  count?: number
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  article,
  isLoading = false,
  isDeleting = false,
  isMultiple = false,
  count = 0
}: DeleteConfirmationModalProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  // Déterminer l'élément à supprimer (article ou item)
  const targetItem = article || item
  if (!targetItem) return null

  const getItemType = () => {
    if (article) {
      return article.type === 'news' ? 'actualité' : 
             article.type === 'event' ? 'événement' : 
             article.type === 'announcement' ? 'annonce' : 'article'
    }
    return item?.type === 'document' ? 'document' : 'dossier'
  }

  const getItemName = () => {
    if (article) {
      return article.title
    }
    return item?.name || ''
  }

  const getTitle = () => {
    if (isMultiple) {
      return `Supprimer ${count} ${getItemType()}(s)`
    }
    return `Supprimer ${getItemType()}`
  }

  const getMessage = () => {
    if (isMultiple) {
      return `Êtes-vous sûr de vouloir supprimer ${count} ${getItemType()}(s) ? Cette action est irréversible.`
    }
    return `Êtes-vous sûr de vouloir supprimer "${getItemName()}" ? Cette action est irréversible.`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              {article ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : item?.type === 'document' ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : (
                <Folder className="h-5 w-5 text-yellow-600" />
              )}
              {getTitle()}
            </h2>
            
            <p className="text-sm text-gray-600 mb-6">
              {getMessage()}
            </p>

            {!isMultiple && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  {article ? (
                    <FileText className="h-4 w-4" />
                  ) : item?.type === 'document' ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                  <span className="font-medium">{getItemName()}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading || isDeleting}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirm}
                disabled={isLoading || isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {(isLoading || isDeleting) ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}