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
  const [sortBy, setSortBy] = useState("-created_at")
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null)
  const [currentFolderPath, setCurrentFolderPath] = useState<Array<{id: number, name: string}>>([])
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
  const [deleteItem, setDeleteItem] = useState<{ type: 'document' | 'folder'; name: string; id: number } | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [touchStartTime, setTouchStartTime] = useState<number>(0)
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showTouchIndicator, setShowTouchIndicator] = useState<{ x: number; y: number } | null>(null)

  const {
    documents,
    categories,
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
    downloadDocument,
    viewDocument,
    deleteDocument,
    deleteMultipleDocuments,
    renameDocument,
  } = useDocuments()

  // Filtrer les documents et dossiers localement
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = searchTerm === "" || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === null || doc.category === selectedCategory
    const matchesFolder = selectedFolder === null ? doc.folder === null : doc.folder === selectedFolder
    
    // Log supprimé pour éviter les re-renders excessifs
    
    return matchesSearch && matchesCategory && matchesFolder
  })

  // Obtenir les dossiers du dossier actuel
  const currentFolders = folders.filter(folder => folder.parent === selectedFolder)
  
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

  // Calcul de la pagination
  const totalPages = Math.ceil(allItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = allItems.slice(startIndex, endIndex)

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedFolder])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    fetchDocuments(searchTerm, sort)
  }

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Aujourd'hui"
    if (diffInDays === 1) return "Hier"
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    return date.toLocaleDateString("fr-FR")
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
      sidebarProps={{
        activeCategory: selectedCategory,
        onCategoryChange: handleCategoryChange,
        activeSort: sortBy,
        onSortChange: handleSortChange,
        activeFolder: selectedFolder,
        onFolderChange: handleFolderChange,
        documentsCount: allItems.length,
        documents: documents,
        categories: categories,
        folders: folders,
        folderTree: folderTree,
        onUploadSuccess: () => fetchDocuments(),
        onUploadClick: () => {
          // Déclencher l'ouverture du modal d'upload
          const uploadButton = document.querySelector('[data-upload-trigger]') as HTMLButtonElement
          if (uploadButton) {
            uploadButton.click()
          }
        },
        onCreateFolder: createFolder,
        onUpdateFolder: updateFolder,
        onDeleteFolder: deleteFolder,
      }}
    >
      <div className="min-h-screen rounded-xl m-4" style={{ backgroundColor: '#e5e7eb' }}>
        {/* Google Drive Style Header */}
        <div className="border-b border-gray-300 sticky top-0 z-10 rounded-t-xl" style={{ backgroundColor: '#e5e7eb' }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Logo and title */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">Documents SAR</h1>
                </div>
                <div className="text-sm text-gray-500">
                  {allItems.length} élément{allItems.length > 1 ? 's' : ''}
                  {stats && (
                    <span className="ml-2">
                      • {stats.total_downloads} téléchargements
                    </span>
                  )}
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Nouveau
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setIsFolderModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4" />
                  Dossier
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search bar */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher dans Documents SAR"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            {currentFolderPath.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <button
                  onClick={() => handleBreadcrumbClick(null)}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Tous les documents
                </button>
                {currentFolderPath.map((folder, index) => (
                  <div key={folder.id} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <button
                      onClick={() => handleBreadcrumbClick(folder.id)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {folder.name}
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Main content */}
        <div className="p-6 rounded-b-xl" style={{ backgroundColor: '#e5e7eb' }}>
            {/* Action bar */}
            {selectedDocuments.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-700">
                      {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} sélectionné{selectedDocuments.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-red-600 hover:text-red-700"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDocuments([])}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Documents table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center px-4 py-3">
                    <Checkbox
                      checked={selectedDocuments.length === paginatedItems.filter(item => item.type === 'document').length && paginatedItems.filter(item => item.type === 'document').length > 0}
                      onCheckedChange={handleSelectAll}
                      className="mr-3"
                    />
                  <div className="flex-1 text-sm font-medium text-gray-700">Nom</div>
                  <div className="w-24 text-sm font-medium text-gray-700">Catégorie</div>
                  <div className="w-32 text-sm font-medium text-gray-700">Propriétaire</div>
                  <div className="w-32 text-sm font-medium text-gray-700">Modifié</div>
                  <div className="w-24 text-sm font-medium text-gray-700">Taille</div>
                  <div className="w-16"></div>
                </div>
              </div>

                {/* Table body */}
                <div className="divide-y divide-gray-200">
                  {paginatedItems.map((item) => {
                  const isSelected = selectedDocuments.includes(parseInt(item.id.replace('doc-', '')))
                  const isFolder = item.type === 'folder'
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (isFolder) {
                          handleFolderClick(parseInt(item.id.replace('folder-', '')))
                        }
                      }}
                      onContextMenu={(e) => handleContextMenu(e, {
                        id: item.id,
                        type: item.type,
                        name: item.name
                      })}
                      onTouchStart={(e) => handleTouchStart(e, {
                        id: item.id,
                        type: item.type,
                        name: item.name
                      })}
                      onTouchEnd={(e) => handleTouchEnd(e, {
                        id: item.id,
                        type: item.type,
                        name: item.name
                      })}
                      onTouchCancel={handleTouchCancel}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (!isFolder) {
                            handleDocumentSelect(parseInt(item.id.replace('doc-', '')))
                          }
                        }}
                        className="mr-3"
                      />
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${isFolder ? 'bg-blue-50' : 'bg-red-50'}`}>
                          {isFolder ? (
                            <Folder className={`h-5 w-5 ${isFolder ? 'text-blue-600' : 'text-red-600'}`} />
                          ) : (
                            <FilePdf className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="w-24 text-sm text-gray-600">
                        {isFolder ? "Dossier" : "Document"}
                      </div>

                      <div className="w-32 text-sm text-gray-600 truncate">
                        {item.created_by_name}
                      </div>

                      <div className="w-32 text-sm text-gray-600">
                        {formatDate(item.created_at)}
                      </div>

                      <div className="w-24 text-sm text-gray-600">
                        {isFolder ? "-" : `${(item.size / 1024 / 1024).toFixed(1)} MB`}
                      </div>

                      <div className="w-16 flex items-center justify-end">
                        {/* Espace réservé pour l'alignement */}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Empty state */}
            {paginatedItems.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Essayez de modifier vos critères de recherche" : "Commencez par ajouter un document"}
                </p>
                <DocumentUpload 
                  key={`upload-empty-${selectedFolder || 'root'}`}
                  showAsButton={true}
                  buttonText="Ajouter un document"
                  currentFolder={selectedFolder}
                  onUploadSuccess={() => {
                    fetchDocuments()
                  }}
                  onUploadError={(error) => {
                    console.error('Upload error:', error)
                  }}
                />
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <div className="flex items-center justify-center gap-6 p-6 rounded-xl" style={{backgroundColor: "#e5e7eb"}}>
                  {/* Flèche Gauche */}
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === 1 ? "#e5e7eb" : "#3b82f6",
                      border: "none"
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" style={{color: currentPage === 1 ? "#9ca3af" : "white"}} />
                  </Button>

                  {/* Indicateur de page */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-700">
                      Page {currentPage} sur {totalPages}
                    </span>
                  </div>

                  {/* Flèche Droite */}
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === totalPages ? "#e5e7eb" : "#3b82f6",
                      border: "none"
                    }}
                  >
                    <ChevronRight className="h-6 w-6" style={{color: currentPage === totalPages ? "#9ca3af" : "white"}} />
                  </Button>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && documents.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchDocuments()}
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              </div>
            )}
        </div>
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
    </LayoutWrapper>
  )
}