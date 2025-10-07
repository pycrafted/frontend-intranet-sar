"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { StandardLoader } from "@/components/ui/standard-loader"
import { DocumentUpload } from "@/components/document-upload"
import { ContextMenu } from "@/components/context-menu"
import { FolderCreateModal } from "@/components/folder-create-modal"
import { RenameModal } from "@/components/rename-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { DocumentsHeader } from "@/components/documents-header"
import { DocumentsToolbar } from "@/components/documents-toolbar"
import { DocumentsGrid } from "@/components/documents-grid"
import { DocumentsBreadcrumb } from "@/components/documents-breadcrumb"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { UploadDialog } from "@/components/upload-dialog"
import { RenameDialog } from "@/components/rename-dialog"
import { InfoModal } from "@/components/info-modal"
import { useDocuments, Document } from "@/hooks/useDocuments"
import {
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  File,
  FilePen as FilePdf,
  FileSpreadsheet,
  FileImage,
  MoreVertical,
  Star,
  Share2,
  Trash2,
  Edit,
  Copy,
  Move,
  SortAsc,
  SortDesc,
  Plus,
  FolderPlus,
  Settings,
  RefreshCw,
  AlertCircle,
  Folder,
  ChevronRight,
  Home,
  X,
  ChevronLeft,
  HelpCircle,
  LayoutGrid,
  List,
} from "lucide-react"

