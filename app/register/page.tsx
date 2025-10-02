"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Mail, User, Phone, Briefcase, Building, Users, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRegister, useAuth } from "@/hooks/useAuth"
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

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    position: "",
    department: "",
    matricule: "",
    manager: "",
    password: "",
    password_confirm: ""
  })

  const { register, isLoading } = useRegister()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { users } = useUsers()
  const router = useRouter()

  // Redirection si déjà connecté (seulement après vérification serveur)
  useEffect(() => {
    // Ne rediriger que si on n'est pas en train de charger ET qu'on est authentifié
    if (!authLoading && isAuthenticated) {
      router.push('/accueil')
    }
  }, [isAuthenticated, router, authLoading])

  // Afficher un loader pendant la vérification de l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur tape
    if (error) {
      setError(null)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.password) {
      setError('Tous les champs marqués d\'un * sont obligatoires')
      return false
    }
    
    if (formData.password !== formData.password_confirm) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
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
    
    // Validation optionnelle du téléphone
    if (formData.phone_number) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/
      if (!phoneRegex.test(formData.phone_number)) {
        setError('Le numéro de téléphone doit contenir au moins 8 chiffres')
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }
    
    try {
      const result = await register(formData)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/accueil')
        }, 2000)
      } else {
        setError(result.error || 'Erreur lors de la création du compte')
      }
    } catch (error) {
      setError('Erreur inattendue lors de la création du compte')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-enterprise-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Compte créé avec succès !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre compte a été créé. Vous allez être redirigé vers l'accueil...
            </p>
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Section gauche - Image de fond SAR */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/photo_profil.png"
            alt="Installations SAR - Raffinerie moderne"
            fill
            className="object-cover object-center"
            priority
            quality={90}
            sizes="(max-width: 1024px) 0vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-red-800/70 to-red-700/80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <Image
              src="/sarlogo.png"
              alt="SAR Logo"
              width={120}
              height={72}
              className="mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4">Rejoignez la SAR</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Créez votre compte pour accéder à l'intranet
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mt-8 max-w-md">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Inscription simple</h3>
                <p className="text-sm text-white/80">Seulement 4 champs requis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Validation automatique</h3>
                <p className="text-sm text-white/80">Matricule et rôle générés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire d'inscription */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/sarlogo.png"
              alt="SAR Logo"
              width={80}
              height={48}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-600">Rejoignez l'intranet SAR</p>
          </div>

          {/* Carte d'inscription */}
          <Card className="shadow-enterprise-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Créer un compte
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Remplissez les informations ci-dessous
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Message d'erreur */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Champ prénom */}
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      className="pl-10 h-11 text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Champ nom */}
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                    Nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      className="pl-10 h-11 text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Champ email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@sar.sn"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-11 text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Champ téléphone */}
                <div className="space-y-2">
                  <label htmlFor="phone_number" className="text-sm font-medium text-gray-700">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="+221 33 123 45 67"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      className="pl-10 h-11 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Champ poste */}
                <div className="space-y-2">
                  <label htmlFor="position" className="text-sm font-medium text-gray-700">
                    Poste occupé
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="position"
                      type="text"
                      placeholder="Ex: Directeur Général, Chef de Projet..."
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className="pl-10 h-11 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Champ département */}
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Département
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <label htmlFor="matricule" className="text-sm font-medium text-gray-700">
                    Matricule
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="matricule"
                      type="text"
                      placeholder="Ex: SAR001, EMP123..."
                      value={formData.matricule}
                      onChange={(e) => handleInputChange("matricule", e.target.value.toUpperCase())}
                      className="pl-10 h-11 text-base"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Code unique d'identification dans l'entreprise (optionnel)
                  </p>
                </div>

                {/* Champ chef direct (N+1) */}
                <div className="space-y-2">
                  <label htmlFor="manager" className="text-sm font-medium text-gray-700">
                    Chef direct (N+1)
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => handleInputChange("manager", e.target.value)}
                      className="w-full pl-10 h-11 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                      disabled={isLoading}
                    >
                      <option value="">Aucun (ex: Directeur Général)</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} - {user.position || 'Sans poste'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Champ mot de passe */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 h-11 text-base"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Champ confirmation mot de passe */}
                <div className="space-y-2">
                  <label htmlFor="password_confirm" className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password_confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Répétez votre mot de passe"
                      value={formData.password_confirm}
                      onChange={(e) => handleInputChange("password_confirm", e.target.value)}
                      className="pl-10 pr-10 h-11 text-base"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Bouton d'inscription */}
                <Button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.first_name || !formData.last_name || !formData.password || !formData.password_confirm}
                  className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Création en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Créer mon compte
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Lien vers la connexion */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Vous avez déjà un compte ?{" "}
                  <Link 
                    href="/login" 
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Société Africaine de Raffinage. Tous droits réservés.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Accès autorisé uniquement aux employés SAR
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
