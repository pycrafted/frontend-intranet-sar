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
} from "lucide-react"

// Navigation sections - les badges seront ajoutés dynamiquement
const getNavigationSections = (articlesCount: number) => [
  {
    title: "Tableau de Bord",
    items: [
      { name: "Accueil", href: "/", icon: Home, badge: null },
      { name: "Sécurité", href: "/securite", icon: Shield, badge: "Dev" },
      { name: "Actualités", href: "/actualites", icon: Newspaper, badge: articlesCount > 0 ? articlesCount.toString() : null },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { name: "Organigramme", href: "/organigramme", icon: Users, badge: null },
      { name: "Annuaire", href: "/annuaire", icon: Phone, badge: null },
      { name: "Chat", href: "/reseau-social", icon: MessageSquare, badge: "12" },
      { name: "Forum", href: "/forum", icon: MessageCircle, badge: "8" },
    ],
  },
  {
    title: "Ressources",
    items: [
      { name: "Documents", href: "/documents", icon: FileText, badge: null },
      { name: "Recrutement Interne", href: "/recrutement", icon: UserPlus, badge: null },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "Métriques", href: "/metriques", icon: BarChart3, badge: null },
      { name: "Paramètres", href: "/parametres", icon: Settings, badge: null },
      { name: "Centre de Contrôle", href: "/centre_de_controle", icon: Shield, badge: null },
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

  // Obtenir le nombre d'articles pour le badge
  const articlesCount = stats?.filters?.all || 0
  const navigationSections = getNavigationSections(articlesCount)

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

  const NavigationContent = () => (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-sm">
      {/* Bouton de rétractement */}
      <div className="flex justify-end p-2 border-b border-slate-200/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label={isCollapsed ? "Développer le menu" : "Rétracter le menu"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-4 pt-4 space-y-8 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-3">
            {!isCollapsed && (
              <div className="px-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                      "group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden",
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
                        "p-2 rounded-lg transition-all duration-300",
                        isActive 
                          ? "bg-blue-100 text-blue-600 shadow-sm" 
                          : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{item.name}</span>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center space-x-2 relative z-10">
                        {item.badge && (
                          <Badge 
                            variant={isActive ? "default" : "secondary"} 
                            className={cn(
                              "h-5 px-2 text-xs font-medium transition-all duration-300",
                              isActive 
                                ? "bg-blue-100 text-blue-700 border-blue-200" 
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
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

      {/* Bouton de déconnexion fixé en bas */}
      <div className="border-t border-slate-200/60 bg-slate-50/50 p-4 mt-auto">
        <Button 
          variant="outline" 
          className={cn(
            "w-full text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-300 border-slate-200 hover:shadow-sm",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={handleLogout}
          disabled={isLoading}
          title={isCollapsed ? "Se déconnecter" : undefined}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              {!isCollapsed && <span className="ml-3">Déconnexion...</span>}
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-3">Se déconnecter</span>}
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:z-40 border-r border-gray-200 shadow-sm transition-all duration-300",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <NavigationContent />
      </aside>

      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center justify-end h-16 px-6 border-b border-slate-200/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Fermer le menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {isLoading && <PageLoader />}
    </>
  )
}
