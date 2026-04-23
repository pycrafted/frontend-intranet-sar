"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLogout } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"


import { PageLoader } from "@/components/ui/loader"
import {
  Home,
  Newspaper,
  Users,
  FileText,
  MessageCircle,
  X,
  LogOut,
  UserPlus,
  BarChart3,
  Shield,
  Phone,
  ClipboardList,
  UserCog,
  Settings,
  Bot,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAIChatbot } from "@/contexts/AIChatbotContext"

// Navigation sections - sans badges (version de base)
const getBaseNavigationSections = () => [
  {
    title: "Tableau de Bord",
    items: [
      { name: "Accueil",    shortName: "Accueil",  href: "/",          icon: Home      },
      { name: "Actualités", shortName: "Actus",    href: "/actualites", icon: Newspaper },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { name: "Organigramme", shortName: "Équipes",  href: "/organigramme",  icon: Users         },
      { name: "Annuaire",     shortName: "Annuaire", href: "/annuaire",       icon: Phone         },
      { name: "Forum",        shortName: "Forum",    href: "/forum",          icon: MessageCircle, authOnly: true },
    ],
  },
  {
    title: "Ressources",
    items: [
      { name: "Bibliothèque",        shortName: "Docs",       href: "/documents",  icon: FileText  },
      { name: "Sensibilisation",     shortName: "Prévention", href: "/securite",   icon: Shield    },
      { name: "Recrutement Interne", shortName: "Emplois",    href: "/recrutement", icon: UserPlus },
      { name: "Interface SIRH",      shortName: "SIRH",       href: "/sirh",        icon: ClipboardList, authOnly: true },
    ],
  },
]

interface NavigationProps {
  isOpen?: boolean
  onClose?: () => void
  onCollapseChange?: (isCollapsed: boolean) => void
}

