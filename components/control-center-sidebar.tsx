"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
}

export function ControlCenterSidebar({ 
  activeSection = "users", 
  onSectionChange 
}: ControlCenterSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:left-64 lg:top-32 lg:bottom-0 lg:z-30 border-r border-gray-200 shadow-sm bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Centre de Contrôle</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {controlCenterSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.section
                  return (
                    <button
                      key={item.name}
                      onClick={() => onSectionChange?.(item.section)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 w-full text-left",
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
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer avec statistiques */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Total des éléments</span>
              <span className="font-semibold">348</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Dernière mise à jour</span>
              <span className="font-semibold">2 min</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
