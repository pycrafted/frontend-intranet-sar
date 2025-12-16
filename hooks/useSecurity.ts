import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'

export interface SecurityDocument {
  id: number
  title: string
  description: string | null
  file: string
  file_url: string
  file_size: number
  file_size_display: string
  file_type: 'pdf' | 'image' | 'other'
  is_image: boolean
  is_pdf: boolean
  icon: string
  order: number
  uploaded_by: number
  uploaded_by_name: string | null
  created_at: string
  updated_at: string
  is_active: boolean
}

interface SecurityDocumentUpload {
  title: string
  description?: string
  file: File
  icon?: string
  order?: number
}

export function useSecurity() {
  const [documents, setDocuments] = useState<SecurityDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get('/security/documents/', { requireAuth: false })
      
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
        return { success: true, data }
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur lors de la récupération des documents' }))
        throw new Error(errorData.detail || 'Erreur lors de la récupération des documents')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des documents'
      setError(errorMessage)
      console.error('❌ [USE_SECURITY] Erreur fetchDocuments:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadDocument = async (documentData: SecurityDocumentUpload) => {
    try {
      setIsLoading(true)
      setError(null)

      // Validation du type de fichier avant l'upload
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']
      const fileExtension = '.' + documentData.file.name.split('.').pop()?.toLowerCase() || ''
      if (!allowedExtensions.includes(fileExtension)) {
        const errorMessage = `Type de fichier non autorisé. Extensions acceptées: ${allowedExtensions.join(', ')}`
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Validation de la taille (50MB max)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (documentData.file.size > maxSize) {
        const errorMessage = `Le fichier est trop volumineux. Taille maximale: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Tronquer le nom du fichier si trop long (max 100 caractères avec extension)
      let fileName = documentData.file.name
      const maxFilenameLength = 100
      if (fileName.length > maxFilenameLength) {
        const nameParts = fileName.split('.')
        const ext = nameParts.pop() // Get the extension
        let name = nameParts.join('.') // Get the name without extension

        const maxNameLength = maxFilenameLength - (ext ? ext.length + 1 : 0) // +1 for the dot
        if (maxNameLength > 0) {
          name = name.substring(0, maxNameLength)
        } else {
          name = name.substring(0, 1) // Ensure at least one character if extension is too long
        }
        fileName = ext ? `${name}.${ext}` : name

        // Créer un nouveau fichier avec le nom tronqué
        const truncatedFile = new File([documentData.file], fileName, { type: documentData.file.type })
        documentData.file = truncatedFile
      }

      const formData = new FormData()
      formData.append('title', documentData.title)
      if (documentData.description) {
        formData.append('description', documentData.description)
      }
      formData.append('file', documentData.file)
      if (documentData.icon) {
        formData.append('icon', documentData.icon)
      }
      if (documentData.order !== undefined) {
        formData.append('order', documentData.order.toString())
      }

      const response = await api.post('/security/documents/', formData, { requireAuth: false })

      if (response.ok) {
        const newDocument = await response.json()
        setDocuments(prev => [...prev, newDocument].sort((a, b) => a.order - b.order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        return { success: true, document: newDocument }
      } else {
        let errorData
        try {
          errorData = await response.json()
          const errorMessage = errorData.file?.[0] || errorData.title?.[0] || errorData.description?.[0] || errorData.detail || 'Erreur lors de l\'upload'
          throw new Error(errorMessage)
        } catch (jsonError) {
          const textResponse = await response.text()
          throw new Error(`Erreur serveur (${response.status}): ${textResponse.substring(0, 100)}...`)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload'
      setError(errorMessage)
      console.error('❌ [USE_SECURITY] Erreur uploadDocument:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDocument = async (documentId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.delete(`/security/documents/${documentId}/`, { requireAuth: false })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        return { success: true }
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur lors de la suppression' }))
        throw new Error(errorData.detail || 'Erreur lors de la suppression')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      console.error('❌ [USE_SECURITY] Erreur deleteDocument:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  }
}

