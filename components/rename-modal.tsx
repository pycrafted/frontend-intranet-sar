"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, FileText, Folder } from 'lucide-react'

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => void
  item: {
    type: 'document' | 'folder'
    name: string
  }
  isLoading?: boolean
}

export function RenameModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  isLoading = false
}: RenameModalProps) {
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNewName(item.name)
    }
  }, [isOpen, item.name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim() && newName.trim() !== item.name) {
      onConfirm(newName.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {item.type === 'document' ? (
              <FileText className="h-5 w-5 text-blue-600" />
            ) : (
              <Folder className="h-5 w-5 text-yellow-600" />
            )}
            Renommer {item.type === 'document' ? 'le document' : 'le dossier'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newName" className="text-sm font-medium text-gray-700">
                Nouveau nom
              </Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Nom du ${item.type === 'document' ? 'document' : 'dossier'}`}
                className="mt-1"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="text-sm text-gray-500">
              Ancien nom : <span className="font-medium">{item.name}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!newName.trim() || newName.trim() === item.name || isLoading}
            >
              {isLoading ? 'Renommage...' : 'Renommer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}




