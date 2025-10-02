"use client"

import { useState, useEffect } from "react"
import { X, Save, Phone, Mail, User, Briefcase, Building, Users, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useUsers } from "@/hooks/useUsers"

// Liste des départements disponibles
const DEPARTMENTS = [
  "Communication",
  "Finance", 
  "Informatique",
  "Logistique",
  "Marketing",
  "Production",
  "Qualité",
  "Recherche & Développement",
  "Ressources Humaines",
  "Ventes"
]

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth()
  const { users, isLoading: usersLoading, error: usersError } = useUsers()
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
      console.log('🔍 Initialisation du formulaire avec l\'utilisateur:', user)
      console.log('🔍 Manager actuel de l\'utilisateur:', user.manager)
      console.log('🔍 Manager info:', user.manager_info)
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        office_phone: user.office_phone || "",
        position: user.position || "",
        department: user.department || "",
        matricule: user.matricule || "",
        manager: user.manager?.toString() || ""
      })
    }
  }, [user, isOpen])

  // Log des utilisateurs disponibles
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal ouvert - Utilisateurs disponibles pour la sélection:', users)
      console.log('🔍 Modal ouvert - Erreur utilisateurs:', usersError)
      console.log('🔍 Modal ouvert - Chargement utilisateurs:', usersLoading)
      console.log('🔍 Modal ouvert - Nombre d\'utilisateurs:', users?.length || 0)
    }
  }, [users, usersError, usersLoading, isOpen])

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

    // Validation optionnelle du téléphone personnel
    if (formData.phone_number) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/
      if (!phoneRegex.test(formData.phone_number)) {
        setError('Le numéro de téléphone personnel doit contenir au moins 8 chiffres')
        return false
      }
    }

    // Validation optionnelle du téléphone fixe
    if (formData.office_phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/
      if (!phoneRegex.test(formData.office_phone)) {
        setError('Le numéro de téléphone fixe doit contenir au moins 8 chiffres')
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
      console.log('Tentative de mise à jour du profil avec les données:', formData)
      console.log('Utilisateur actuel:', user)
      
      const result = await updateProfile(formData)
      
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
                    disabled={isLoading}
                  >
                    <option value="">Sélectionner un département</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
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
                    {users
                      .filter(u => u.id !== user?.id) // Exclure l'utilisateur actuel
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} - {u.position || 'Sans poste'}
                        </option>
                      ))}
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
