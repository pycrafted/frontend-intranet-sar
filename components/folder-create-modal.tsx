"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Folder, X, AlertCircle } from 'lucide-react'
import { DocumentFolder, DocumentFolderTree } from '@/hooks/useDocuments'

interface FolderCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (folderData: { name: string; description?: string; parent?: number | null; color?: string; icon?: string }) => Promise<{ success: boolean; error?: string }>
  folders: DocumentFolder[]
  folderTree: DocumentFolderTree[]
}

const folderColors = [
  { value: '#6B7280', label: 'Gris', color: 'bg-gray-500' },
  { value: '#3B82F6', label: 'Bleu', color: 'bg-blue-500' },
  { value: '#10B981', label: 'Vert', color: 'bg-green-500' },
  { value: '#F59E0B', label: 'Orange', color: 'bg-orange-500' },
  { value: '#EF4444', label: 'Rouge', color: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Violet', color: 'bg-purple-500' },
  { value: '#EC4899', label: 'Rose', color: 'bg-pink-500' },
  { value: '#06B6D4', label: 'Cyan', color: 'bg-cyan-500' },
]

const folderIcons = [
  { value: 'folder', label: 'Dossier' },
  { value: 'folder-open', label: 'Dossier ouvert' },
  { value: 'folder-plus', label: 'Nouveau dossier' },
  { value: 'archive', label: 'Archive' },
  { value: 'briefcase', label: 'Portefeuille' },
  { value: 'book', label: 'Livre' },
  { value: 'file-text', label: 'Document' },
  { value: 'folder-download', label: 'Téléchargements' },
]

export function FolderCreateModal({ 
  isOpen, 
  onClose, 
  onCreateFolder, 
  folders, 
  folderTree 
}: FolderCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: null as number | null,
    color: '#6B7280',
    icon: 'folder'
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Le nom du dossier est obligatoire')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const result = await onCreateFolder({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent: formData.parent,
        color: formData.color,
        icon: formData.icon
      })
      
      if (result.success) {
        // Réinitialiser le formulaire
        setFormData({ name: '', description: '', parent: null, color: '#6B7280', icon: 'folder' })
        onClose()
      } else {
        setError(result.error || 'Erreur lors de la création du dossier')
      }
    } catch (err) {
      setError('Erreur lors de la création du dossier')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', parent: null, color: '#6B7280', icon: 'folder' })
    setError(null)
    onClose()
  }

  // Fonction récursive pour créer la liste des dossiers parents
  const buildParentOptions = (folders: DocumentFolderTree[], depth = 0): Array<{ value: number; label: string; depth: number }> => {
    const options: Array<{ value: number; label: string; depth: number }> = []
    
    folders.forEach(folder => {
      options.push({
        value: folder.id,
        label: '  '.repeat(depth) + folder.name,
        depth
      })
      
      if (folder.children && folder.children.length > 0) {
        options.push(...buildParentOptions(folder.children, depth + 1))
      }
    })
    
    return options
  }

  const parentOptions = buildParentOptions(folderTree)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Nouveau dossier
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom du dossier *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du dossier"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description optionnelle du dossier"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Dossier parent</Label>
              <Select
                value={formData.parent?.toString() || 'none'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  parent: value === 'none' ? null : parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un dossier parent (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun (dossier racine)</SelectItem>
                  {parentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folderColors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.color}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icône</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folderIcons.map(icon => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !formData.name.trim()}
                className="gap-2"
              >
                {isCreating ? 'Création...' : 'Créer le dossier'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
