import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'

export interface DocumentCategory {
  id: number
  name: string
  description: string
  color: string
  icon: string
  order: number
}

export interface DocumentFolder {
  id: number
  name: string
  description: string
  parent: number | null
  parent_name: string | null
  color: string
  icon: string
  created_by: number
  created_by_name: string
  created_at: string
  updated_at: string
  is_active: boolean
  full_path: string
  depth: number
  children_count: number
  documents_count: number
  total_documents_count: number
}

export interface DocumentFolderTree extends Omit<DocumentFolder, 'children_count' | 'total_documents_count'> {
  children: DocumentFolderTree[]
  documents_count: number
}

export interface Document {
  id: number
  title: string
  description: string
  file: string
  file_size: number
  file_size_display: string
  file_extension: string
  is_pdf: boolean
  file_url: string
  uploaded_by: number
  uploaded_by_name: string
  category: number | null
  category_info: DocumentCategory | null
  folder: number | null
  folder_info: DocumentFolder | null
  created_at: string
  updated_at: string
  download_count: number
  is_active: boolean
}

export interface DocumentUpload {
  title: string
  description?: string
  file: File
  category?: number
  folder?: number
}

export interface DocumentStats {
  total_documents: number
  total_downloads: number
  recent_documents: number
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [folderTree, setFolderTree] = useState<DocumentFolderTree[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DocumentStats | null>(null)

  // Charger la liste des documents
  const fetchDocuments = async (searchTerm?: string, ordering?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (ordering) params.append('ordering', ordering)

      const response = await api.get(`/api/documents/?${params.toString()}`, { requireAuth: true })
      
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.results || data)
      } else {
        throw new Error('Erreur lors du chargement des documents')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/documents/categories/', { requireAuth: true })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err)
    }
  }

  // Charger les statistiques
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/documents/stats/', { requireAuth: true })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
    }
  }

  // Uploader un document
  const uploadDocument = async (documentData: DocumentUpload) => {
    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('title', documentData.title)
      if (documentData.description) {
        formData.append('description', documentData.description)
      }
      if (documentData.category) {
        formData.append('category', documentData.category.toString())
      }
      if (documentData.folder) {
        formData.append('folder', documentData.folder.toString())
        console.log('🔍 [UPLOAD] Dossier ajouté au FormData:', documentData.folder)
      } else {
        console.log('🔍 [UPLOAD] Aucun dossier spécifié (folder est null/undefined)')
      }
      formData.append('file', documentData.file)

      console.log('🔍 [UPLOAD] FormData complet:', {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        folder: formData.get('folder'),
        fileName: documentData.file.name
      })

      const response = await api.post('/api/documents/', formData, {
        requireAuth: true,
      })

      if (response.ok) {
        const newDocument = await response.json()
        console.log('🔍 [UPLOAD] Document créé par le backend:', {
          id: newDocument.id,
          title: newDocument.title,
          folder: newDocument.folder,
          folder_info: newDocument.folder_info
        })
        setDocuments(prev => [newDocument, ...prev])
        return { success: true, document: newDocument }
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (jsonError) {
          // Si la réponse n'est pas du JSON valide (erreur 500)
          const textResponse = await response.text()
          console.error('❌ [UPLOAD] Erreur API (non-JSON):', textResponse)
          throw new Error(`Erreur serveur (${response.status}): ${textResponse.substring(0, 100)}...`)
        }
        console.error('❌ [UPLOAD] Erreur API:', errorData)
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de l\'upload')
      }
    } catch (err) {
      console.error('❌ [UPLOAD] Erreur complète:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Télécharger un document
  const downloadDocument = async (documentId: number, filename: string) => {
    try {
      const response = await api.get(`/api/documents/${documentId}/download/`, { requireAuth: true })
      
      if (response.ok) {
        // Créer un blob et déclencher le téléchargement
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        // Recharger la liste pour mettre à jour le compteur
        fetchDocuments()
        return { success: true }
      } else {
        throw new Error('Erreur lors du téléchargement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du téléchargement'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Visualiser un document
  const viewDocument = async (documentId: number) => {
    try {
      console.log('🔍 [VIEW] Tentative de visualisation du document:', documentId)
      
      const response = await api.get(`/api/documents/${documentId}/view/`, { requireAuth: true })
      
      if (response.ok) {
        // Créer un blob et l'ouvrir dans un nouvel onglet
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        
        // Nettoyer l'URL après un délai
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 10000)
        
        console.log('✅ [VIEW] Document ouvert avec succès')
        return { success: true }
      } else {
        console.error('❌ [VIEW] Erreur lors de la récupération du document:', response.status)
        throw new Error('Erreur lors de la visualisation')
      }
    } catch (err) {
      console.error('❌ [VIEW] Erreur complète:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la visualisation'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Supprimer un document
  const deleteDocument = async (documentId: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.delete(`/api/documents/${documentId}/`, { requireAuth: true })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        return { success: true }
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Supprimer plusieurs documents
  const deleteMultipleDocuments = async (documentIds: number[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post('/api/documents/bulk-delete/', {
        document_ids: documentIds
      }, { requireAuth: true })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => !documentIds.includes(doc.id)))
        return { success: true }
      } else {
        throw new Error('Erreur lors de la suppression multiple')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression multiple'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les dossiers
  const fetchFolders = async (parentId?: number | null) => {
    try {
      const params = new URLSearchParams()
      if (parentId !== undefined) {
        params.append('parent', parentId === null ? 'null' : parentId.toString())
      }
      
      const response = await api.get(`/api/documents/folders/?${params.toString()}`, { requireAuth: true })
      if (response.ok) {
        const data = await response.json()
        setFolders(data.results || data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des dossiers:', err)
    }
  }

  // Charger l'arbre des dossiers
  const fetchFolderTree = async () => {
    try {
      const response = await api.get('/api/documents/folders/tree/', { requireAuth: true })
      if (response.ok) {
        const data = await response.json()
        setFolderTree(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'arbre des dossiers:', err)
    }
  }

  // Créer un dossier
  const createFolder = async (folderData: { name: string; description?: string; parent?: number | null; color?: string; icon?: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post('/api/documents/folders/', folderData, { requireAuth: true })

      if (response.ok) {
        const newFolder = await response.json()
        setFolders(prev => [newFolder, ...prev])
        // Recharger l'arbre des dossiers
        fetchFolderTree()
        return { success: true, folder: newFolder }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la création du dossier')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du dossier'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Modifier un dossier
  const updateFolder = async (folderId: number, folderData: { name?: string; description?: string; parent?: number | null; color?: string; icon?: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.patch(`/api/documents/folders/${folderId}/`, folderData, { requireAuth: true })

      if (response.ok) {
        const updatedFolder = await response.json()
        setFolders(prev => prev.map(folder => folder.id === folderId ? updatedFolder : folder))
        // Recharger l'arbre des dossiers
        fetchFolderTree()
        return { success: true, folder: updatedFolder }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la modification du dossier')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du dossier'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Supprimer un dossier
  const deleteFolder = async (folderId: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.delete(`/api/documents/folders/${folderId}/`, { requireAuth: true })

      if (response.ok) {
        setFolders(prev => prev.filter(folder => folder.id !== folderId))
        // Recharger l'arbre des dossiers
        fetchFolderTree()
        return { success: true }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la suppression du dossier')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du dossier'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const renameDocument = async (documentId: number, newTitle: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.patch(`/api/documents/${documentId}/`, {
        title: newTitle
      }, { requireAuth: true })

      if (response.ok) {
        const updatedDocument = await response.json()
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? { ...doc, title: newTitle } : doc
        ))
        return { success: true, document: updatedDocument }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Erreur lors du renommage du document')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du renommage du document'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données au montage
  useEffect(() => {
    fetchDocuments()
    fetchCategories()
    fetchStats()
    fetchFolders()
    fetchFolderTree()
  }, [])

  return {
    documents,
    categories,
    folders,
    folderTree,
    isLoading,
    error,
    stats,
    fetchDocuments,
    fetchCategories,
    fetchFolders,
    fetchFolderTree,
    createFolder,
    updateFolder,
    deleteFolder,
    uploadDocument,
    downloadDocument,
    viewDocument,
    deleteDocument,
    deleteMultipleDocuments,
    renameDocument,
  }
}
