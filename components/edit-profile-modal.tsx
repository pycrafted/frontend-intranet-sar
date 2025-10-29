"use client"

import { useState, useEffect } from "react"
import { X, Save, Phone, Mail, User, Briefcase, Building, Users, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
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
    if (user && isOpen) {
      console.log('🔍 [EDIT_PROFILE] Initialisation du formulaire avec l\'utilisateur:', user)
      console.log('🔍 [EDIT_PROFILE] Manager actuel de l\'utilisateur:', user.manager)
      console.log('🔍 [EDIT_PROFILE] Type du manager:', typeof user.manager)
      console.log('🔍 [EDIT_PROFILE] Manager ID:', user.manager_id)
      console.log('🔍 [EDIT_PROFILE] Manager info:', user.manager_info)
      
      // Gérer le département qui peut être un objet {id, name} ou null
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
      
      // Gérer le manager qui peut être un objet {id, username, email, ...} ou un ID ou null
      let managerValue = ""
      if (user.manager) {
        if (typeof user.manager === 'object' && 'id' in user.manager) {
          managerValue = user.manager.id.toString()
          console.log('✅ [EDIT_PROFILE] Manager trouvé comme objet, ID:', managerValue)
        } else if (typeof user.manager === 'number') {
          managerValue = user.manager.toString()
          console.log('✅ [EDIT_PROFILE] Manager trouvé comme nombre, ID:', managerValue)
        } else if (typeof user.manager === 'string') {
          managerValue = user.manager
          console.log('✅ [EDIT_PROFILE] Manager trouvé comme string, ID:', managerValue)
        }
      } else if (user.manager_id) {
        managerValue = user.manager_id.toString()
        console.log('✅ [EDIT_PROFILE] Manager trouvé via manager_id:', managerValue)
      } else {
        console.log('⚠️ [EDIT_PROFILE] Aucun manager trouvé pour l\'utilisateur')
      }
      
      console.log('🔍 [EDIT_PROFILE] Valeur finale du manager pour le formulaire:', managerValue)
      
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
      
      console.log('✅ [EDIT_PROFILE] FormData initialisé:', {
        department: departmentValue,
        manager: managerValue
      })
    }
  }, [user, isOpen])

  // Récupérer les départements depuis le backend
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!isOpen) return
      
      setDepartmentsLoading(true)
      setDepartmentsError(null)
      
      try {
        console.log('🏢 [EDIT_PROFILE] Récupération des départements depuis le backend...')
        const response = await api.get('/annuaire/departments/', { requireAuth: false })
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('🏢 [EDIT_PROFILE] Données départements reçues:', data)
        
        // Gérer les différents formats de réponse (paginé ou non)
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
          } else {
            console.warn('⚠️ [EDIT_PROFILE] Format de réponse inattendu pour départements:', data)
            departmentsArray = []
          }
        }
        
        setDepartments(departmentsArray)
        console.log('✅ [EDIT_PROFILE] Départements récupérés:', departmentsArray.length)
      } catch (err: any) {
        console.error('❌ [EDIT_PROFILE] Erreur lors de la récupération des départements:', err)
        setDepartmentsError(`Erreur lors de la récupération des départements: ${err.message || 'Erreur inconnue'}`)
        setDepartments([])
      } finally {
        setDepartmentsLoading(false)
      }
    }
    
    fetchDepartments()
  }, [isOpen])

  // Réinitialiser le manager dans formData quand les utilisateurs sont chargés et que le manager existe dans user
  useEffect(() => {
    if (isOpen && user && Array.isArray(users) && users.length > 0) {
      // Re-vérifier si le manager de l'utilisateur doit être mis à jour dans formData
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
      
      // Vérifier que le manager existe dans la liste des utilisateurs
      if (managerValue) {
        const managerId = parseInt(managerValue, 10)
        const managerExists = users.some(u => u.id === managerId && u.id !== user.id)
        
        if (managerExists && formData.manager !== managerValue) {
          console.log('🔄 [EDIT_PROFILE] Mise à jour du manager dans formData après chargement des utilisateurs:', managerValue)
          setFormData(prev => ({ ...prev, manager: managerValue }))
        }
      }
    }
  }, [users, user, isOpen, formData.manager])

  // Log des utilisateurs disponibles
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - Utilisateurs disponibles pour la sélection:', users)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - Erreur utilisateurs:', usersError)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - Chargement utilisateurs:', usersLoading)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - Nombre d\'utilisateurs:', users?.length || 0)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - Départements disponibles:', departments)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - Chargement départements:', departmentsLoading)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - FormData manager actuel:', formData.manager)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - User manager:', user?.manager)
      console.log('🔍 [EDIT_PROFILE] Modal ouvert - User manager_id:', user?.manager_id)
    }
  }, [users, usersError, usersLoading, isOpen, departments, departmentsLoading, formData.manager, user])

  // Log quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal EditProfile ouvert')
      console.log('🔍 Hook useUsers appelé')
    }
  }, [isOpen])

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

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide')
      return false
    }

    // Validation du matricule
    if (formData.matricule) {
      const matriculeRegex = /^[A-Z0-9]{3,20}$/
      if (!matriculeRegex.test(formData.matricule)) {
        setError('Le matricule doit contenir entre 3 et 20 caractères alphanumériques (lettres majuscules et chiffres uniquement)')
        return false
      }
    }

    // Aucune validation de format pour les numéros de téléphone - ils sont acceptés tels quels

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
      console.log('Tentative de mise à jour du profil avec les données:', formData)
      console.log('Utilisateur actuel:', user)
      
      // Préparer les données pour l'API : transformer department en department_id et manager en manager_id
      const dataToSend: any = { ...formData }
      
      // Gérer le département
      if (dataToSend.department) {
        dataToSend.department_id = parseInt(dataToSend.department) || null
        delete dataToSend.department
      } else {
        dataToSend.department_id = null
      }
      
      // Gérer le manager
      if (dataToSend.manager) {
        dataToSend.manager_id = parseInt(dataToSend.manager) || null
        delete dataToSend.manager
      } else {
        dataToSend.manager_id = null
      }
      
      console.log('🔍 [EDIT_PROFILE] Données à envoyer au backend:', dataToSend)
      
      const result = await updateProfile(dataToSend)
      
      console.log('Résultat de la mise à jour:', result)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          onClose()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Modifier le profil</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profil mis à jour !
              </h3>
              <p className="text-gray-600">
                Vos informations ont été mises à jour avec succès.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Message d'erreur */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Champ prénom */}
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium text-gray-900">
                  Prénom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Votre prénom"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="pl-10 h-11 text-gray-900 placeholder-gray-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Champ nom */}
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium text-gray-900">
                  Nom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Votre nom"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="pl-10 h-11 text-gray-900 placeholder-gray-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Champ email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@sar.sn"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-11 text-gray-900 placeholder-gray-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Champ téléphone personnel */}
              <div className="space-y-2">
                <label htmlFor="phone_number" className="text-sm font-medium text-gray-900">
                  Téléphone personnel
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="+221 33 123 45 67"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange("phone_number", e.target.value)}
                    className="pl-10 h-11 text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Champ téléphone fixe */}
              <div className="space-y-2">
                <label htmlFor="office_phone" className="text-sm font-medium text-gray-900">
                  Téléphone fixe (bureau)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="office_phone"
                    type="tel"
                    placeholder="+221 33 123 45 68"
                    value={formData.office_phone}
                    onChange={(e) => handleInputChange("office_phone", e.target.value)}
                    className="pl-10 h-11 text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Numéro de téléphone fixe de votre bureau
                </p>
              </div>

              {/* Champ poste */}
              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium text-gray-900">
                  Poste occupé
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="position"
                    type="text"
                    placeholder="Ex: Directeur Général, Chef de Projet..."
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className="pl-10 h-11 text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Champ département */}
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium text-gray-900">
                  Département
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="w-full pl-10 h-11 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                    disabled={isLoading || departmentsLoading}
                  >
                    <option value="">
                      {departmentsLoading ? "Chargement des départements..." : "Sélectionner un département"}
                    </option>
                    {Array.isArray(departments) && departments.length > 0
                      ? departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))
                      : !departmentsLoading && (
                          <option value="" disabled>
                            {departmentsError ? "Erreur de chargement" : "Aucun département disponible"}
                          </option>
                        )}
                  </select>
                </div>
                {departmentsError && (
                  <p className="text-sm text-red-600">{departmentsError}</p>
                )}
                {departmentsLoading && (
                  <p className="text-sm text-gray-500">Chargement de la liste des départements...</p>
                )}
              </div>

              {/* Champ matricule */}
              <div className="space-y-2">
                <label htmlFor="matricule" className="text-sm font-medium text-gray-900">
                  Matricule
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="matricule"
                    type="text"
                    placeholder="Ex: SAR001, EMP123..."
                    value={formData.matricule}
                    onChange={(e) => handleInputChange("matricule", e.target.value.toUpperCase())}
                    className="pl-10 h-11 text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Code unique d'identification dans l'entreprise
                </p>
              </div>

              {/* Champ chef direct (N+1) */}
              <div className="space-y-2">
                <label htmlFor="manager" className="text-sm font-medium text-gray-900">
                  Manager
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <select
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => handleInputChange("manager", e.target.value)}
                    className="w-full pl-10 h-11 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                    disabled={isLoading || usersLoading}
                  >
                    <option value="">
                      {usersLoading ? "Chargement des utilisateurs..." : "Aucun (ex: Directeur Général)"}
                    </option>
                    {Array.isArray(users) && users.length > 0
                      ? users
                          .filter(u => u.id !== user?.id) // Exclure l'utilisateur actuel
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
                {usersError && (
                  <p className="text-sm text-red-600">{usersError}</p>
                )}
                {usersLoading && (
                  <p className="text-sm text-gray-500">Chargement de la liste des utilisateurs...</p>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.first_name || !formData.last_name || !formData.email}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mise à jour...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
