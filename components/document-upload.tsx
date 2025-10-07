"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { useDocuments, type DocumentUpload } from '@/hooks/useDocuments'

interface DocumentUploadProps {
  onUploadSuccess?: () => void
  onUploadError?: (error: string) => void
  showAsButton?: boolean
  buttonText?: string
  'data-upload-trigger'?: boolean
  currentFolder?: number | null
  isModal?: boolean
}

export function DocumentUpload({ 
  onUploadSuccess, 
  onUploadError, 
  showAsButton = false, 
  buttonText = "Nouveau",
  'data-upload-trigger': dataUploadTrigger,
  currentFolder = null,
  isModal = false
}: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadDocument } = useDocuments()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier que c'est un PDF
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont autorisés')
        return
      }
      
      // Vérifier la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale: 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)
      
      // Auto-remplir le titre si vide
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace('.pdf', '')
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF')
      return
    }

    if (!formData.title.trim()) {
      setError('Veuillez saisir un titre')
      return
    }


    setIsUploading(true)
    setError(null)

    try {
      const documentData: DocumentUpload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        file: selectedFile,
        folder: currentFolder || undefined
      }

      console.log('🔍 [UPLOAD] Données d\'upload:', {
        title: documentData.title,
        folder: documentData.folder,
        currentFolder: currentFolder,
        fileName: selectedFile?.name
      })

      const result = await uploadDocument(documentData)
      
      if (result.success) {
        // Réinitialiser le formulaire
        setFormData({ title: '', description: '' })
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setIsOpen(false)
        onUploadSuccess?.()
      } else {
        setError(result.error || 'Erreur lors de l\'upload')
        onUploadError?.(result.error || 'Erreur lors de l\'upload')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', description: '' })
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsOpen(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Si le composant est utilisé comme bouton et n'est pas ouvert, afficher le bouton
  if (showAsButton && !isOpen && !isModal) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
        variant="outline"
        data-upload-trigger={dataUploadTrigger}
      >
        <Upload className="h-4 w-4" />
        {buttonText}
      </Button>
    )
  }

  // Si le composant est utilisé comme formulaire ou en modal, l'afficher directement
  // Utiliser useEffect pour éviter les re-renders infinis
  useEffect(() => {
    if (!showAsButton || isModal) {
      setIsOpen(true)
    }
  }, [showAsButton, isModal])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Uploader un document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection de fichier */}
          <div className="space-y-2">
            <Label htmlFor="file">Fichier PDF *</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <FileText className="h-4 w-4 text-red-600" />
                <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nom du document"
              disabled={isUploading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description optionnelle du document"
              rows={3}
              disabled={isUploading}
            />
          </div>


          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !formData.title.trim()}
              className="flex-1"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Upload en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Uploader
                </div>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