const sortOptions = [
  { value: "title", label: "Nom A-Z", icon: SortAsc },
  { value: "-title", label: "Nom Z-A", icon: SortDesc },
  { value: "-created_at", label: "Plus récent", icon: Calendar },
  { value: "created_at", label: "Plus ancien", icon: Calendar },
  { value: "-download_count", label: "Plus téléchargé", icon: Download },
  { value: "-file_size", label: "Plus volumineux", icon: File },
]

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sortBy, setSortBy] = useState("-created_at")
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([])
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null)
  const [currentFolderPath, setCurrentFolderPath] = useState<Array<{id: number, name: string}>>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    item: { id: string; type: 'folder' | 'document'; name: string } | null
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    item: null
  })

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [renameItem, setRenameItem] = useState<{ type: 'document' | 'folder'; name: string; id: number } | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [renameDialogItem, setRenameDialogItem] = useState<{ id: string; name: string } | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: 'document' | 'folder'; name: string; id: number } | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; message: string }>({ title: '', message: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [touchStartTime, setTouchStartTime] = useState<number>(0)
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showTouchIndicator, setShowTouchIndicator] = useState<{ x: number; y: number } | null>(null)

  // Debounce pour la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Recherche immédiate si le champ est vide
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 1000) // 1 seconde pour laisser le temps de finir d'écrire
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
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
  } = useDocuments()

  // Filtrer les documents et dossiers localement
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = debouncedSearchTerm === "" || 
        doc.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        doc.uploaded_by_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesFolder = selectedFolder === null ? doc.folder === null : doc.folder === selectedFolder
    
    return matchesSearch && matchesFolder
  })

  // Obtenir les dossiers du dossier actuel avec filtrage par recherche
  const currentFolders = folders.filter(folder => {
    const matchesParent = folder.parent === selectedFolder
    const matchesSearch = debouncedSearchTerm === "" || 
        folder.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        folder.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        folder.created_by_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    return matchesParent && matchesSearch
  })
  
  // Log supprimé pour éviter les re-renders excessifs

  // Combiner documents et dossiers pour l'affichage
  const allItems = [
    ...currentFolders.map(folder => ({
      id: `folder-${folder.id}`,
      type: 'folder' as const,
      name: folder.name,
      description: folder.description,
      created_at: folder.created_at,
      updated_at: folder.updated_at,
      created_by_name: folder.created_by_name,
      folder_info: folder,
      size: 0,
      file_extension: '',
      download_count: 0
    })),
    ...filteredDocuments.map(doc => ({
      id: `doc-${doc.id}`,
      type: 'document' as const,
      name: doc.title,
      description: doc.description,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      created_by_name: doc.uploaded_by_name,
      folder_info: doc.folder_info,
      size: doc.file_size,
      file_extension: doc.file_extension,
      download_count: doc.download_count,
      file_url: doc.file_url,
      is_pdf: doc.is_pdf
    }))
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Aujourd'hui"
    if (diffInDays === 1) return "Hier"
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    return date.toLocaleDateString("fr-FR")
  }

  // Convertir les données pour le nouveau design
  const convertToFileItems = (items: any[]): Array<{
    id: string
    name: string
    type: "folder" | "file"
    fileType?: string
    size?: string
    modifiedDate: string
    owner: string
  }> => {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      fileType: item.file_extension?.toLowerCase(),
      size: item.type === 'folder' ? undefined : `${(item.size / 1024 / 1024).toFixed(1)} MB`,
      modifiedDate: formatDate(item.created_at),
      owner: item.created_by_name || 'Moi'
    }))
  }

  const fileItems = convertToFileItems(allItems)

  // Calcul de la pagination
  const totalPages = Math.ceil(allItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = allItems.slice(startIndex, endIndex)

  // Déclencher la recherche quand le terme de recherche debounced change
  useEffect(() => {
    fetchDocuments(debouncedSearchTerm, sortBy)
  }, [debouncedSearchTerm, sortBy])

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedFolder])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Forcer la recherche immédiate sur Enter
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
    }
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    fetchDocuments(debouncedSearchTerm, sort)
  }


  const handleFolderChange = (folderId: number | null) => {
  // Log supprimé pour éviter les re-renders excessifs
    setSelectedFolder(folderId)
    if (folderId === null) {
      setCurrentFolderPath([])
    } else {
      // Trouver le chemin du dossier
      const findFolderPath = (folders: any[], targetId: number, path: Array<{id: number, name: string}> = []): Array<{id: number, name: string}> => {
        for (const folder of folders) {
          const newPath = [...path, { id: folder.id, name: folder.name }]
          if (folder.id === targetId) {
            return newPath
          }
          if (folder.children && folder.children.length > 0) {
            const result = findFolderPath(folder.children, targetId, newPath)
            if (result.length > 0) {
              return result
            }
          }
        }
        return []
      }
      const path = findFolderPath(folderTree, folderId)
      setCurrentFolderPath(path)
    }
  }

  const handleFolderClick = (folderId: number) => {
    handleFolderChange(folderId)
  }

  const handleBreadcrumbClick = (folderId: number | null) => {
    handleFolderChange(folderId)
  }

  const handleContextMenu = (e: React.MouseEvent, item: { id: string; type: 'folder' | 'document'; name: string }) => {
    e.preventDefault()
    e.stopPropagation()
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      item
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      item: null
    })
  }

  const handleContextAction = (action: () => void) => {
    action()
    closeContextMenu()
  }

  const handleTouchStart = (e: React.TouchEvent, item: { id: string; type: 'folder' | 'document'; name: string }) => {
    setTouchStartTime(Date.now())
    const touch = e.touches[0]
    setTouchStartPosition({ x: touch.clientX, y: touch.clientY })
    
    // Afficher l'indicateur après 300ms
    setTimeout(() => {
      if (Date.now() - touchStartTime >= 300) {
        setShowTouchIndicator({ x: touch.clientX, y: touch.clientY })
      }
    }, 300)
  }

  const handleTouchEnd = (e: React.TouchEvent, item: { id: string; type: 'folder' | 'document'; name: string }) => {
    const touchDuration = Date.now() - touchStartTime
    const touch = e.changedTouches[0]
    const touchEndPosition = { x: touch.clientX, y: touch.clientY }
    
    // Masquer l'indicateur
    setShowTouchIndicator(null)
    
    // Calculer la distance du mouvement
    const distance = Math.sqrt(
      Math.pow(touchEndPosition.x - touchStartPosition.x, 2) + 
      Math.pow(touchEndPosition.y - touchStartPosition.y, 2)
    )
    
    // Si c'est un long press (plus de 500ms) et peu de mouvement (moins de 10px)
    if (touchDuration > 500 && distance < 10) {
      e.preventDefault()
      e.stopPropagation()
      
      setContextMenu({
        isOpen: true,
        position: { x: touch.clientX, y: touch.clientY },
        item
      })
    }
  }

  const handleTouchCancel = () => {
    setShowTouchIndicator(null)
  }

  const handleDocumentSelect = (docId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const handleSelectAll = () => {
    const documentItems = allItems.filter(item => item.type === 'document')
    setSelectedDocuments(
      selectedDocuments.length === documentItems.length 
        ? [] 
        : documentItems.map(item => parseInt(item.id.replace('doc-', '')))
    )
  }

  const handleDownload = async (document: Document) => {
    await downloadDocument(document.id, document.title)
  }

  const handleView = async (document: Document) => {
    await viewDocument(document.id)
  }

  const handleDelete = (document: Document) => {
    setDeleteItem({
      type: 'document',
      name: document.title,
      id: document.id
    })
    setIsDeleteModalOpen(true)
  }

  const handleBulkDelete = () => {
    if (selectedDocuments.length === 0) return
    setIsBulkDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return

    try {
      if (deleteItem.type === 'document') {
        await deleteDocument(deleteItem.id)
      } else {
        await deleteFolder(deleteItem.id)
      }
      setIsDeleteModalOpen(false)
      setDeleteItem(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleBulkDeleteConfirm = async () => {
    try {
      await deleteMultipleDocuments(selectedDocuments)
      setSelectedDocuments([])
      setIsBulkDeleteModalOpen(false)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleRename = (document: Document) => {
    setRenameItem({
      type: 'document',
      name: document.title,
      id: document.id
    })
    setIsRenameModalOpen(true)
  }

  const handleRenameFolder = (folderId: number) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return
    
    setRenameItem({
      type: 'folder',
      name: folder.name,
      id: folderId
    })
    setIsRenameModalOpen(true)
  }

  const handleRenameConfirm = async (newName: string) => {
    if (!renameItem) return

    try {
      if (renameItem.type === 'document') {
        const result = await renameDocument(renameItem.id, newName)
        if (result.success) {
          // Le document est déjà mis à jour dans le hook
        } else {
          alert(result.error || 'Erreur lors du renommage du document')
        }
      } else {
        await updateFolder(renameItem.id, { name: newName })
        fetchFolders() // Recharger la liste des dossiers
      }
      setIsRenameModalOpen(false)
      setRenameItem(null)
    } catch (error) {
      console.error('Erreur lors du renommage:', error)
      alert('Erreur lors du renommage')
    }
  }

  // Nouvelles fonctions pour le design
  const handleCreateFolder = async (name: string) => {
    try {
      const result = await createFolder({
        name,
        description: '',
        parent: selectedFolder,
        color: '#3b82f6',
        icon: 'folder'
      })
      if (result.success) {
        fetchFolders()
        fetchFolderTree()
      }
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    let successCount = 0
    let errorCount = 0

    for (const file of files) {
      try {
        const result = await uploadDocument({
          title: file.name,
          file,
          folder: selectedFolder
        })
        
        if (result.success) {
          console.log('✅ Fichier uploadé avec succès:', file.name)
          successCount++
        } else {
          console.error('❌ Erreur lors de l\'upload:', result.error)
          alert(`Erreur lors de l'upload de ${file.name}: ${result.error}`)
          errorCount++
        }
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error)
        alert(`Erreur lors de l'upload de ${file.name}`)
        errorCount++
      }
    }
    
    // Fermer le modal d'upload
    setIsUploadModalOpen(false)
    
    // Afficher un message de résumé
    if (successCount > 0) {
      alert(`${successCount} fichier(s) uploadé(s) avec succès !`)
    }
    
    if (errorCount > 0) {
      alert(`${errorCount} fichier(s) n'ont pas pu être uploadés.`)
    }
  }

  const handleDeleteItem = (id: string) => {
    if (id.startsWith('doc-')) {
      const docId = parseInt(id.replace('doc-', ''))
      const document = documents.find(doc => doc.id === docId)
      if (document) {
        handleDelete(document)
      }
    } else if (id.startsWith('folder-')) {
      const folderId = parseInt(id.replace('folder-', ''))
      const folder = folders.find(f => f.id === folderId)
      if (folder) {
        setDeleteItem({
          type: 'folder',
          name: folder.name,
          id: folderId
        })
        setIsDeleteModalOpen(true)
      }
    }
  }

  // Fonction pour visualiser un document
  const handleViewDocument = async (id: string) => {
    if (id.startsWith('doc-')) {
      const docId = parseInt(id.replace('doc-', ''))
      
      try {
        const result = await viewDocument(docId)
        if (result.success) {
          // Document ouvert avec succès
        } else {
          // Afficher le message d'erreur du backend dans un modal
          setInfoModalContent({
            title: "Visualisation non disponible",
            message: result.error
          })
          setIsInfoModalOpen(true)
        }
      } catch (error) {
        setInfoModalContent({
          title: "Erreur de visualisation",
          message: 'Erreur lors de la visualisation du document'
        })
        setIsInfoModalOpen(true)
      }
    }
  }

  // Fonction pour télécharger un document
  const handleDownloadDocument = async (id: string) => {
    if (id.startsWith('doc-')) {
      const docId = parseInt(id.replace('doc-', ''))
      const document = documents.find(doc => doc.id === docId)
      
      if (document) {
        console.log('🔍 [DOWNLOAD] Téléchargement du document:', docId, document.title)
        
        try {
          const result = await downloadDocument(docId, document.title)
          if (result.success) {
            console.log('✅ [DOWNLOAD] Document téléchargé avec succès')
          } else {
            console.error('❌ [DOWNLOAD] Erreur lors du téléchargement:', result.error)
            alert(`Erreur lors du téléchargement: ${result.error}`)
          }
        } catch (error) {
          console.error('❌ [DOWNLOAD] Erreur complète:', error)
          alert('Erreur lors du téléchargement du document')
        }
      } else {
        console.error('❌ [DOWNLOAD] Document non trouvé:', docId)
        alert('Document non trouvé')
      }
    }
  }

  // Fonction pour renommer un document ou dossier
  const handleRenameItem = (id: string, currentName: string) => {
    setRenameDialogItem({ id, name: currentName })
    setIsRenameDialogOpen(true)
  }

  // Fonction pour confirmer le renommage
  const handleConfirmRename = async (newName: string) => {
    if (!renameDialogItem) return

    setIsRenaming(true)
    try {
      if (renameDialogItem.id.startsWith('doc-')) {
        const docId = parseInt(renameDialogItem.id.replace('doc-', ''))
        console.log('🔍 [RENAME] Renommage du document:', docId, 'nouveau nom:', newName)
        
        const result = await renameDocument(docId, newName)
        if (result.success) {
          console.log('✅ [RENAME] Document renommé avec succès')
          setIsRenameDialogOpen(false)
          setRenameDialogItem(null)
        } else {
          console.error('❌ [RENAME] Erreur lors du renommage:', result.error)
          alert(`Erreur lors du renommage: ${result.error}`)
        }
      } else if (renameDialogItem.id.startsWith('folder-')) {
        const folderId = parseInt(renameDialogItem.id.replace('folder-', ''))
        console.log('🔍 [RENAME] Renommage du dossier:', folderId, 'nouveau nom:', newName)
        
        const result = await updateFolder(folderId, { name: newName })
        if (result.success) {
          console.log('✅ [RENAME] Dossier renommé avec succès')
          setIsRenameDialogOpen(false)
          setRenameDialogItem(null)
        } else {
          console.error('❌ [RENAME] Erreur lors du renommage:', result.error)
          alert(`Erreur lors du renommage: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('❌ [RENAME] Erreur complète:', error)
      alert('Erreur lors du renommage')
    } finally {
      setIsRenaming(false)
    }
  }

  // Fonctions de pagination
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF": return FilePdf
      case "Excel": return FileSpreadsheet
      case "Word": return FileText
      case "PNG":
      case "JPG": return FileImage
      default: return File
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case "PDF": return "text-red-600"
      case "Excel": return "text-green-600"
      case "Word": return "text-blue-600"
      case "PNG":
      case "JPG": return "text-purple-600"
      default: return "text-gray-600"
    }
  }

  const getFileBgColor = (type: string) => {
    switch (type) {
      case "PDF": return "bg-red-50"
      case "Excel": return "bg-green-50"
      case "Word": return "bg-blue-50"
      case "PNG":
      case "JPG": return "bg-purple-50"
      default: return "bg-gray-50"
    }
  }

  if (isLoading && documents.length === 0) {
    return (
      <LayoutWrapper>
        <StandardLoader 
          title="Chargement des documents..."
          message="Veuillez patienter pendant que nous récupérons vos documents."
        />
      </LayoutWrapper>
    )
  }

  if (error && documents.length === 0) {
    return (
      <LayoutWrapper>
        <StandardLoader 
          error={error}
          showRetry={true}
          onRetry={() => fetchDocuments()}
        />
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper 
      secondaryNavbarProps={{
        searchTerm,
        onSearchChange: handleSearch,
        onSearchKeyDown: handleSearchKeyDown,
        searchPlaceholder: "Rechercher dans les documents...",
        isTyping
      }}
      // sidebarProps supprimés - plus de sidebar pour les documents
    >
      <div className="min-h-screen" style={{ backgroundColor: '#e5e7eb' }}>
        <main className="mx-auto max-w-[1600px] px-6 py-6">
          <div className="mb-4">
            <DocumentsBreadcrumb 
              currentPath={currentFolderPath}
              onBreadcrumbClick={handleBreadcrumbClick}
                />
              </div>
          <DocumentsToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateFolder={() => setIsFolderModalOpen(true)}
            onUpload={() => setIsUploadModalOpen(true)}
          />
          <DocumentsGrid 
            items={fileItems} 
            viewMode={viewMode} 
            onDelete={handleDeleteItem}
            onFolderClick={handleFolderClick}
            onView={handleViewDocument}
            onRename={handleRenameItem}
            onDownload={handleDownloadDocument}
          />
        </main>
      </div>

      {/* Indicateur de long press */}
      {showTouchIndicator && (
        <div
          className="fixed z-40 w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full border-2 border-blue-500 animate-pulse pointer-events-none"
          style={{
            left: showTouchIndicator.x - 24,
            top: showTouchIndicator.y - 24,
          }}
        />
      )}

      {/* Menu contextuel */}
      {contextMenu.isOpen && contextMenu.item && (
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={closeContextMenu}
          item={contextMenu.item}
          onView={contextMenu.item.type === 'document' ? () => {
            const docId = parseInt(contextMenu.item!.id.replace('doc-', ''))
            const document = documents.find(doc => doc.id === docId)
            if (document) {
              handleView(document)
            }
          } : undefined}
          onDownload={contextMenu.item.type === 'document' ? () => {
            const docId = parseInt(contextMenu.item!.id.replace('doc-', ''))
            const document = documents.find(doc => doc.id === docId)
            if (document) {
              handleDownload(document)
            }
          } : undefined}
          onDelete={() => {
            if (contextMenu.item!.type === 'document') {
              const docId = parseInt(contextMenu.item!.id.replace('doc-', ''))
              const document = documents.find(doc => doc.id === docId)
              if (document) {
                handleDelete(document)
              }
            } else {
              const folderId = parseInt(contextMenu.item!.id.replace('folder-', ''))
              const folder = folders.find(f => f.id === folderId)
              if (folder) {
                setDeleteItem({
                  type: 'folder',
                  name: folder.name,
                  id: folderId
                })
                setIsDeleteModalOpen(true)
              }
            }
          }}
          onRename={() => {
            if (contextMenu.item!.type === 'document') {
              const docId = parseInt(contextMenu.item!.id.replace('doc-', ''))
              const document = documents.find(doc => doc.id === docId)
              if (document) {
                handleRename(document)
              }
            } else {
              const folderId = parseInt(contextMenu.item!.id.replace('folder-', ''))
              handleRenameFolder(folderId)
            }
          }}
        />
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && renameItem && (
        <RenameModal
          isOpen={isRenameModalOpen}
          onClose={() => {
            setIsRenameModalOpen(false)
            setRenameItem(null)
          }}
          onConfirm={handleRenameConfirm}
          item={renameItem}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteItem && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setDeleteItem(null)
          }}
          onConfirm={handleDeleteConfirm}
          item={deleteItem}
          isLoading={isLoading}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onConfirm={handleBulkDeleteConfirm}
          item={{ type: 'document', name: '', id: 0 }}
          isLoading={isLoading}
          isMultiple={true}
          count={selectedDocuments.length}
        />
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Ajouter un document</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DocumentUpload 
              currentFolder={selectedFolder}
              isModal={true}
              onUploadSuccess={() => {
                fetchDocuments()
                setIsUploadModalOpen(false)
              }}
              onUploadError={(error) => {
                console.error('Upload error:', error)
              }}
            />
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Créer un dossier</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFolderModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FolderCreateModal 
              isOpen={true}
              onClose={() => {
                setIsFolderModalOpen(false)
                fetchFolders() // Rafraîchir la liste des dossiers
              }}
              onCreateFolder={createFolder}
              folders={folders}
              folderTree={folderTree}
            />
          </div>
        </div>
      )}

      {/* Nouveaux modals pour le design */}
      <CreateFolderDialog
        open={isFolderModalOpen}
        onOpenChange={setIsFolderModalOpen}
        onCreateFolder={handleCreateFolder}
      />

      <UploadDialog 
        open={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen} 
        onUpload={handleUploadFiles} 
      />

        {/* Dialogue de renommage */}
        <RenameDialog
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          currentName={renameDialogItem?.name || ""}
          onRename={handleConfirmRename}
          isLoading={isRenaming}
        />

        {/* Modal d'information */}
        <InfoModal
          open={isInfoModalOpen}
          onOpenChange={setIsInfoModalOpen}
          title={infoModalContent.title}
          message={infoModalContent.message}
          actionLabel="Compris"
          showDownloadIcon={infoModalContent.message.includes("télécharger")}
        />
    </LayoutWrapper>
  )
}