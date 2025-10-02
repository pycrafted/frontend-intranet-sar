"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  TrendingUp,
  Users,
  Calendar,
  Star,
  Bookmark,
  Filter,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Clock,
  Megaphone,
  FileText,
  Building2,
  BarChart3,
} from "lucide-react"

const filterSections = [
  {
    title: "Filtres",
    items: [
      { name: "Tout", href: "/actualites?filter=all", icon: FileText, badge: "12", count: 12 },
      { name: "Annonces", href: "/actualites?filter=announcements", icon: Megaphone, badge: "3", count: 3 },
      { name: "Événements", href: "/actualites?filter=events", icon: Calendar, badge: "4", count: 4 },
      { name: "Publications", href: "/actualites?filter=publications", icon: FileText, badge: "5", count: 5 },
      { name: "Sondages", href: "/actualites?filter=polls", icon: BarChart3, badge: "2", count: 2 },
    ],
  },
]

const departmentSections = [
  {
    title: "Départements",
    items: [
      { name: "Direction Générale", href: "/actualites?department=direction-generale", icon: Building2, badge: "4", count: 4 },
      { name: "Direction Financière", href: "/actualites?department=direction-financiere", icon: TrendingUp, badge: "2", count: 2 },
      { name: "Direction Technique", href: "/actualites?department=direction-technique", icon: Settings, badge: "6", count: 6 },
      { name: "Direction Commerciale", href: "/actualites?department=direction-commerciale", icon: Users, badge: "3", count: 3 },
      { name: "Direction des Ressources Humaines", href: "/actualites?department=rh", icon: Users, badge: "5", count: 5 },
      { name: "Direction de la Sécurité", href: "/actualites?department=securite", icon: Settings, badge: "4", count: 4 },
      { name: "Direction de l'Environnement", href: "/actualites?department=environnement", icon: Star, badge: "2", count: 2 },
      { name: "Direction de la Formation", href: "/actualites?department=formation", icon: Bookmark, badge: "3", count: 3 },
      { name: "Direction de la Maintenance", href: "/actualites?department=maintenance", icon: Settings, badge: "4", count: 4 },
      { name: "Direction de la Qualité", href: "/actualites?department=qualite", icon: Star, badge: "2", count: 2 },
    ],
  },
]


interface ActualitesSidebarProps {
  activeFilter?: string
  onFilterChange?: (filter: string) => void
  activeDepartment?: string
  onDepartmentChange?: (department: string) => void
}

export function ActualitesSidebar({ 
  activeFilter = "all", 
  onFilterChange, 
  activeDepartment = "all",
  onDepartmentChange 
}: ActualitesSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:left-64 lg:top-32 lg:bottom-0 lg:z-30 border-r border-gray-200 shadow-sm bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Actualités</h2>
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
          {/* Section Filtres */}
          {filterSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const filterId = item.href.split('filter=')[1] || 'all'
                  const isActive = activeFilter === filterId
                  return (
                    <button
                      key={item.name}
                      onClick={() => onFilterChange?.(filterId)}
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

          {/* Section Départements */}
          {departmentSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const departmentId = item.href.split('department=')[1] || 'all'
                  const isActive = activeDepartment === departmentId
                  return (
                    <button
                      key={item.name}
                      onClick={() => onDepartmentChange?.(departmentId)}
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

      </div>
    </aside>
  )
}