export function Navigation({ isOpen, onClose, onCollapseChange }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isCollapsed = true // Toujours rétracté — définitivement
  const [mounted, setMounted] = useState(false) // Pour éviter les erreurs d'hydratation
  const { logout } = useLogout()
  const [showSettings, setShowSettings] = useState(false)
  const [togglingChatbot, setTogglingChatbot] = useState(false)

  const { user } = useAuth()
  const { chatbotEnabled, setChatbotEnabled, sirhEnabled, setSirhEnabled } = useAIChatbot()

  useEffect(() => {
    if (!showSettings) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-settings-dropdown]')) setShowSettings(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSettings])

  const patchConfig = async (payload: Record<string, boolean>) => {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? ''
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000'
    await fetch(`${base}/api/config/chatbot/update/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
      body: JSON.stringify(payload),
    })
  }

  const handleToggleChatbot = async (enabled: boolean) => {
    setTogglingChatbot(true)
    try {
      await patchConfig({ chatbot_enabled: enabled })
      setChatbotEnabled(enabled)
    } catch { } finally { setTogglingChatbot(false) }
  }

  const [togglingSirh, setTogglingSirh] = useState(false)
  const handleToggleSirh = async (enabled: boolean) => {
    setTogglingSirh(true)
    try {
      await patchConfig({ sirh_enabled: enabled })
      setSirhEnabled(enabled)
    } catch { } finally { setTogglingSirh(false) }
  }

  // Marquer comme monté après le premier rendu côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Arrêter le loader quand la page change
  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  // Notifier le parent du changement d'état de rétractement
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed)
    }
  }, [isCollapsed, onCollapseChange])

  // Notifier l'état initial ouvert au chargement
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(false) // Ouvert par défaut
    }
  }, [onCollapseChange])

  // Obtenir les sections de navigation et ajouter Administration si admin ou communication
  // Utiliser useState pour éviter les problèmes d'hydratation
  const [navigationSections, setNavigationSections] = useState(() => getBaseNavigationSections())
  
  useEffect(() => {
    const sections = getBaseNavigationSections()
    const isAuthenticated = !!user
    const isSuperuser = !!user && user.is_superuser

    // Filtrer les liens "Chat" et "Forum" si l'utilisateur n'est pas authentifié
    sections.forEach(section => {
      section.items = section.items.filter(item => {
        if ((item as any).authOnly && !isAuthenticated) return false
        if (item.href === '/sirh' && !sirhEnabled) return false
        return true
      })
    })
    if (isSuperuser) {
      sections.push({
        title: "Administration",
        items: [
          { name: "Métriques", shortName: "Métriques", href: "/metriques", icon: BarChart3 },
          { name: "Utilisateurs", shortName: "Users", href: "/administration/utilisateurs", icon: UserCog },
        ],
      })
    }
    setNavigationSections(sections)
  }, [user, sirhEnabled])

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      router.push('/')
    } catch (error) {
      setIsLoading(false)
    }
  }

  // Contenu de navigation pour mobile (toujours développé)
  const MobileNavigationContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      {/* Header mobile avec bouton fermer */}
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-slate-200/60">
        <h2 className="text-lg font-semibold text-slate-800">Menu</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Fermer le menu"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      <nav className="flex-1 px-3 pt-3 space-y-4 sm:space-y-6 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <div className="px-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                {section.title}
              </h3>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.name === "Forum" && pathname?.startsWith("/forum"))
                const handleForumClick = async (e: React.MouseEvent) => {
                  if (item.name === "Forum") {
                    e.preventDefault()
                    router.push("/forum")
                    if (onClose) onClose()
                  } else {
                    if (item.href !== pathname && !item.href.startsWith('#')) {
                      setIsLoading(true)
                    }
                    if (onClose) onClose()
                  }
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleForumClick}
                    className={cn(
                      "group flex items-center justify-between px-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200/50"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                    )}
                  >
                    {/* Effet de survol avec gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300",
                      "group-hover:opacity-100"
                    )} />
                    
                    <div className="flex items-center relative z-10">
                      <div className={cn(
                        "p-1.5 rounded-md transition-all duration-300",
                        isActive 
                          ? "bg-blue-100 text-blue-600 shadow-sm" 
                          : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="ml-2.5 font-medium text-sm">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 relative z-10">
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bouton de déconnexion fixé en bas - Affiché uniquement si connecté */}
      {user && (
        <div className="border-t border-slate-200/60 bg-slate-50/50 p-3 mt-auto">
          <Button 
            variant="outline" 
            className="w-full text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-300 border-slate-200 hover:shadow-sm justify-start text-sm py-2.5"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2.5">Déconnexion...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span className="ml-2.5">Se déconnecter</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )


  const NavItem = ({ item, onItemClose }: { item: any; onItemClose?: () => void }) => {
    const Icon = item.icon
    const isActive = pathname === item.href || (item.name === "Forum" && pathname?.startsWith("/forum"))
    const handleClick = async (e: React.MouseEvent) => {
      if (item.name === "Forum") {
        e.preventDefault()
        router.push("/forum")
        if (onClose) onClose()
        if (onItemClose) onItemClose()
      } else {
        if (item.href !== pathname && !item.href.startsWith('#')) {
          setIsLoading(true)
        }
        if (onClose) onClose()
        if (onItemClose) onItemClose()
      }
    }
    return (
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "group flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl transition-all duration-200 relative overflow-hidden w-full",
          isActive
            ? "bg-gradient-to-b from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200/50"
            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
        )}
      >
        <div className={cn(
          "p-1.5 rounded-lg transition-all duration-200",
          isActive ? "bg-blue-100 text-blue-600 shadow-sm" : "text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <span className={cn(
          "text-[9px] font-medium text-center leading-tight w-full truncate px-0.5",
          isActive ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"
        )}>
          {item.shortName ?? item.name}
        </span>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
        )}
      </Link>
    )
  }

  const NavigationContent = () => (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-sm">
      <nav className="flex-1 pt-2 overflow-y-auto px-1.5 space-y-0">
        {navigationSections.map((section, sectionIdx) => (
          <div key={section.title}>
            {sectionIdx > 0 && (
              <div className="my-1.5 mx-2 border-t border-slate-200/70" />
            )}
            <div className="space-y-0.5 py-1">
              {section.items.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bas de sidebar : paramètres + déconnexion */}
      <div className="border-t border-slate-200/60 bg-slate-50/50 p-1.5 mt-auto flex flex-col gap-0.5">

        {/* Dropdown paramètres — superadmin uniquement */}
        {user?.is_superuser && (
          <div className="relative" data-settings-dropdown>
            <button
              onClick={() => setShowSettings(s => !s)}
              title="Paramètres"
              className={cn(
                "w-full flex items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 group",
                showSettings ? "bg-[#344256]/10" : "hover:bg-slate-100"
              )}
            >
              <Settings className="h-4 w-4 transition-colors" style={{ color: '#344256' }} />
            </button>

            {showSettings && (
              <div
                className="absolute bottom-0 left-full ml-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-52"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
              >
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Paramètres</p>
                <label className="flex items-center gap-2.5 cursor-pointer group/label">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={chatbotEnabled}
                      disabled={togglingChatbot}
                      onChange={e => handleToggleChatbot(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      onClick={() => !togglingChatbot && handleToggleChatbot(!chatbotEnabled)}
                      className="w-8 h-4 rounded-full transition-colors duration-200 cursor-pointer flex items-center px-0.5"
                      style={{ backgroundColor: chatbotEnabled ? '#344256' : '#cbd5e1' }}
                    >
                      <div
                        className="w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
                        style={{ transform: chatbotEnabled ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Bot className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#344256' }} />
                    <span className="text-xs font-medium text-slate-700 truncate">Chatbot MAÏ</span>
                  </div>
                  {togglingChatbot && (
                    <div className="h-3 w-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: '#344256', borderTopColor: 'transparent' }} />
                  )}
                </label>

                <div className="my-2 border-t border-slate-100" />

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <div
                      onClick={() => !togglingSirh && handleToggleSirh(!sirhEnabled)}
                      className="w-8 h-4 rounded-full transition-colors duration-200 cursor-pointer flex items-center px-0.5"
                      style={{ backgroundColor: sirhEnabled ? '#344256' : '#cbd5e1' }}
                    >
                      <div
                        className="w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
                        style={{ transform: sirhEnabled ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#344256' }} />
                    <span className="text-xs font-medium text-slate-700 truncate">Interface SIRH</span>
                  </div>
                  {togglingSirh && (
                    <div className="h-3 w-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: '#344256', borderTopColor: 'transparent' }} />
                  )}
                </label>
              </div>
            )}
          </div>
        )}

        {/* Bouton déconnexion */}
        {user && (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center py-2 px-1 rounded-xl hover:bg-red-50 transition-all duration-200 group"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#344256', borderTopColor: 'transparent' }} />
            ) : (
              <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" style={{ color: '#344256' }} />
            )}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar Desktop - Responsive */}
      <aside className={cn(
        "hidden tablet:flex tablet:flex-col tablet:fixed tablet:top-16 tablet:bottom-0 tablet:z-40 border-r border-gray-200 shadow-sm transition-all duration-300",
        isCollapsed ? "tablet:w-[4.5rem] md:w-[4.5rem] lg:w-[4.5rem]" : "tablet:w-56 md:w-60 lg:w-64"
      )}>
        {mounted ? <NavigationContent /> : (
          <div className="relative flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-sm">
            <div className="flex justify-end p-1.5 sm:p-2 border-b border-slate-200/60">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-slate-100 animate-pulse" />
            </div>
            <nav className="flex-1 pt-3 sm:pt-4 space-y-6 sm:space-y-8 overflow-y-auto px-2 sm:px-3 lg:px-4">
              {/* Placeholder pour éviter l'erreur d'hydratation */}
            </nav>
          </div>
        )}
      </aside>

      {/* Sheet Mobile - Responsive */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="left" 
          className="!w-[50vw] !xs:w-48 !sm:w-52 !tablet:w-64 p-0 bg-gradient-to-b from-slate-50 to-white"
        >
          <MobileNavigationContent onClose={onClose} />
        </SheetContent>
      </Sheet>

      {isLoading && <PageLoader />}
    </>
  )
}
