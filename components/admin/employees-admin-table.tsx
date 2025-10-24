"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Building2,
  Phone,
  Smartphone,
  Mail,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Upload,
  Image,
  X
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useEmployeesAdmin } from "@/hooks/useEmployeesAdmin"

interface EmployeesAdminTableProps {
  onEmployeeSelect?: (employee: any) => void
}

export function EmployeesAdminTable({ onEmployeeSelect }: EmployeesAdminTableProps) {
  const {
    employees,
    departments,
    loading,
    error,
    pagination,
    filters,
    selectedEmployees,
    fetchEmployees,
    deleteEmployee,
    deleteMultipleEmployees,
    updateEmployee,
    createEmployee,
    setFilters,
    setSelectedEmployees,
    clearSelection
  } = useEmployeesAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('error')
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_fixed: '',
    phone_mobile: '',
    employee_id: '',
    position_title: '',
    department: '',
    avatar: null as File | null
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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

  // Appliquer la recherche avec le terme debounced
  useEffect(() => {
    setFilters({ search: debouncedSearchTerm })
  }, [debouncedSearchTerm, setFilters])

  // Effet pour gérer les erreurs et afficher les alertes
  useEffect(() => {
    if (error) {
      setAlertMessage(error)
      setAlertType('error')
      // Auto-masquer l'alerte après 5 secondes
      const timer = setTimeout(() => {
        setAlertMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleDelete = async (employeeId: number) => {
    await deleteEmployee(employeeId)
  }

  const handleDeleteMultiple = async () => {
    await deleteMultipleEmployees(selectedEmployees)
    clearSelection()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(employees.map(employee => employee.id))
    } else {
      clearSelection()
    }
  }

  const handleSelectEmployee = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId])
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId))
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_fixed: employee.phone_fixed || '',
      phone_mobile: employee.phone_mobile || '',
      employee_id: employee.employee_id,
      position_title: employee.position_title,
      department: employee.department.toString(),
      avatar: null
    })
    // Afficher l'image existante si disponible
    if (employee.avatar) {
      setAvatarPreview(employee.avatar)
    } else {
      setAvatarPreview(null)
    }
    setShowEditModal(true)
  }

  const handleCreateEmployee = () => {
    setEditingEmployee(null)
    setAvatarPreview(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_fixed: '',
      phone_mobile: '',
      employee_id: '',
      position_title: '',
      department: '',
      avatar: null
    })
    setShowCreateModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation côté frontend
    const requiredFields = ['first_name', 'last_name', 'email', 'position_title', 'department', 'employee_id']
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      alert(`Veuillez remplir tous les champs obligatoires: ${missingFields.join(', ')}`)
      return
    }
    
    try {
      // Créer FormData pour gérer l'upload de fichier
      const formDataToSend = new FormData()
      
      formDataToSend.append('first_name', formData.first_name)
      formDataToSend.append('last_name', formData.last_name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone_fixed', formData.phone_fixed || '')
      formDataToSend.append('phone_mobile', formData.phone_mobile || '')
      formDataToSend.append('employee_id', formData.employee_id)
      formDataToSend.append('position_title', formData.position_title)
      formDataToSend.append('department', formData.department)
      
      // Ajouter l'avatar si présent
      console.log('🖼️ [FORM_DATA] === GESTION DE L\'AVATAR ===')
      console.log('🖼️ [FORM_DATA] Avatar dans formData:', formData.avatar)
      console.log('🖼️ [FORM_DATA] Type d\'avatar:', typeof formData.avatar)
      console.log('🖼️ [FORM_DATA] Avatar est File:', formData.avatar instanceof File)
      
      if (formData.avatar) {
        console.log('🖼️ [FORM_DATA] Détails de l\'avatar:')
        console.log('  - Nom:', formData.avatar.name)
        console.log('  - Taille:', formData.avatar.size, 'bytes')
        console.log('  - Type:', formData.avatar.type)
        console.log('  - Dernière modification:', formData.avatar.lastModified)
        
        formDataToSend.append('avatar', formData.avatar)
        console.log('✅ [FORM_DATA] Avatar ajouté au FormData:', formData.avatar.name)
        
        // Vérifier que l'avatar est bien dans le FormData
        const avatarInFormData = formDataToSend.get('avatar')
        console.log('🔍 [FORM_DATA] Avatar dans FormData:', avatarInFormData)
        console.log('🔍 [FORM_DATA] Type dans FormData:', typeof avatarInFormData)
        console.log('🔍 [FORM_DATA] Est File dans FormData:', avatarInFormData instanceof File)
      } else {
        console.log('⚠️ [FORM_DATA] Pas d\'avatar à ajouter')
      }

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formDataToSend)
      } else {
        await createEmployee(formDataToSend as any)
      }

      // Afficher un message de succès
      setAlertMessage(editingEmployee ? 'Employé modifié avec succès !' : 'Employé créé avec succès !')
      setAlertType('success')
      
      setShowCreateModal(false)
      setShowEditModal(false)
      setEditingEmployee(null)
      setAvatarPreview(null)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_fixed: '',
        phone_mobile: '',
        employee_id: '',
        position_title: '',
        department: '',
        avatar: null
      })
    } catch (error) {
      console.error('❌ [EMPLOYEE_FORM] === ERREUR LORS DE LA SOUMISSION ===')
      console.error('❌ [EMPLOYEE_FORM] Erreur complète:', error)
      console.error('❌ [EMPLOYEE_FORM] Type d\'erreur:', typeof error)
      console.error('❌ [EMPLOYEE_FORM] Message d\'erreur:', error instanceof Error ? error.message : 'Erreur inconnue')
      console.error('❌ [EMPLOYEE_FORM] Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace')
      
      // Afficher une alerte claire à l'utilisateur
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setAlertMessage(errorMessage)
      setAlertType('error')
      
        // Ne pas fermer le modal en cas d'erreur pour permettre la correction
    }
  }

  const handleCancelForm = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingEmployee(null)
    setAvatarPreview(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_fixed: '',
      phone_mobile: '',
      employee_id: '',
      position_title: '',
      department: '',
      avatar: null
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ [AVATAR_UPLOAD] === DÉBUT UPLOAD IMAGE ===')
    console.log('🖼️ [AVATAR_UPLOAD] Événement:', e)
    console.log('🖼️ [AVATAR_UPLOAD] Files:', e.target.files)
    
    const file = e.target.files?.[0]
    if (file) {
      console.log('🖼️ [AVATAR_UPLOAD] Fichier sélectionné:')
      console.log('  - Nom:', file.name)
      console.log('  - Taille:', file.size, 'bytes')
      console.log('  - Type:', file.type)
      console.log('  - Dernière modification:', file.lastModified)
      console.log('  - Dernière modification (date):', new Date(file.lastModified))
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        console.error('❌ [AVATAR_UPLOAD] Type de fichier invalide:', file.type)
        alert('Veuillez sélectionner un fichier image valide')
        return
      }
      console.log('✅ [AVATAR_UPLOAD] Type de fichier valide')
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('❌ [AVATAR_UPLOAD] Fichier trop volumineux:', file.size, 'bytes')
        alert('La taille du fichier ne doit pas dépasser 5MB')
        return
      }
      console.log('✅ [AVATAR_UPLOAD] Taille de fichier valide')

      console.log('🖼️ [AVATAR_UPLOAD] Mise à jour du formData...')
      setFormData(prev => {
        const newData = { ...prev, avatar: file }
        console.log('🖼️ [AVATAR_UPLOAD] Nouveau formData:', newData)
        return newData
      })
      
      // Créer un aperçu de l'image
      console.log('🖼️ [AVATAR_UPLOAD] Création de l\'aperçu...')
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log('🖼️ [AVATAR_UPLOAD] Aperçu créé:', result ? 'OUI' : 'NON')
        console.log('🖼️ [AVATAR_UPLOAD] Longueur de l\'aperçu:', result?.length)
        setAvatarPreview(result)
      }
      reader.onerror = (error) => {
        console.error('❌ [AVATAR_UPLOAD] Erreur lors de la lecture du fichier:', error)
      }
      reader.readAsDataURL(file)
      console.log('✅ [AVATAR_UPLOAD] Upload d\'image terminé avec succès')
    } else {
      console.log('⚠️ [AVATAR_UPLOAD] Aucun fichier sélectionné')
    }
  }

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: null }))
    setAvatarPreview(null)
  }

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

  const handleCloseAlert = () => {
    setAlertMessage(null)
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

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chargement des employés...</h3>
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
                onClick={() => fetchEmployees()}
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
      {/* Alerte d'erreur */}
      {alertMessage && (
        <Alert className={`border-l-4 ${
          alertType === 'error' 
            ? 'border-red-500 bg-red-50 text-red-800' 
            : alertType === 'success'
            ? 'border-green-500 bg-green-50 text-green-800'
            : 'border-yellow-500 bg-yellow-50 text-yellow-800'
        }`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {alertMessage}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseAlert}
              className="h-6 w-6 p-0 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Header avec style inspiré de la page actualités */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  Administration des Employés
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {pagination.total} employé{pagination.total > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateEmployee}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un employé
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-400"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
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
                searchFocused ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Rechercher dans les employés..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 ${
                  searchFocused 
                    ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-md' 
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
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span>En cours de recherche...</span>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Filtres */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Département</label>
                  <Select
                    value={filters.department}
                    onValueChange={(value) => setFilters({ department: value })}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Tous les départements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {getDepartmentIcon(dept.name)} {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Actions en lot</label>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          disabled={selectedEmployees.length === 0}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer ({selectedEmployees.length})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {selectedEmployees.length} employé{selectedEmployees.length > 1 ? 's' : ''} ? 
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
                  </div>
                </div>
              </div>
            )}

            {/* Actions en lot */}
            {selectedEmployees.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    {selectedEmployees.length} employé{selectedEmployees.length > 1 ? 's' : ''} sélectionné{selectedEmployees.length > 1 ? 's' : ''}
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
                          Êtes-vous sûr de vouloir supprimer {selectedEmployees.length} employé{selectedEmployees.length > 1 ? 's' : ''} ? 
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
                  <Button variant="outline" size="sm" onClick={clearSelection} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table des employés */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedEmployees.length === employees.length && employees.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Employé</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Département</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Poste</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Matricule</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                        className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {employee.initials}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.full_name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDepartmentIcon(employee.main_direction_name)}</span>
                        <span className="text-sm text-gray-900">{employee.main_direction_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {employee.position_title}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {employee.phone_fixed && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            {employee.phone_fixed}
                          </div>
                        )}
                        {employee.phone_mobile && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Smartphone className="h-3 w-3" />
                            {employee.phone_mobile}
                          </div>
                        )}
                        {!employee.phone_fixed && !employee.phone_mobile && (
                          <span className="text-xs text-gray-400">Aucun numéro</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-900">{employee.matricule}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditEmployee(employee)}
                          className="hover:bg-blue-50 text-blue-600 hover:text-blue-700"
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
                                Êtes-vous sûr de vouloir supprimer {employee.full_name} ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(employee.id)}>
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

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium text-blue-700">{pagination.start}</span> à <span className="font-medium text-blue-700">{pagination.end}</span> sur <span className="font-medium text-blue-700">{pagination.total}</span> employés
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium text-blue-700">{pagination.page}</span> sur <span className="font-medium text-blue-700">{pagination.total_pages}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.total_pages}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Modal de création d'employé */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Plus className="h-5 w-5 text-blue-600" />
              Nouvel employé
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Ajoutez un nouvel employé à l'annuaire
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Prénom *</label>
                <Input
                  value={formData.first_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, first_name: e.target.value }))
                    }}
                  placeholder="Prénom de l'employé"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Nom *</label>
                <Input
                  value={formData.last_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, last_name: e.target.value }))
                    }}
                  placeholder="Nom de l'employé"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }))
                    }}
                  placeholder="email@entreprise.com"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Matricule *</label>
                <Input
                  value={formData.employee_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, employee_id: e.target.value }))
                    }}
                  placeholder="SAR001"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone fixe</label>
                <Input
                  value={formData.phone_fixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_fixed: e.target.value }))}
                  placeholder="+221 33 825 XX XX"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone mobile</label>
                <Input
                  value={formData.phone_mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_mobile: e.target.value }))}
                  placeholder="77 XXX XX XX"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Poste *</label>
                <Input
                  value={formData.position_title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, position_title: e.target.value }))
                    }}
                  placeholder="Directeur, Manager, Employé..."
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Département *</label>
                <Select
                  value={formData.department}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, department: value }))
                    }}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {getDepartmentIcon(dept.name)} {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Champ Avatar */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block text-gray-700">Photo de profil</label>
                <div className="space-y-4">
                  {/* Aperçu de l'image */}
                  {avatarPreview && (
                    <div className="relative inline-block">
                      <img
                        src={avatarPreview}
                        alt="Aperçu"
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Zone d'upload */}
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="avatar-upload-create"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload-create"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {avatarPreview ? (
                          <Image className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {avatarPreview ? 'Changer la photo' : 'Cliquez pour ajouter une photo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                  onClick={() => {
                    // Logs supprimés pour réduire le bruit
                  }}
              >
                Créer l'employé
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition d'employé */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Edit className="h-5 w-5 text-blue-600" />
              Modifier l'employé
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Modifiez les informations de {editingEmployee?.full_name}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Prénom *</label>
                <Input
                  value={formData.first_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, first_name: e.target.value }))
                    }}
                  placeholder="Prénom de l'employé"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Nom *</label>
                <Input
                  value={formData.last_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, last_name: e.target.value }))
                    }}
                  placeholder="Nom de l'employé"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }))
                    }}
                  placeholder="email@entreprise.com"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Matricule *</label>
                <Input
                  value={formData.employee_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, employee_id: e.target.value }))
                    }}
                  placeholder="SAR001"
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone fixe</label>
                <Input
                  value={formData.phone_fixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_fixed: e.target.value }))}
                  placeholder="+221 33 825 XX XX"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone mobile</label>
                <Input
                  value={formData.phone_mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_mobile: e.target.value }))}
                  placeholder="77 XXX XX XX"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Poste *</label>
                <Input
                  value={formData.position_title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, position_title: e.target.value }))
                    }}
                  placeholder="Directeur, Manager, Employé..."
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Département *</label>
                <Select
                  value={formData.department}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, department: value }))
                    }}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {getDepartmentIcon(dept.name)} {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Champ Avatar */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block text-gray-700">Photo de profil</label>
                <div className="space-y-4">
                  {/* Aperçu de l'image */}
                  {avatarPreview && (
                    <div className="relative inline-block">
                      <img
                        src={avatarPreview}
                        alt="Aperçu"
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Zone d'upload */}
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="avatar-upload-edit"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload-edit"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {avatarPreview ? (
                          <Image className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {avatarPreview ? 'Changer la photo' : 'Cliquez pour ajouter une photo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
              >
                Modifier l'employé
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
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
