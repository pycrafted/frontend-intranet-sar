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
      { name: "Actualités", href: "/actualites", icon: Newspaper, badge: articlesCount > 0 ? articlesCount.toString() : null },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { name: "Organigramme", href: "/organigramme", icon: Users, badge: null },
      { name: "Annuaire", href: "/annuaire", icon: Phone, badge: null },
      { name: "Chat", href: "/reseau-social", icon: MessageSquare, badge: "12" },
      { name: "Forum", href: "/reseau-social", icon: MessageCircle, badge: "8" },
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
      { name: "Métriques", href: "/admin/metrics", icon: BarChart3, badge: null },
      { name: "Centre de Contrôle", href: "/centre_de_controle", icon: Shield, badge: null },
      { name: "Paramétrage", href: "/admin/settings", icon: Settings, badge: null },
    ],
  },
]

interface NavigationProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useLogout()
  const { stats } = useArticleStats()

  // Arrêter le loader quand la page change
  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

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
    <div className="relative flex flex-col h-screen bg-white border-r border-gray-200">
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto pb-20">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <div className="px-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
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
                      "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <div className="flex items-center">
                      <Icon
                        className={cn(
                          "mr-3 h-4 w-4 transition-colors",
                          isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                        )}
                      />
                      {item.name}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <Badge variant={isActive ? "secondary" : "outline"} className="h-5 px-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && <ChevronRight className="h-3 w-3 text-blue-600" />}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bouton de déconnexion positionné en bas absolu */}
      <div className="fixed bottom-0 left-0 w-64 p-4 border-t border-gray-200 bg-white shadow-lg z-50">
        <Button 
          variant="outline" 
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-3 h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Déconnexion...
            </>
          ) : (
            <>
              <LogOut className="mr-3 h-4 w-4" />
              Se déconnecter
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-16 lg:z-40 border-r border-gray-200 shadow-sm">
        <NavigationContent />
      </aside>

      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0 bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">SAR-Connect</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
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
