"use client"

import { useState, useEffect, FormEvent, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, ChevronDown, Menu, LogOut, Settings, Edit, Bell, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EditProfileDropdown } from "@/components/edit-profile-dropdown"
import { useAuth, useLogout, useLogin } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-api"
import { useToast } from "@/components/ui/toast"
import { useSocialNetwork } from "@/hooks/useSocialNetwork"
import { Mail, Phone, Building, Shield, Users as UsersIcon, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { logout } = useLogout()
  const { login, isLoading: isLoggingIn } = useLogin()
  const { success, error: toastError } = useToast()
  const { conversations, fetchConversations } = useSocialNetwork()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const [isProfileSectionOpen, setIsProfileSectionOpen] = useState(false)
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
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

  // Récupérer les conversations si l'utilisateur est authentifié
  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchConversations().catch(err => {
        console.error('Erreur lors de la récupération des conversations:', err)
      })
    }
  }, [mounted, isAuthenticated, fetchConversations])

  // Rafraîchir les conversations quand le dropdown de notifications est ouvert
  useEffect(() => {
    if (isNotificationMenuOpen && isAuthenticated) {
      // Rafraîchir immédiatement
      fetchConversations().catch(err => {
        console.error('Erreur lors du rafraîchissement des conversations:', err)
      })
      
      // Puis rafraîchir toutes les 2 secondes tant que le dropdown est ouvert
      const interval = setInterval(() => {
        fetchConversations().catch(err => {
          console.error('Erreur lors du rafraîchissement des conversations:', err)
        })
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isNotificationMenuOpen, isAuthenticated, fetchConversations])

  // Filtrer les conversations avec des messages non lus
  const unreadConversations = useMemo(() => {
    return conversations
      .filter(conv => (conv.unread || 0) > 0)
      .sort((a, b) => {
        // Trier par date du dernier message (plus récent en premier)
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10) // Limiter à 10 conversations
  }, [conversations])

  // Calculer le nombre total de messages non lus
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => total + (conv.unread || 0), 0)
  }, [conversations])

  // Gérer le clic sur une notification
  const handleNotificationClick = (conversationId: string) => {
    setIsNotificationMenuOpen(false)
    // Rediriger vers la page réseau social avec la conversation sélectionnée
    router.push(`/reseau-social?conversation=${conversationId}`)
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Redirection immédiate après déconnexion
      window.location.href = '/'
    } catch (error) {
      // En cas d'erreur, rediriger quand même
      window.location.href = '/'
    }
  }

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError("")

    if (!loginEmail || !loginPassword) {
      setLoginError("Veuillez remplir tous les champs")
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
        setLoginError(message)
        toastError("Échec de connexion", message)
      }
    } catch (error) {
      const message = "Une erreur inattendue est survenue. Merci de réessayer."
      setLoginError(message)
      toastError("Échec de connexion", message)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navbar-border bg-navbar text-navbar-foreground shadow-enterprise">
      <div className="flex h-12 xs:h-14 sm:h-16 items-center justify-between px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 navbar-mobile-optimized">
        {/* Left section - Responsive */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 min-w-0 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="tablet:hidden text-navbar-foreground hover:bg-navbar-foreground/10 flex-shrink-0 h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 p-0"
            onClick={onMenuClick}
          >
            <Menu className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 min-w-0 hover:opacity-80 transition-opacity duration-200">
            <div className="flex h-5 w-6 xs:h-6 xs:w-8 sm:h-8 sm:w-12 lg:h-10 lg:w-16 items-center justify-center flex-shrink-0 navbar-logo">
              <img 
                src="/sarlogo.png" 
                alt="SAR Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden xs:block min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold text-white truncate navbar-text">
                Société Africaine de Raffinage
              </h1>
            </div>
          </Link>
        </div>


        {/* Right section - Responsive */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Notification button - Only show when authenticated */}
          {mounted && isAuthenticated && user && (
            <DropdownMenu open={isNotificationMenuOpen} onOpenChange={setIsNotificationMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-white hover:bg-[#2a323d] flex-shrink-0 h-7 xs:h-8 sm:h-10 w-7 xs:w-8 sm:w-10 p-0"
                  style={{ backgroundColor: '#353E4B' }}
                  title="Notifications"
                >
                  <Bell className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 xs:w-96 sm:w-[420px] max-h-[500px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {totalUnreadCount}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadConversations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>Aucun message non lu</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {unreadConversations.map((conv) => (
                      <DropdownMenuItem
                        key={conv.id}
                        onClick={() => handleNotificationClick(conv.id)}
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={conv.avatar || "/placeholder-user.jpg"}
                            alt={conv.name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              if (target.src !== "/placeholder-user.jpg") {
                                target.src = "/placeholder-user.jpg"
                              }
                            }}
                          />
                          {conv.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm truncate">{conv.name}</p>
                            {conv.unread && conv.unread > 0 && (
                              <Badge variant="destructive" className="text-xs h-5 min-w-[20px] flex items-center justify-center">
                                {conv.unread > 99 ? '99+' : conv.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {conv.lastMessage || 'Aucun message'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {conv.time || ''}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                {unreadConversations.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setIsNotificationMenuOpen(false)
                        router.push('/reseau-social')
                      }}
                      className="text-center justify-center cursor-pointer"
                    >
                      Voir toutes les conversations
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User menu - Responsive */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-white hover:bg-[#2a323d] flex-shrink-0 min-w-0 h-7 xs:h-8 sm:h-10 px-1 xs:px-1.5 sm:px-2"
                  style={{ backgroundColor: '#353E4B' }}
                >
                {/* Éviter les erreurs d'hydratation en rendant le même contenu initial côté serveur et client */}
                {!mounted ? (
                  // Rendu initial identique pour serveur et client (avant hydratation)
                  <>
                    <div className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                    <span className="hidden sm:block text-xs sm:text-sm font-medium text-white/70" suppressHydrationWarning>
                      Chargement...
                    </span>
                  </>
                ) : isLoading ? (
                  // État de chargement : afficher un loader ou l'état précédent
                  user ? (
                    // Si on a un user en cache, l'afficher pendant le chargement
                    <>
                      <Avatar className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0 navbar-avatar" suppressHydrationWarning>
                        <AvatarImage src={user.avatar_url || "/placeholder.svg?height=32&width=32"} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {authUtils.getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate text-white">
                          {authUtils.getFullName(user)}
                        </p>
                      </div>
                    </>
                  ) : (
                    // Sinon, afficher un loader discret
                    <>
                      <div className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                      <span className="hidden sm:block text-xs sm:text-sm font-medium text-white/70">
                        Chargement...
                      </span>
                    </>
                  )
                ) : isAuthenticated && user ? (
                  // Utilisateur authentifié
                  <>
                  <Avatar className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0 navbar-avatar" suppressHydrationWarning>
                    <AvatarImage src={user.avatar_url || "/placeholder.svg?height=32&width=32"} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                      {authUtils.getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate text-white">
                      {authUtils.getFullName(user)}
                    </p>
                  </div>
                  </>
                ) : (
                  // Non authentifié (seulement après le chargement)
                  <>
                    <User className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:block text-xs sm:text-sm font-medium text-white" suppressHydrationWarning>
                      Connexion
                    </span>
                  </>
                )}
                  <ChevronDown className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 flex-shrink-0 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 xs:w-64 sm:w-72">
              {/* Pendant le chargement, ne pas afficher le formulaire de connexion */}
              {isLoading ? (
                // Afficher un loader ou l'état précédent
                user ? (
                  // Si on a un user en cache, afficher le menu utilisateur
                  <>
                    
                    <DropdownMenuItem 
                      onClick={() => setIsProfileSectionOpen(!isProfileSectionOpen)} 
                      onSelect={(e) => e.preventDefault()}
                      className="text-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profil
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isProfileSectionOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </DropdownMenuItem>
                    {isProfileSectionOpen && (
                      <div className="px-2 py-2 space-y-3 max-h-[520px] overflow-y-auto">
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Informations personnelles</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <Mail className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Email</p>
                                <p className="text-xs font-medium truncate">{user.email || 'Non renseigné'}</p>
                              </div>
                            </div>
                            {user.phone_number && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                  <Phone className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-red-600 font-medium">Téléphone personnel</p>
                                  <p className="text-xs font-medium truncate">{user.phone_number}</p>
                                </div>
                              </div>
                            )}
                            {user.office_phone && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                  <Phone className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-red-600 font-medium">Téléphone fixe</p>
                                  <p className="text-xs font-medium truncate">{user.office_phone}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Informations professionnelles</h4>
                          <div className="space-y-2">
                            {(user.department && (typeof user.department === 'object' ? user.department.name : user.department)) && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                  <Building className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-red-600 font-medium">Département</p>
                                  <p className="text-xs font-medium truncate">
                                    {typeof user.department === 'object' ? user.department.name : user.department}
                                  </p>
                                </div>
                              </div>
                            )}
                            {user.position && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                  <User className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-red-600 font-medium">Poste occupé</p>
                                  <p className="text-xs font-medium truncate">{user.position}</p>
                                </div>
                              </div>
                            )}
                            {user.manager && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                  <UsersIcon className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-red-600 font-medium">Manager</p>
                                  <p className="text-xs font-medium truncate">
                                    {typeof user.manager === 'object' 
                                      ? `${user.manager.first_name || ''} ${user.manager.last_name || ''}`.trim() || user.manager.full_name || user.manager.username || 'Aucun'
                                      : 'Aucun'}
                                  </p>
                                  {typeof user.manager === 'object' && user.manager.position && (
                                    <p className="text-[10px] text-muted-foreground truncate">{user.manager.position}</p>
                                  )}
                                </div>
                              </div>
                            )}
                            {user.last_login && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                  <Shield className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-red-600 font-medium">Dernière connexion</p>
                                  <p className="text-xs font-medium truncate">
                                    {new Date(user.last_login).toLocaleString('fr-FR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {user.created_at && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                  <Calendar className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-red-600 font-medium">Date d'inscription</p>
                                  <p className="text-xs font-medium truncate">
                                    {new Date(user.created_at).toLocaleDateString('fr-FR', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="pt-2">
                          <DropdownMenuItem 
                            onClick={() => {
                              setIsEditSectionOpen(!isEditSectionOpen)
                              setIsProfileSectionOpen(false)
                            }} 
                            onSelect={(e) => e.preventDefault()}
                            className="text-sm cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier le profil
                              </div>
                              <ChevronDown className={`h-4 w-4 transition-transform ${isEditSectionOpen ? 'rotate-180' : ''}`} />
                            </div>
                          </DropdownMenuItem>
                        </div>
                      </div>
                    )}
                    
                    {/* Section Édition - Dropdown (pour isLoading) */}
                    {isEditSectionOpen && (
                      <div className="px-2 py-2">
                        <EditProfileDropdown 
                          onSuccess={() => {
                            setIsEditSectionOpen(false)
                            setIsProfileSectionOpen(true)
                          }}
                          onCancel={() => setIsEditSectionOpen(false)}
                        />
                      </div>
                    )}
                    
                    <DropdownMenuItem className="text-sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive cursor-pointer text-sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Sinon, afficher un loader
                  <div className="p-4 flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )
              ) : isAuthenticated && user ? (
                <>
                
                  
                  {/* Toggle Profil */}
                  <DropdownMenuItem 
                    onClick={() => setIsProfileSectionOpen(!isProfileSectionOpen)} 
                    onSelect={(e) => e.preventDefault()}
                    className="text-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isProfileSectionOpen ? 'rotate-180' : ''}`} />
                    </div>
                </DropdownMenuItem>
                  
                  {/* Section Profil - Expandable */}
                  {isProfileSectionOpen && (
                    <div className="px-2 py-2 space-y-3 max-h-[520px] overflow-y-auto">
                      {/* Informations personnelles */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Informations personnelles</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="p-1.5 bg-red-50 rounded">
                              <Mail className="h-3 w-3 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-red-600 font-medium">Email</p>
                              <p className="text-xs font-medium truncate">{user.email || 'Non renseigné'}</p>
                            </div>
                          </div>
                          
                          {user.phone_number && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <Phone className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Téléphone personnel</p>
                                <p className="text-xs font-medium truncate">{user.phone_number}</p>
                              </div>
                            </div>
                          )}
                          
                          {user.office_phone && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <Phone className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Téléphone fixe</p>
                                <p className="text-xs font-medium truncate">{user.office_phone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Informations professionnelles */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Informations professionnelles</h4>
                        <div className="space-y-2">
                          {(user.department && (typeof user.department === 'object' ? user.department.name : user.department)) && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <Building className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Département</p>
                                <p className="text-xs font-medium truncate">
                                  {typeof user.department === 'object' ? user.department.name : user.department}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {user.position && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <User className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Poste occupé</p>
                                <p className="text-xs font-medium truncate">{user.position}</p>
                              </div>
                            </div>
                          )}
                          {user.matricule && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <Shield className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Matricule</p>
                                <p className="text-xs font-medium truncate">{user.matricule}</p>
                              </div>
                            </div>
                          )}
                          
                          {user.manager && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <UsersIcon className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Manager</p>
                                <p className="text-xs font-medium truncate">
                                  {typeof user.manager === 'object' 
                                    ? `${user.manager.first_name || ''} ${user.manager.last_name || ''}`.trim() || user.manager.full_name || user.manager.username || 'Aucun'
                                    : 'Aucun'}
                                </p>
                                {typeof user.manager === 'object' && user.manager.position && (
                                  <p className="text-[10px] text-muted-foreground truncate">{user.manager.position}</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {user.last_login && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <Shield className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Dernière connexion</p>
                                <p className="text-xs font-medium truncate">
                                  {new Date(user.last_login).toLocaleString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {user.created_at && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1.5 bg-red-50 rounded">
                                <Calendar className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-600 font-medium">Date d'inscription</p>
                                <p className="text-xs font-medium truncate">
                                  {new Date(user.created_at).toLocaleDateString('fr-FR', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Toggle Modifier le profil */}
                      <div className="pt-2">
                        <DropdownMenuItem 
                          onClick={() => {
                            setIsEditSectionOpen(!isEditSectionOpen)
                            setIsProfileSectionOpen(false)
                          }} 
                          onSelect={(e) => e.preventDefault()}
                          className="text-sm cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier le profil
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isEditSectionOpen ? 'rotate-180' : ''}`} />
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  )}
                  
                  {/* Section Édition - Dropdown */}
                  {isEditSectionOpen && (
                    <div className="px-2 py-2">
                      <EditProfileDropdown 
                        onSuccess={() => {
                          setIsEditSectionOpen(false)
                          setIsProfileSectionOpen(true)
                        }}
                        onCancel={() => setIsEditSectionOpen(false)}
                      />
                    </div>
                  )}
                  
                <DropdownMenuItem className="text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
                </>
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
        </div>
      </div>
      
    </header>
  )
}
