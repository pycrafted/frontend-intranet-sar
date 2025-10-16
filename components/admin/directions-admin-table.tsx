"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Building2,
  Users,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle,
  Plus,
  Calendar,
  X,
  Crown,
  UserCheck
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useDirectionsAdmin, Direction } from "@/hooks/useDirectionsAdmin"

interface DirectionsAdminTableProps {
  onDirectionSelect?: (direction: any) => void
}

export function DirectionsAdminTable({ onDirectionSelect }: DirectionsAdminTableProps) {
  const {
    directions,
    loading,
    error,
    selectedDirections,
    setSelectedDirections,
    clearSelection,
    createDirection,
    updateDirection,
    deleteDirection,
    deleteMultipleDirections
  } = useDirectionsAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })

  // Debounce pour la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
    }
  }

  const handleDelete = async (directionId: number) => {
    await deleteDirection(directionId)
  }

  const handleDeleteMultiple = async () => {
    await deleteMultipleDirections(selectedDirections)
    clearSelection()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDirections(directions.map(dept => dept.id))
    } else {
      setSelectedDirections([])
    }
  }

  const handleSelectDirection = (directionId: number, checked: boolean) => {
    console.log('handleSelectDirection called:', { directionId, checked, selectedDirections })
    if (checked) {
      const current = Array.isArray(selectedDirections) ? selectedDirections : []
      const newSelection = [...current, directionId]
      console.log('Adding direction, new selection:', newSelection)
      setSelectedDirections(newSelection)
    } else {
      const current = Array.isArray(selectedDirections) ? selectedDirections : []
      const newSelection = current.filter(id => id !== directionId)
      console.log('Removing direction, new selection:', newSelection)
      setSelectedDirections(newSelection)
    }
  }

  const handleCreateDirection = () => {
    setEditingDirection(null)
    setFormData({ name: '' })
    setShowCreateModal(true)
  }

  const handleEditDirection = (direction: Direction) => {
    setEditingDirection(direction)
    setFormData({ name: direction.name })
    setShowEditModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingDirection) {
        await updateDirection(editingDirection.id, formData)
      } else {
        await createDirection(formData)
      }

      setShowCreateModal(false)
      setShowEditModal(false)
      setEditingDirection(null)
      setFormData({ name: '' })
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    }
  }

  const handleCancelForm = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingDirection(null)
    setFormData({ name: '' })
  }

  const getDirectionIcon = (directionName: string) => {
    const icons = {
      'Direction Commerciale et Marketing': '📊',
      'Administration': '🏢',
      'Direction des Ressources Humaines': '👥',
      'Direction EXECUTIVE - SUPPORT': '⚙️',
      'Direction Technique': '🔧',
      'Direction Executif': '👑',
      'Direction Qualité': '✅',
      'Direction Financière': '💰',
      'Direction IT': '💻',
      'Direction Logistique': '🚛',
      'Direction Sécurité': '🛡️'
    }
    return icons[directionName as keyof typeof icons] || '🏢'
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non renseigné'
    try {
      return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr })
    } catch (error) {
      return 'Date invalide'
    }
  }

  // Filtrer les directions selon le terme de recherche debounced
  const filteredDirections = directions.filter(dept =>
    dept.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto">
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chargement des directions...</h3>
              <p className="text-gray-600">Veuillez patienter pendant que nous récupérons les données.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Erreur lors du chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-sm"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec style inspiré de la page actualités */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-violet-400 rounded-full shadow-sm"></div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Administration des Directions
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {directions.length} direction{directions.length > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateDirection}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une direction
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Barre de recherche et filtres */}
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Barre de recherche avancée */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-xl">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                searchFocused ? 'text-purple-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Rechercher dans les directions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 ${
                  searchFocused 
                    ? 'border-purple-500 ring-2 ring-purple-100 bg-white shadow-md' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
              
              {/* Indicateur de frappe */}
              {searchTerm && isTyping && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2 text-xs text-gray-600 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span>En cours de recherche...</span>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Actions en lot */}
            {Array.isArray(selectedDirections) && selectedDirections.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-800">
                    {selectedDirections.length} direction{selectedDirections.length > 1 ? 's' : ''} sélectionnée{selectedDirections.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer {selectedDirections.length} direction{selectedDirections.length > 1 ? 's' : ''} ? 
                          Cette action est irréversible et affectera tous les agents de ces directions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMultiple}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="outline" size="sm" onClick={() => setSelectedDirections([])} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table des directions */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={Array.isArray(selectedDirections) ? selectedDirections.length === filteredDirections.length && filteredDirections.length > 0 : false}
                      onCheckedChange={handleSelectAll}
                      className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Direction</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Agents</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Créé le</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {filteredDirections.map((direction) => (
                  <tr key={direction.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={Array.isArray(selectedDirections) ? selectedDirections.includes(direction.id) : false}
                        onCheckedChange={(checked) => handleSelectDirection(direction.id, checked as boolean)}
                        className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-lg">
                          {getDirectionIcon(direction.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{direction.name}</div>
                          <div className="text-sm text-gray-500">ID: {direction.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Agents associés
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-purple-500" />
                          {formatDate(direction.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-purple-50 text-purple-600 hover:text-purple-700"
                          onClick={() => handleEditDirection(direction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-red-50 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer la direction "{direction.name}" ? 
                                Cette action est irréversible et affectera tous les agents de cette direction.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(direction.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat */}
          {filteredDirections.length === 0 && (
            <div className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Aucune direction trouvée</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucune direction ne correspond à votre recherche.' : 'Aucune direction n\'a été créée pour le moment.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création de direction */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Plus className="h-5 w-5 text-purple-600" />
              Nouvelle direction
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Créez une nouvelle direction pour organiser les agents
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">Nom de la direction *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Direction Commerciale et Marketing"
                className="border-purple-200 focus:border-purple-400"
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-sm"
              >
                Créer la direction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelForm}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition de direction */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Edit className="h-5 w-5 text-purple-600" />
              Modifier la direction
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Modifiez les informations de la direction
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">Nom de la direction *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Direction Commerciale et Marketing"
                className="border-purple-200 focus:border-purple-400"
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-sm"
              >
                Modifier la direction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelForm}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
