"use client"

import { useState, useEffect } from "react"
import { Save, Phone, Mail, User, Briefcase, Building, Users, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useUsers } from "@/hooks/useUsers"
import { api } from "@/lib/api-client"

// Interface pour les départements du backend
interface Department {
  id: number
  name: string
  description?: string
  location?: string
}

interface EditProfileDropdownProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditProfileDropdown({ onSuccess, onCancel }: EditProfileDropdownProps) {
  const { user, updateProfile } = useAuth()
  const { users, isLoading: usersLoading, error: usersError } = useUsers()
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [departmentsError, setDepartmentsError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    office_phone: "",
    position: "",
    department: "",
    matricule: "",
    manager: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialiser les données du formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      let departmentValue = ""
      if (user.department) {
        if (typeof user.department === 'object' && 'id' in user.department) {
          departmentValue = user.department.id.toString()
        } else if (typeof user.department === 'string') {
          departmentValue = user.department
        }
      } else if (user.department_id) {
        departmentValue = user.department_id.toString()
      }
      
      let managerValue = ""
      if (user.manager) {
        if (typeof user.manager === 'object' && 'id' in user.manager) {
          managerValue = user.manager.id.toString()
        } else if (typeof user.manager === 'number') {
          managerValue = user.manager.toString()
        } else if (typeof user.manager === 'string') {
          managerValue = user.manager
        }
      } else if (user.manager_id) {
        managerValue = user.manager_id.toString()
      }
      
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        office_phone: user.office_phone || "",
        position: user.position || "",
        department: departmentValue,
        matricule: user.matricule || "",
        manager: managerValue
      })
    }
  }, [user])

  // Récupérer les départements depuis le backend
  useEffect(() => {
    const fetchDepartments = async () => {
      setDepartmentsLoading(true)
      setDepartmentsError(null)
      
      try {
        const response = await api.get('/annuaire/departments/', { requireAuth: false })
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        
        const data = await response.json()
        
        let departmentsArray: Department[] = []
        
        if (Array.isArray(data)) {
          departmentsArray = data
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.results)) {
            departmentsArray = data.results
          } else if (Array.isArray(data.departments)) {
            departmentsArray = data.departments
          } else if (Array.isArray(data.data)) {
            departmentsArray = data.data
          }
        }
        
        setDepartments(departmentsArray)
      } catch (err: any) {
        console.error('Erreur lors de la récupération des départements:', err)
        setDepartmentsError(`Erreur lors de la récupération des départements: ${err.message || 'Erreur inconnue'}`)
        setDepartments([])
      } finally {
        setDepartmentsLoading(false)
      }
    }
    
    fetchDepartments()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) {
      setError(null)
    }
  }

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('Les champs prénom, nom et email sont obligatoires')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide')
      return false
    }

    if (formData.matricule) {
      const matriculeRegex = /^[A-Z0-9]{3,20}$/
      if (!matriculeRegex.test(formData.matricule)) {
        setError('Le matricule doit contenir entre 3 et 20 caractères alphanumériques (lettres majuscules et chiffres uniquement)')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const dataToSend: any = { ...formData }
      
      if (dataToSend.department) {
        dataToSend.department_id = parseInt(dataToSend.department) || null
        delete dataToSend.department
      } else {
        dataToSend.department_id = null
      }
      
      if (dataToSend.manager) {
        dataToSend.manager_id = parseInt(dataToSend.manager) || null
        delete dataToSend.manager
      } else {
        dataToSend.manager_id = null
      }
      
      const result = await updateProfile(dataToSend)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setError('Erreur inattendue lors de la mise à jour du profil')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Profil mis à jour !
          </h3>
          <p className="text-xs text-gray-600">
            Vos informations ont été mises à jour avec succès.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Modifier le profil</h4>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Informations personnelles */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Informations personnelles</h4>
          
          {/* Prénom */}
          <div className="space-y-1">
            <label htmlFor="edit-first_name" className="text-[10px] text-red-600 font-medium">Prénom *</label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="edit-first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                className="pl-7 h-7 text-xs border-gray-300"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Nom */}
          <div className="space-y-1">
            <label htmlFor="edit-last_name" className="text-[10px] text-red-600 font-medium">Nom *</label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="edit-last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className="pl-7 h-7 text-xs border-gray-300"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="edit-email" className="text-[10px] text-red-600 font-medium">Email *</label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-7 h-7 text-xs border-gray-300"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Téléphone personnel */}
          <div className="space-y-1">
            <label htmlFor="edit-phone_number" className="text-[10px] text-red-600 font-medium">Téléphone personnel</label>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="edit-phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                className="pl-7 h-7 text-xs border-gray-300"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Téléphone fixe */}
          <div className="space-y-1">
            <label htmlFor="edit-office_phone" className="text-[10px] text-red-600 font-medium">Téléphone fixe</label>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="edit-office_phone"
                type="tel"
                value={formData.office_phone}
                onChange={(e) => handleInputChange("office_phone", e.target.value)}
                className="pl-7 h-7 text-xs border-gray-300"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Informations professionnelles</h4>
          
          {/* Poste */}
          <div className="space-y-1">
            <label htmlFor="edit-position" className="text-[10px] text-red-600 font-medium">Poste occupé</label>
            <div className="relative">
              <Briefcase className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="edit-position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className="pl-7 h-7 text-xs border-gray-300"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Département */}
          <div className="space-y-1">
            <label htmlFor="edit-department" className="text-[10px] text-red-600 font-medium">Département</label>
            <div className="relative">
              <Building className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 z-10" />
              <select
                id="edit-department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                className="w-full pl-7 h-7 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                disabled={isLoading || departmentsLoading}
              >
                <option value="">
                  {departmentsLoading ? "Chargement..." : "Sélectionner un département"}
                </option>
                {Array.isArray(departments) && departments.length > 0
                  ? departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))
                  : !departmentsLoading && (
                      <option value="" disabled>
                        {departmentsError ? "Erreur" : "Aucun département"}
                      </option>
                    )}
              </select>
            </div>
          </div>

          {/* Matricule */}
          <div className="space-y-1">
            <label htmlFor="edit-matricule" className="text-[10px] text-red-600 font-medium">Matricule</label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                id="edit-matricule"
                type="text"
                value={formData.matricule}
                onChange={(e) => handleInputChange("matricule", e.target.value.toUpperCase())}
                className="pl-7 h-7 text-xs border-gray-300"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Manager */}
          <div className="space-y-1">
            <label htmlFor="edit-manager" className="text-[10px] text-red-600 font-medium">Manager</label>
            <div className="relative">
              <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 z-10" />
              <select
                id="edit-manager"
                value={formData.manager}
                onChange={(e) => handleInputChange("manager", e.target.value)}
                className="w-full pl-7 h-7 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                disabled={isLoading || usersLoading}
              >
                <option value="">
                  {usersLoading ? "Chargement..." : "Aucun (ex: Directeur Général)"}
                </option>
                {Array.isArray(users) && users.length > 0
                  ? users
                      .filter(u => u.id !== user?.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} - {u.position || 'Sans poste'}
                        </option>
                      ))
                  : !usersLoading && (
                      <option value="" disabled>
                        Aucun utilisateur disponible
                      </option>
                    )}
              </select>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-7 text-xs border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !formData.first_name || !formData.last_name || !formData.email}
            className="flex-1 h-7 text-xs bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mise à jour...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Save className="w-3 h-3" />
                <span>Sauvegarder</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}


