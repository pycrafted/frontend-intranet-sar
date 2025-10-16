"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  Lightbulb,
  Shield,
  Menu,
  Calendar,
  ClipboardList,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Building2,
} from "lucide-react"

const controlCenterSections = [
  {
    title: "Gestion des Utilisateurs",
    items: [
      { name: "Utilisateurs", section: "users", icon: Users, badge: "24", count: 24 },
    ],
  },
  {
    title: "Gestion de l'Annuaire",
    items: [
      { name: "Employés", section: "employees", icon: Users, badge: "45", count: 45 },
      { name: "Départements", section: "departments", icon: Building2, badge: "8", count: 8 },
    ],
  },
  {
    title: "Gestion de l'Organigramme",
    items: [
      { name: "Directions", section: "organigramme-directions", icon: Building2, badge: "12", count: 12 },
      { name: "Agents", section: "organigramme-agents", icon: Users, badge: "67", count: 67 },
    ],
  },
  {
    title: "Gestion de Contenu",
    items: [
      { name: "Articles", section: "articles", icon: FileText, badge: "156", count: 156 },
      { name: "Idées", section: "ideas", icon: Lightbulb, badge: "43", count: 43 },
    ],
  },
  {
    title: "Services Internes",
    items: [
      { name: "Sécurité", section: "safety", icon: Shield, badge: "12", count: 12 },
      { name: "Menu", section: "menu", icon: Menu, badge: "8", count: 8 },
      { name: "Événements", section: "events", icon: Calendar, badge: "15", count: 15 },
    ],
  },
]

interface ControlCenterSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
  onCollapseChange?: (isCollapsed: boolean) => void
  isCollapsed?: boolean
  disableCollapse?: boolean
  isMainSidebarCollapsed?: boolean
}

export function ControlCenterSidebar({ 
  activeSection = "users", 
  onSectionChange,
  onCollapseChange,
  isCollapsed: externalIsCollapsed,
  disableCollapse = false,
  isMainSidebarCollapsed = false
}: ControlCenterSidebarProps) {
  const pathname = usePathname()
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true) // Rétracté par défaut
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false)
  
  // Logique : priorité à l'état externe (synchronisation avec le sidebar principal)
  // Le contrôle manuel n'est utilisé que pour les interactions utilisateur
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : (isManuallyCollapsed || internalIsCollapsed)

  // Réinitialiser le contrôle manuel seulement quand le sidebar principal est rétracté
  useEffect(() => {
    if (isMainSidebarCollapsed) {
      setIsManuallyCollapsed(false)
    }
    // Quand le sidebar principal est développé, on ne réinitialise pas le contrôle manuel
  }, [isMainSidebarCollapsed])

  // Initialiser le sidebar comme rétracté au chargement
  useEffect(() => {
    setInternalIsCollapsed(true)
  }, [])

  // Notifier le parent du changement d'état de rétractement
  useEffect(() => {
    if (onCollapseChange && !disableCollapse) {
      onCollapseChange(isCollapsed)
    }
  }, [isCollapsed, onCollapseChange, disableCollapse])

  // Fonction pour gérer le rétractement manuel
  const handleCollapseToggle = () => {
    if (!disableCollapse) {
      // Permettre le contrôle indépendant du sidebar secondaire
      const newState = !isCollapsed
      setIsManuallyCollapsed(newState)
      // Notifier immédiatement le parent
      if (onCollapseChange) {
        onCollapseChange(newState)
      }
    }
  }

  return (
    <aside className={cn(
      "hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:z-30 border-r border-slate-200/60 shadow-sm transition-all duration-300",
      isCollapsed ? "lg:w-16" : "lg:w-80",
      isMainSidebarCollapsed ? "lg:left-16" : "lg:left-64"
    )} style={{backgroundColor: "#344256"}}>
      <div className="relative flex flex-col h-full">
        {/* Bouton de rétractement */}
        {!disableCollapse && (
          <div className="flex justify-end p-2 border-b border-slate-200/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseToggle}
              className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-500/20 rounded-lg transition-all duration-200"
              aria-label={
                isCollapsed 
                  ? "Développer le menu" 
                  : "Rétracter le menu"
              }
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Navigation sections */}
        <nav className="flex-1 px-4 pt-4 space-y-8 overflow-y-auto">
          {controlCenterSections.map((section) => (
            <div key={section.title} className="space-y-3">
              {!isCollapsed && (
                <div className="px-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    {section.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section
                  return (
                    <button
                      key={item.name}
                      onClick={() => onSectionChange?.(item.section)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden w-full text-left",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-sm border border-blue-400/30"
                          : "text-slate-200 hover:bg-slate-500/20 hover:text-white hover:shadow-sm",
                        isCollapsed ? "justify-center" : ""
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {/* Effet de survol avec gradient */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300",
                        "group-hover:opacity-100"
                      )} />
                      
                      <div className="flex items-center relative z-10">
                        <div className={cn(
                          "p-2 rounded-lg transition-all duration-300",
                          isActive 
                            ? "bg-blue-500/30 text-white shadow-sm" 
                            : "bg-slate-500/20 text-slate-300 group-hover:bg-blue-500/30 group-hover:text-white"
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
                                  ? "bg-blue-500/30 text-white border-blue-400/50" 
                                  : "bg-slate-500/20 text-slate-300 border-slate-400/30"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>
    </aside>
  )
}
