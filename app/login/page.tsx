"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Mail, Building2, Shield, ArrowRight, AlertCircle, Globe } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLogin, useLogout } from "@/hooks/useAuth"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const { login, isLoading } = useLogin()
  const { logout } = useLogout()
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirection automatique si déjà connecté (seulement après vérification serveur)
  useEffect(() => {
    // Ne rediriger que si on n'est pas en train de charger ET qu'on est authentifié
    if (!authLoading && isAuthenticated && user) {
      // Récupérer l'URL de redirection depuis les paramètres
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/accueil'
      router.push(redirectUrl)
    }
  }, [isAuthenticated, user, router, authLoading])

  // Gérer le paramètre logout pour forcer la reconnexion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('logout') === 'true') {
      // Afficher un message de déconnexion
      setError('Vous avez été déconnecté. Veuillez vous reconnecter.')
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/login')
    }
  }, [])

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur tape
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      const result = await login(formData)
      
      if (result.success) {
        router.push('/accueil')
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch (error) {
      setError('Erreur inattendue lors de la connexion')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Section gauche - Image de fond SAR */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Image de fond avec overlay */}
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
        
        {/* Contenu overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <Image
              src="/sarlogo.png"
              alt="SAR Logo"
              width={120}
              height={72}
              className="mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4">Société Africaine de Raffinage</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Votre portail d'accès à l'intranet SAR
            </p>
          </div>
          
          {/* Caractéristiques */}
          <div className="grid grid-cols-1 gap-6 mt-8 max-w-md">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Sécurité renforcée</h3>
                <p className="text-sm text-white/80">Accès sécurisé et authentifié</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Ressources internes</h3>
                <p className="text-sm text-white/80">Actualités, documents et outils</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire de connexion */}
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
            <h1 className="text-2xl font-bold text-gray-900">Intranet SAR</h1>
            <p className="text-gray-600">Espace personnel des employés</p>
          </div>

          {/* Carte de connexion */}
          <Card className="shadow-enterprise-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Connexion
              </CardTitle>
               <p className="text-gray-600 mt-2">
                 Accédez à l'intranet SAR et à tous vos outils Google
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

                {/* Champ email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Adresse email
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

                {/* Champ mot de passe */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
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

                {/* Options */}
                <div className="flex items-center justify-between">
                  <Link 
                    href="/register" 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Créer un compte
                  </Link>
                  
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Bouton de connexion */}
                <Button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.password}
                  className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connexion en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Se connecter à tous mes outils
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

              </form>

              {/* Informations supplémentaires */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Problème de connexion ?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link 
                      href="/support" 
                      className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      Contacter le support IT
                    </Link>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <Link 
                      href="/help" 
                      className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      Guide d'aide
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lien vers la page d'accueil */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg hover:from-red-100 hover:to-orange-100 transition-all duration-300 group">
              <Globe className="w-4 h-4 text-red-600 group-hover:text-red-700 transition-colors" />
              <Link 
                href="/" 
                className="text-sm font-medium text-red-700 group-hover:text-red-800 transition-colors"
              >
                Découvrir l'intranet SAR
              </Link>
              <ArrowRight className="w-4 h-4 text-red-600 group-hover:text-red-700 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Explorez les fonctionnalités de l'intranet sans vous connecter
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
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
