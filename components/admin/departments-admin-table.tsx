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
  X
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useDepartmentsAdmin, Department } from "@/hooks/useDepartmentsAdmin"

interface DepartmentsAdminTableProps {
  onDepartmentSelect?: (department: any) => void
}

export function DepartmentsAdminTable({ onDepartmentSelect }: DepartmentsAdminTableProps) {
  const {
    departments,
    loading,
    error,
    selectedDepartments,
    setSelectedDepartments,
    clearSelection,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    deleteMultipleDepartments
  } = useDepartmentsAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })

  // Debounce pour la recherche (comme dans actualités)
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

  const handleDelete = async (departmentId: number) => {
    await deleteDepartment(departmentId)
  }

  const handleDeleteMultiple = async () => {
    await deleteMultipleDepartments(selectedDepartments)
    clearSelection()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDepartments(departments.map(dept => dept.id))
    } else {
      setSelectedDepartments([])
    }
  }

  const handleSelectDepartment = (departmentId: number, checked: boolean) => {
    if (checked) {
      setSelectedDepartments(prev => [...prev, departmentId])
    } else {
      setSelectedDepartments(prev => prev.filter(id => id !== departmentId))
    }
  }

  const handleCreateDepartment = () => {
    setEditingDepartment(null)
    setFormData({ name: '' })
    setShowCreateModal(true)
  }

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department)
    setFormData({ name: department.name })
    setShowEditModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formData)
      } else {
        await createDepartment(formData)
      }

      setShowCreateModal(false)
      setShowEditModal(false)
      setEditingDepartment(null)
      setFormData({ name: '' })
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    }
  }

  const handleCancelForm = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingDepartment(null)
    setFormData({ name: '' })
  }

  const getDepartmentIcon = (departmentName: string) => {
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
    return icons[departmentName as keyof typeof icons] || '🏢'
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr })
  }

  // Filtrer les départements selon le terme de recherche debounced
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Database className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chargement des départements...</h3>
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
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Administration des Départements
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {departments.length} département{departments.length > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateDepartment}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un département
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Barre de recherche et filtres */}
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Barre de recherche avancée (comme navbar secondaire) */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-xl">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                searchFocused ? 'text-green-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Rechercher dans les départements..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 ${
                  searchFocused 
                    ? 'border-green-500 ring-2 ring-green-100 bg-white shadow-md' 
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
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span>En cours de recherche...</span>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Actions en lot - Caché */}
            {false && selectedDepartments.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">
                    {selectedDepartments.length} département{selectedDepartments.length > 1 ? 's' : ''} sélectionné{selectedDepartments.length > 1 ? 's' : ''}
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
                          Êtes-vous sûr de vouloir supprimer {selectedDepartments.length} département{selectedDepartments.length > 1 ? 's' : ''} ? 
                          Cette action est irréversible.
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedDepartments([])} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table des départements */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <tr>
                  <th className="px-4 py-3 text-left hidden">
                    <Checkbox
                      checked={selectedDepartments.length === filteredDepartments.length && filteredDepartments.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Département</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Employés</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Créé le</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {filteredDepartments.map((department) => (
                  <tr key={department.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors">
                    <td className="px-4 py-3 hidden">
                      <Checkbox
                        checked={selectedDepartments.includes(department.id)}
                        onCheckedChange={(checked) => handleSelectDepartment(department.id, checked as boolean)}
                        className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-lg">
                          {getDepartmentIcon(department.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{department.name}</div>
                          <div className="text-sm text-gray-500">ID: {department.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {department.employee_count} employé{department.employee_count > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-green-500" />
                          {formatDate(department.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-green-50 text-green-600 hover:text-green-700"
                          onClick={() => handleEditDepartment(department)}
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
                                Êtes-vous sûr de vouloir supprimer le département "{department.name}" ? 
                                Cette action est irréversible et affectera tous les employés de ce département.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(department.id)}>
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
          {filteredDepartments.length === 0 && (
            <div className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Aucun département trouvé</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucun département ne correspond à votre recherche.' : 'Aucun département n\'a été créé pour le moment.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création de département */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Plus className="h-5 w-5 text-green-600" />
              Nouveau département
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Créez un nouveau département pour organiser les employés
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">Nom du département *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Direction Commerciale et Marketing"
                className="border-green-200 focus:border-green-400"
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
              >
                Créer le département
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

      {/* Modal d'édition de département */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Edit className="h-5 w-5 text-green-600" />
              Modifier le département
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Modifiez les informations du département
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">Nom du département *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Direction Commerciale et Marketing"
                className="border-green-200 focus:border-green-400"
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
              >
                Modifier le département
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
