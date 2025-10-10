import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'


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
  folder?: number
}

export interface DocumentStats {
  total_documents: number
  total_downloads: number
  recent_documents: number
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [folderTree, setFolderTree] = useState<DocumentFolderTree[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DocumentStats | null>(null)

  // Charger la liste des documents
  const fetchDocuments = async (searchTerm?: string, ordering?: string) => {
    try {
      console.log('📄 [USE_DOCUMENTS] fetchDocuments appelé:', {
        searchTerm,
        ordering,
        timestamp: new Date().toISOString()
      })
      
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (ordering) params.append('ordering', ordering)

      console.log('📄 [USE_DOCUMENTS] Paramètres de requête:', {
        searchTerm,
        ordering,
        params: params.toString()
      })

      const response = await api.get(`/documents/?${params.toString()}`)
      
      console.log('📄 [USE_DOCUMENTS] Réponse fetchDocuments:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📄 [USE_DOCUMENTS] Données reçues:', {
          count: data.results ? data.results.length : data.length,
          hasResults: !!data.results,
          dataType: Array.isArray(data) ? 'array' : typeof data
        })
        setDocuments(data.results || data)
      } else {
        const errorText = await response.text()
        console.error('📄 [USE_DOCUMENTS] Erreur fetchDocuments:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200)
        })
        throw new Error(`Erreur lors du chargement des documents: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      console.error('📄 [USE_DOCUMENTS] Erreur complète fetchDocuments:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }


  // Charger les statistiques
  const fetchStats = async () => {
    try {
      console.log('📊 [USE_DOCUMENTS] fetchStats appelé:', {
        timestamp: new Date().toISOString()
      })
      
      const response = await api.get('/documents/stats/')
      
      console.log('📊 [USE_DOCUMENTS] Réponse fetchStats:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 [USE_DOCUMENTS] Statistiques reçues:', data)
        setStats(data)
      } else {
        const errorText = await response.text()
        console.error('📊 [USE_DOCUMENTS] Erreur fetchStats:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200)
        })
      }
    } catch (err) {
      console.error('📊 [USE_DOCUMENTS] Erreur complète fetchStats:', err)
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
        folder: formData.get('folder'),
        fileName: documentData.file.name
      })

      console.log('🔍 [UPLOAD] Envoi de la requête POST vers /documents/')
      const response = await api.post('/documents/', formData)

      console.log('🔍 [UPLOAD] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
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
          console.error('❌ [UPLOAD] Erreur API (JSON):', errorData)
        } catch (jsonError) {
          // Si la réponse n'est pas du JSON valide (erreur 500)
          const textResponse = await response.text()
          console.error('❌ [UPLOAD] Erreur API (non-JSON):', textResponse)
          throw new Error(`Erreur serveur (${response.status}): ${textResponse.substring(0, 100)}...`)
        }
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
      const response = await api.get(`/documents/${documentId}/download/`)
      
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
      const response = await api.get(`/documents/${documentId}/view/`)
      
      if (response.ok) {
        // Créer un blob et l'ouvrir dans un nouvel onglet
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        
        // Nettoyer l'URL après un délai
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 10000)
        
        return { success: true }
      } else {
        // Essayer de récupérer le message d'erreur du backend
        let errorMessage = 'Erreur lors de la visualisation'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          // Si on ne peut pas parser le JSON, utiliser le message par défaut
        }
        throw new Error(errorMessage)
      }
    } catch (err) {
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

      const response = await api.delete(`/documents/${documentId}/`)

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

      const response = await api.post('/documents/bulk-delete/', {
        document_ids: documentIds
      })

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
      
      const response = await api.get(`/documents/folders/?${params.toString()}`)
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
      const response = await api.get('/documents/folders/tree/')
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

      const response = await api.post('/documents/folders/', folderData)

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

      const response = await api.patch(`/documents/folders/${folderId}/`, folderData)

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

      const response = await api.delete(`/documents/folders/${folderId}/`)

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

      const response = await api.patch(`/documents/${documentId}/`, {
        title: newTitle
      })

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
    fetchStats()
    fetchFolders()
    fetchFolderTree()
  }, [])

  return {
    documents,
    folders,
    folderTree,
    isLoading,
    error,
    stats,
    fetchDocuments,
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
