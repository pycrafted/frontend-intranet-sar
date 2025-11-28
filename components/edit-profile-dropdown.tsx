"use client"

import { useState, useEffect } from "react"
import { Save, Phone, Mail, User, Briefcase, Building, Users, AlertCircle, CheckCircle, X, Upload, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useUsers } from "@/hooks/useUsers"
import { api } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  console.log('🎬 [EDIT_PROFILE_DROPDOWN] === COMPOSANT MONTÉ ===')
  
  const { user, updateProfile } = useAuth()
  
  console.log('🔍 [EDIT_PROFILE_DROPDOWN] Hook useAuth:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    hasUpdateProfile: typeof updateProfile === 'function',
    updateProfileType: typeof updateProfile
  })
  
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  console.log('📊 [EDIT_PROFILE_DROPDOWN] État initial:', {
    formData,
    isLoading,
    error,
    success,
    departmentsCount: departments.length,
    usersCount: users?.length || 0
  })

  // Initialiser les données du formulaire avec les données utilisateur
  useEffect(() => {
    console.log('🔄 [EDIT_PROFILE_DROPDOWN] useEffect - Initialisation du formulaire')
    console.log('👤 [EDIT_PROFILE_DROPDOWN] Utilisateur reçu:', {
      user,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userDepartment: user?.department,
      userManager: user?.manager
    })
    
    if (user) {
      let departmentValue = ""
      if (user.department) {
        if (typeof user.department === 'object' && 'id' in user.department) {
          departmentValue = user.department.id.toString()
          console.log('📁 [EDIT_PROFILE_DROPDOWN] Département (objet):', { id: user.department.id, name: (user.department as any).name })
        } else if (typeof user.department === 'string') {
          departmentValue = user.department
          console.log('📁 [EDIT_PROFILE_DROPDOWN] Département (string):', user.department)
        }
      } else if (user.department_id) {
        departmentValue = user.department_id.toString()
        console.log('📁 [EDIT_PROFILE_DROPDOWN] Département (department_id):', user.department_id)
      }
      
      let managerValue = ""
      if (user.manager) {
        if (typeof user.manager === 'object' && 'id' in user.manager) {
          managerValue = user.manager.id.toString()
          console.log('👔 [EDIT_PROFILE_DROPDOWN] Manager (objet):', { id: user.manager.id, name: (user.manager as any).first_name })
        } else if (typeof user.manager === 'number') {
          managerValue = user.manager.toString()
          console.log('👔 [EDIT_PROFILE_DROPDOWN] Manager (number):', user.manager)
        } else if (typeof user.manager === 'string') {
          managerValue = user.manager
          console.log('👔 [EDIT_PROFILE_DROPDOWN] Manager (string):', user.manager)
        }
      } else if (user.manager_id) {
        managerValue = user.manager_id.toString()
        console.log('👔 [EDIT_PROFILE_DROPDOWN] Manager (manager_id):', user.manager_id)
      }
      
      const initialFormData = {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        office_phone: user.office_phone || "",
        position: user.position || "",
        department: departmentValue,
        matricule: user.matricule || "",
        manager: managerValue
      }
      
      console.log('📝 [EDIT_PROFILE_DROPDOWN] Données du formulaire initialisées:', initialFormData)
      setFormData(initialFormData)
      
      // Initialiser l'aperçu de l'avatar
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url)
      }
    } else {
      console.warn('⚠️ [EDIT_PROFILE_DROPDOWN] Aucun utilisateur disponible pour initialiser le formulaire')
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
    console.log('✏️ [EDIT_PROFILE_DROPDOWN] Changement de champ:', { field, value, previousValue: formData[field as keyof typeof formData] })
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log('📋 [EDIT_PROFILE_DROPDOWN] Nouveau formData:', newData)
      return newData
    })
    if (error) {
      console.log('🧹 [EDIT_PROFILE_DROPDOWN] Effacement de l\'erreur précédente')
      setError(null)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ [EDIT_PROFILE_DROPDOWN] === DÉBUT UPLOAD AVATAR ===')
    const file = e.target.files?.[0]
    
    if (!file) {
      console.log('⚠️ [EDIT_PROFILE_DROPDOWN] Aucun fichier sélectionné')
      return
    }

    console.log('🖼️ [EDIT_PROFILE_DROPDOWN] Fichier sélectionné:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      console.error('❌ [EDIT_PROFILE_DROPDOWN] Type de fichier invalide:', file.type)
      setError('Veuillez sélectionner un fichier image valide')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ [EDIT_PROFILE_DROPDOWN] Fichier trop volumineux:', file.size, 'bytes')
      setError('La taille du fichier ne doit pas dépasser 5MB')
      return
    }

    // Enregistrer le fichier
    setAvatarFile(file)
    setError(null)

    // Créer un aperçu
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setAvatarPreview(result)
      console.log('✅ [EDIT_PROFILE_DROPDOWN] Aperçu de l\'avatar créé')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    console.log('🗑️ [EDIT_PROFILE_DROPDOWN] Suppression de l\'avatar')
    setAvatarFile(null)
    setAvatarPreview(user?.avatar_url || null)
    // Réinitialiser l'input file
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const validateForm = () => {
    console.log('✅ [EDIT_PROFILE_DROPDOWN] === DÉBUT VALIDATION ===')
    console.log('📋 [EDIT_PROFILE_DROPDOWN] Données à valider:', formData)
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      const missingFields = []
      if (!formData.first_name) missingFields.push('first_name')
      if (!formData.last_name) missingFields.push('last_name')
      if (!formData.email) missingFields.push('email')
      console.error('❌ [EDIT_PROFILE_DROPDOWN] Validation échouée - Champs manquants:', missingFields)
      setError('Les champs prénom, nom et email sont obligatoires')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      console.error('❌ [EDIT_PROFILE_DROPDOWN] Validation échouée - Email invalide:', formData.email)
      setError('Format d\'email invalide')
      return false
    }

    if (formData.matricule) {
      const matriculeRegex = /^[A-Z0-9]{3,20}$/
      if (!matriculeRegex.test(formData.matricule)) {
        console.error('❌ [EDIT_PROFILE_DROPDOWN] Validation échouée - Matricule invalide:', formData.matricule)
        setError('Le matricule doit contenir entre 3 et 20 caractères alphanumériques (lettres majuscules et chiffres uniquement)')
        return false
      }
    }

    console.log('✅ [EDIT_PROFILE_DROPDOWN] Validation réussie')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 [EDIT_PROFILE_DROPDOWN] === DÉBUT SOUMISSION ===')
    console.log('📋 [EDIT_PROFILE_DROPDOWN] FormData actuel:', formData)
    console.log('👤 [EDIT_PROFILE_DROPDOWN] Utilisateur actuel:', { id: user?.id, email: user?.email })
    
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      console.log('⏹️ [EDIT_PROFILE_DROPDOWN] Soumission annulée - Validation échouée')
      return
    }

    setIsLoading(true)
    console.log('⏳ [EDIT_PROFILE_DROPDOWN] Chargement activé')

    try {
      const dataToSend: any = { ...formData }
      console.log('📦 [EDIT_PROFILE_DROPDOWN] Données avant transformation:', dataToSend)
      
      // Transformation du département
      if (dataToSend.department) {
        const departmentId = parseInt(dataToSend.department)
        console.log('📁 [EDIT_PROFILE_DROPDOWN] Transformation département:', { 
          original: dataToSend.department, 
          parsed: departmentId,
          isValid: !isNaN(departmentId)
        })
        dataToSend.department_id = !isNaN(departmentId) ? departmentId : null
        delete dataToSend.department
      } else {
        console.log('📁 [EDIT_PROFILE_DROPDOWN] Pas de département - department_id = null')
        dataToSend.department_id = null
      }
      
      // Transformation du manager
      if (dataToSend.manager) {
        const managerId = parseInt(dataToSend.manager)
        console.log('👔 [EDIT_PROFILE_DROPDOWN] Transformation manager:', { 
          original: dataToSend.manager, 
          parsed: managerId,
          isValid: !isNaN(managerId)
        })
        dataToSend.manager_id = !isNaN(managerId) ? managerId : null
        delete dataToSend.manager
      } else {
        console.log('👔 [EDIT_PROFILE_DROPDOWN] Pas de manager - manager_id = null')
        dataToSend.manager_id = null
      }
      
      // Ajouter le username (requis par le backend)
      if (user?.username) {
        dataToSend.username = user.username
        console.log('👤 [EDIT_PROFILE_DROPDOWN] Username ajouté:', user.username)
      } else {
        console.warn('⚠️ [EDIT_PROFILE_DROPDOWN] Aucun username disponible pour l\'utilisateur actuel')
      }

      // Si un fichier avatar est sélectionné, utiliser FormData
      if (avatarFile) {
        console.log('🖼️ [EDIT_PROFILE_DROPDOWN] Avatar sélectionné, utilisation de FormData')
        const formDataToSend = new FormData()
        
        // Ajouter tous les champs texte
        Object.keys(dataToSend).forEach(key => {
          const value = dataToSend[key]
          if (value !== null && value !== undefined && value !== '') {
            formDataToSend.append(key, value.toString())
          }
        })
        
        // Ajouter le fichier avatar
        formDataToSend.append('avatar', avatarFile)
        
        console.log('📤 [EDIT_PROFILE_DROPDOWN] FormData créé avec avatar')
        console.log('📤 [EDIT_PROFILE_DROPDOWN] Contenu FormData:')
        for (let [key, value] of formDataToSend.entries()) {
          if (key === 'avatar') {
            console.log(`  🖼️ ${key}: [File] ${(value as File).name} (${(value as File).size} bytes)`)
          } else {
            console.log(`  📋 ${key}: "${value}"`)
          }
        }
        
        const result = await updateProfile(formDataToSend)
        console.log('📥 [EDIT_PROFILE_DROPDOWN] Résultat de updateProfile:', result)
        
        if (result.success) {
          console.log('✅ [EDIT_PROFILE_DROPDOWN] Mise à jour réussie!')
          setSuccess(true)
          setAvatarFile(null) // Réinitialiser le fichier après succès
          setTimeout(() => {
            console.log('🔄 [EDIT_PROFILE_DROPDOWN] Appel de onSuccess callback')
            onSuccess?.()
          }, 1500)
        } else {
          console.error('❌ [EDIT_PROFILE_DROPDOWN] Mise à jour échouée:', result.error)
          setError(result.error || 'Erreur lors de la mise à jour du profil')
        }
        return
      }
      
      console.log('📤 [EDIT_PROFILE_DROPDOWN] Données finales à envoyer (sans avatar):', dataToSend)
      console.log('🔧 [EDIT_PROFILE_DROPDOWN] Fonction updateProfile disponible:', typeof updateProfile)
      
      const result = await updateProfile(dataToSend)
      
      console.log('📥 [EDIT_PROFILE_DROPDOWN] Résultat de updateProfile:', result)
      
      if (result.success) {
        console.log('✅ [EDIT_PROFILE_DROPDOWN] Mise à jour réussie!')
        setSuccess(true)
        setTimeout(() => {
          console.log('🔄 [EDIT_PROFILE_DROPDOWN] Appel de onSuccess callback')
          onSuccess?.()
        }, 1500)
      } else {
        console.error('❌ [EDIT_PROFILE_DROPDOWN] Mise à jour échouée:', result.error)
        setError(result.error || 'Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('💥 [EDIT_PROFILE_DROPDOWN] Exception lors de la mise à jour:', error)
      console.error('💥 [EDIT_PROFILE_DROPDOWN] Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('💥 [EDIT_PROFILE_DROPDOWN] Message d\'erreur:', error instanceof Error ? error.message : String(error))
      console.error('💥 [EDIT_PROFILE_DROPDOWN] Stack trace:', error instanceof Error ? error.stack : 'N/A')
      setError('Erreur inattendue lors de la mise à jour du profil')
    } finally {
      console.log('🏁 [EDIT_PROFILE_DROPDOWN] Fin de la soumission - Chargement désactivé')
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
    <div className="flex flex-col max-h-[500px]">
      {/* Zone scrollable pour le contenu */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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

        <form onSubmit={handleSubmit} id="edit-profile-form" className="space-y-3">
        {/* Informations personnelles */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Informations personnelles</h4>
          
          {/* Avatar / Photo de profil */}
          <div className="space-y-1">
            <label className="text-[10px] text-red-600 font-medium">Photo de profil</label>
            <div className="flex items-center gap-3">
              {/* Aperçu de l'avatar */}
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-gray-300">
                  <AvatarImage src={avatarPreview || user?.avatar_url || "/placeholder.svg?height=64&width=64"} />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Supprimer l'image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              {/* Bouton d'upload */}
              <div className="flex-1">
                <label
                  htmlFor="avatar-upload"
                  className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">
                    {avatarFile ? 'Changer la photo' : 'Choisir une photo'}
                  </span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  JPG, PNG ou GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>
          
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
                      .sort((a, b) => {
                        // Trier par nom complet (prénom + nom) de A à Z
                        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase()
                        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase()
                        return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
                      })
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
        </form>
      </div>

      {/* Boutons toujours visibles en bas */}
      <div className="flex gap-2 pt-2 pb-1 border-t border-gray-200 bg-white sticky bottom-0">
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
          form="edit-profile-form"
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
    </div>
  )
}



