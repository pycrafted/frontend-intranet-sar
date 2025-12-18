"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2 flex-wrap">
                {article ? (
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                ) : item?.type === 'document' ? (
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
                )}
                <span className="break-words">{getTitle()}</span>
              </DialogTitle>
              <DialogDescription 
                className="text-xs sm:text-sm text-gray-600 break-words"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {getMessage()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 custom-scrollbar" style={{ minHeight: 0 }}>
          {!isMultiple && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  {article ? (
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  ) : item?.type === 'document' ? (
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  ) : (
                    <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span 
                    className="font-medium text-xs sm:text-sm text-gray-700 break-words break-all"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      display: 'block'
                    }}
                    title={getItemName()}
                  >
                    {getItemName()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t flex-shrink-0 gap-2 sm:gap-3 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isDeleting}
            className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading || isDeleting}
            className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            {(isLoading || isDeleting) ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}