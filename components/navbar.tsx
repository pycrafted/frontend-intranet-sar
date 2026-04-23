"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, ChevronDown, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EditProfileDropdown } from "@/components/edit-profile-dropdown"
import { useAuth, useLogin, useLogout } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-api"
import { useToast } from "@/components/ui/toast"

export function Navbar({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { login, isLoading: isLoggingIn } = useLogin()
  const { logout } = useLogout()
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [rememberMe, setRememberMe] = useState(false)
  const [mounted, setMounted] = useState(false)

  // S'assurer que le rendu conditionnel ne s'applique qu'après l'hydratation
  useEffect(() => {
    setMounted(true)
    // Charger l'email sauvegardé si "Se souvenir de moi" était coché
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('remembered_email')
      if (savedEmail) {
        setLoginEmail(savedEmail)
        setRememberMe(true)
      }
    }
  }, [])


const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      return
    }

    try {
      const result = await login({ email: loginEmail, password: loginPassword })
      
      if (result.success) {
        // Afficher l'alerte de succès
        success("Connexion réussie", "Vous êtes maintenant connecté")
        
        // Sauvegarder l'email si "Se souvenir de moi" est coché
        if (rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('remembered_email', loginEmail)
        } else if (typeof window !== 'undefined') {
          localStorage.removeItem('remembered_email')
        }
        
        // Réinitialiser le formulaire (garder l'email si "Se souvenir de moi" est coché)
        if (!rememberMe) {
          setLoginEmail("")
        }
        setLoginPassword("")
        // Fermer le menu après connexion
        setIsMenuOpen(false)
      } else {
        const message = result.error || "Identifiants invalides. Vérifiez votre email et votre mot de passe."
        toastError("Échec de connexion", message)
      }
    } catch (error) {
      const message = "Une erreur inattendue est survenue. Merci de réessayer."
      toastError("Échec de connexion", message)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navbar-border bg-navbar text-navbar-foreground shadow-enterprise">
      <div className="flex h-16 sm:h-16 items-center justify-between px-4 sm:px-4 md:px-5 lg:px-6 navbar-mobile-optimized">
        {/* Left section - Responsive */}
        <div className="flex items-center gap-3 sm:gap-2 md:gap-3 lg:gap-4 min-w-0 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 sm:gap-2 md:gap-2.5 lg:gap-3 min-w-0 hover:opacity-80 transition-opacity duration-200">
            <div className="flex h-10 w-14 sm:h-8 sm:w-12 lg:h-10 lg:w-16 items-center justify-center flex-shrink-0 navbar-logo">
              <img
                src="/sarlogo.png"
                alt="SAR Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-sm font-bold text-white truncate navbar-text">
                Société Africaine de Raffinage
              </h1>
            </div>
          </Link>
        </div>

        {/* Right section - Responsive */}
        <div className="flex items-center gap-2 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Hamburger button - mobile only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuOpen}
            className="tablet:hidden h-10 w-10 p-0 text-white hover:bg-[#2a323d]"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* User menu - Responsive */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 sm:gap-2 text-white hover:bg-[#2a323d] flex-shrink-0 min-w-0 h-10 sm:h-10 px-2 sm:px-2"
                  style={{ backgroundColor: '#353E4B' }}
                >
                {/* Éviter les erreurs d'hydratation en rendant le même contenu initial côté serveur et client */}
                {!mounted ? (
                  <>
                    <div className="h-7 w-7 sm:h-6 sm:w-6 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                    <span className="hidden sm:block text-sm font-medium text-white/70" suppressHydrationWarning>
                      Chargement...
                    </span>
                  </>
                ) : isLoading ? (
                  user ? (
                    <>
                      <Avatar className="h-7 w-7 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0 navbar-avatar" suppressHydrationWarning>
                        <AvatarImage src={user.avatar_url || "/placeholder.svg?height=32&width=32"} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {authUtils.getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left min-w-0">
                        <p className="text-sm font-medium truncate text-white">
                          {authUtils.getFullName(user)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-7 w-7 sm:h-6 sm:w-6 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                      <span className="hidden sm:block text-sm font-medium text-white/70">
                        Chargement...
                      </span>
                    </>
                  )
                ) : isAuthenticated && user ? (
                  <>
                    <Avatar className="h-7 w-7 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0 navbar-avatar" suppressHydrationWarning>
                      <AvatarImage src={user.avatar_url || "/placeholder.svg?height=32&width=32"} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {authUtils.getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {authUtils.getFullName(user)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-sm font-medium text-white" suppressHydrationWarning>
                      Connexion
                    </span>
                  </>
                )}
                  <ChevronDown className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-1.5rem)] sm:w-80 max-h-[85vh] overflow-y-auto">
              {/* Pendant le chargement, ne pas afficher le formulaire de connexion */}
              {isLoading ? (
                // Afficher un loader ou l'état précédent
                user ? (
                  // Si on a un user en cache, afficher le formulaire
                  <div className="px-2 py-2">
                    <EditProfileDropdown />
                  </div>
                ) : (
                  // Sinon, afficher un loader
                  <div className="p-4 flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )
              ) : isAuthenticated && user ? (
                <div className="px-2 py-2">
                  <EditProfileDropdown />
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Se connecter</h3>
                    <form onSubmit={handleLoginSubmit} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-xs">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          disabled={isLoggingIn}
                          className="h-8 text-sm border-2" 
                          style={{ borderColor: '#344256' }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = '#344256' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = '#344256' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault()
                              const passwordInput = document.getElementById('login-password')
                              if (passwordInput) {
                                passwordInput.focus()
                              }
                            }
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-xs">Mot de passe</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="mot de passe"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          disabled={isLoggingIn}
                          className="h-8 text-sm border-2" 
                          style={{ borderColor: '#344256' }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = '#344256' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = '#344256' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const form = e.currentTarget.closest('form')
                              if (form) {
                                form.requestSubmit()
                              }
                            }
                          }}
                          required
                        />
                      </div>
                      {/* Case "Se souvenir de moi" */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          className="border-2"
                          style={{ borderColor: '#344256' }}
                        />
                        <Label
                          htmlFor="remember-me"
                          className="text-xs font-normal cursor-pointer"
                        >
                          Se souvenir de moi
                        </Label>
                      </div>
                      {/* Message d'erreur inline retiré: l'information d'erreur est gérée via toast */}
            <Button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full h-8 text-sm"
                      >
                        {isLoggingIn ? "Connexion..." : "Se connecter"}
            </Button>
                    </form>
                  </div>
                </div>
          )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton déconnexion — visible si connecté */}
          {mounted && isAuthenticated && user && (
            <Button
              variant="ghost"
              onClick={async () => { await logout(); router.push('/') }}
              className="h-10 w-10 p-0 text-white hover:bg-red-500/20 hover:text-red-300 transition-colors flex-shrink-0"
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
    </header>
  )
}
