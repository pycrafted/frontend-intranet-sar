"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLogout } from "@/hooks/useAuth"
import { useArticleStats } from "@/hooks/useArticles"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageLoader } from "@/components/ui/loader"
import {
  Home,
  Newspaper,
  Users,
  FileText,
  MessageSquare,
  MessageCircle,
  Building2,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  UserPlus,
  BarChart3,
  Settings,
  Shield,
  Phone,
  TestTube,
} from "lucide-react"

// Navigation sections - sans badges
const getNavigationSections = () => [
  {
    title: "Tableau de Bord",
    items: [
      { name: "Accueil", href: "/", icon: Home },
      { name: "Sécurité", href: "/securite", icon: Shield },
      { name: "Actualités", href: "/actualites", icon: Newspaper },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { name: "Organigramme", href: "/organigramme", icon: Users },
      { name: "Annuaire", href: "/annuaire", icon: Phone },
      { name: "Chat", href: "/reseau-social", icon: MessageSquare },
      { name: "Forum", href: "/forum", icon: MessageCircle },
    ],
  },
  {
    title: "Ressources",
    items: [
      { name: "Documents", href: "/documents", icon: FileText },
      { name: "Recrutement Interne", href: "/recrutement", icon: UserPlus },
      { name: "Test", href: "/test", icon: TestTube },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "Métriques", href: "/metriques", icon: BarChart3 },
      { name: "Paramètres", href: "/parametres", icon: Settings },
      { name: "Centre de Contrôle", href: "/centre_de_controle", icon: Shield },
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
  const [isCollapsed, setIsCollapsed] = useState(true) // Rétracté par défaut
  const { logout } = useLogout()
  const { stats } = useArticleStats()

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

  // Notifier l'état initial rétracté au chargement
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(true) // Rétracté par défaut
    }
  }, [onCollapseChange])

  // Obtenir les sections de navigation
  const navigationSections = getNavigationSections()

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      router.push('/login')
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
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href !== pathname && !item.href.startsWith('#')) {
                        setIsLoading(true)
                      }
                      if (onClose) onClose()
                    }}
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

      {/* Bouton de déconnexion fixé en bas */}
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
    </div>
  )

  const NavigationContent = () => (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-sm">
      {/* Bouton de rétractement - Responsive */}
      <div className="flex justify-end p-1.5 sm:p-2 border-b border-slate-200/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label={isCollapsed ? "Développer le menu" : "Rétracter le menu"}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-2 sm:px-3 lg:px-4 pt-3 sm:pt-4 space-y-6 sm:space-y-8 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2 sm:space-y-3">
            {!isCollapsed && (
              <div className="px-2 sm:px-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href !== pathname && !item.href.startsWith('#')) {
                        setIsLoading(true)
                      }
                      if (onClose) onClose()
                    }}
                    className={cn(
                      "group flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200/50"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm",
                      isCollapsed ? "justify-center" : ""
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {/* Effet de survol avec gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300",
                      "group-hover:opacity-100"
                    )} />
                    
                    <div className="flex items-center relative z-10">
                      <div className={cn(
                        "p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-300",
                        isActive 
                          ? "bg-blue-100 text-blue-600 shadow-sm" 
                          : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                      )}>
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      {!isCollapsed && (
                        <span className="ml-2 sm:ml-3 font-medium text-xs sm:text-sm">{item.name}</span>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center space-x-1.5 sm:space-x-2 relative z-10">
                        {isActive && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bouton de déconnexion fixé en bas - Responsive */}
      <div className="border-t border-slate-200/60 bg-slate-50/50 p-2 sm:p-3 lg:p-4 mt-auto">
        <Button 
          variant="outline" 
          className={cn(
            "w-full text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-300 border-slate-200 hover:shadow-sm text-xs sm:text-sm",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={handleLogout}
          disabled={isLoading}
          title={isCollapsed ? "Se déconnecter" : undefined}
        >
          {isLoading ? (
            <>
              <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              {!isCollapsed && <span className="ml-2 sm:ml-3">Déconnexion...</span>}
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {!isCollapsed && <span className="ml-2 sm:ml-3">Se déconnecter</span>}
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar Desktop - Responsive */}
      <aside className={cn(
        "hidden tablet:flex tablet:flex-col tablet:fixed tablet:top-16 tablet:bottom-0 tablet:z-40 border-r border-gray-200 shadow-sm transition-all duration-300",
        isCollapsed ? "tablet:w-12 lg:w-16" : "tablet:w-56 lg:w-64"
      )}>
        <NavigationContent />
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
