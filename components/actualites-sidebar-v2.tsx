"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PublicationModal } from "./publication-modal"
import { AnnouncementModal } from "./announcement-modal"
import {
  TrendingUp,
  Calendar,
  Star,
  Search,
  Bell,
  Clock,
  Megaphone,
  FileText,
  Building2,
  BarChart3,
  Eye,
  Heart,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  Lightbulb,
  Utensils,
  Plus
} from "lucide-react"

// Hook pour récupérer les statistiques depuis l'API
function useActualitesStats() {
  const [stats, setStats] = useState({
    filters: { all: 0, news: 0, announcements: 0 },
    categories: {},
    departments: {},
    recent: 0,
    trending: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/actualites/stats/')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
}

interface ActualitesSidebarV2Props {
  activeFilter?: string
  onFilterChange?: (filter: string) => void
  activeDepartment?: string
  onDepartmentChange?: (department: string) => void
  activeTimeFilter?: string
  onTimeFilterChange?: (timeFilter: string) => void
  title?: string
  isFeedbackPage?: boolean
}

export function ActualitesSidebarV2({ 
  activeFilter = "all", 
  onFilterChange, 
  activeDepartment = "all",
  onDepartmentChange,
  activeTimeFilter = "all",
  onTimeFilterChange,
  title = "Actualités",
  isFeedbackPage = false
}: ActualitesSidebarV2Props) {
  const { stats, loading } = useActualitesStats()
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    time: true,
    categories: true
  })
  const [showPublicationModal, setShowPublicationModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Filtres principaux avec vraies données
  const filterItems = [
    { 
      id: "all", 
      name: "Toutes les publications", 
      icon: FileText, 
      count: stats.filters.all,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      id: "news", 
      name: "Actualité", 
      icon: Megaphone, 
      count: stats.filters.news,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      id: "announcement", 
      name: "Annonce", 
      icon: Bell, 
      count: stats.filters.announcements,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  // Filtres pour la page feedback (section Accueil)
  const feedbackFilterItems = [
    { 
      id: "safety", 
      name: "Sécurité du travail", 
      icon: Shield, 
      count: 0,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    { 
      id: "ideas", 
      name: "Boîtes à idées", 
      icon: Lightbulb, 
      count: 0,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      id: "polls", 
      name: "Enquêtes", 
      icon: BarChart3, 
      count: 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      id: "events", 
      name: "Événements", 
      icon: Calendar, 
      count: 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      id: "menu", 
      name: "Menu de la semaine", 
      icon: Utensils, 
      count: 0,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ]

  // Filtres conditionnels selon la page
  const currentFilterItems = isFeedbackPage ? feedbackFilterItems : filterItems

  // Titre conditionnel pour la section des filtres
  const filtersSectionTitle = isFeedbackPage ? "Accueil" : "Types de contenu"
  
  // Titre conditionnel pour la section temporelle
  const timeSectionTitle = isFeedbackPage ? "Actualités" : "Période"
  
  // Titre conditionnel pour la section des catégories
  const categoriesSectionTitle = isFeedbackPage ? "Annuaire et organigramme" : "Catégories"

  // Filtres temporels avec compteurs dynamiques
  const timeFilters = [
    { id: "all", name: "Toutes les périodes", icon: Calendar, count: stats.filters.all },
    { id: "today", name: "Aujourd'hui", icon: Clock, count: stats.timeFilters?.today || 0 },
    { id: "week", name: "Cette semaine", icon: Calendar, count: stats.timeFilters?.week || 0 },
    { id: "month", name: "Ce mois", icon: Calendar, count: stats.timeFilters?.month || 0 }
  ]

  // Filtres pour la page feedback (section Actualités)
  const feedbackTimeFilters = [
    { id: "articles", name: "Articles", icon: FileText, count: stats.filters.all }
  ]

  // Filtres conditionnels selon la page
  const currentTimeFilters = isFeedbackPage ? feedbackTimeFilters : timeFilters

  // Catégories dynamiques (basées sur l'API)
  const categoryItems = [
    { id: "all", name: "Toutes les catégories", icon: Target, count: stats.filters.all },
    { id: "securite", name: "Sécurité", icon: AlertCircle, count: stats.categories?.Sécurité || 0 },
    { id: "finance", name: "Finance", icon: TrendingUp, count: stats.categories?.Finance || 0 },
    { id: "formation", name: "Formation", icon: Bookmark, count: stats.categories?.Formation || 0 },
    { id: "production", name: "Production", icon: Building2, count: stats.categories?.Production || 0 },
    { id: "partenariat", name: "Partenariat", icon: Star, count: stats.categories?.Partenariat || 0 },
    { id: "environnement", name: "Environnement", icon: CheckCircle, count: stats.categories?.Environnement || 0 },
    { id: "rh", name: "Ressources Humaines", icon: Users, count: stats.categories?.RH || 0 }
  ]

  // Filtres pour la page feedback (section Annuaire et organigramme)
  const feedbackCategoryItems = [
    { id: "employees", name: "Employés", icon: Users, count: 0, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "departments", name: "Départements", icon: Building2, count: 0, color: "text-green-600", bgColor: "bg-green-50" },
    { id: "positions", name: "Postes", icon: Target, count: 0, color: "text-purple-600", bgColor: "bg-purple-50" }
  ]

  // Filtres conditionnels selon la page
  const currentCategoryItems = isFeedbackPage ? feedbackCategoryItems : categoryItems



  const SidebarSection = ({ 
    title, 
    items, 
    isExpanded, 
    onToggle, 
    activeItem, 
    onItemClick,
    showCount = true 
  }: {
    title: string
    items: Array<{
      id: string
      name: string
      icon: any
      count: number
      color?: string
      bgColor?: string
    }>
    isExpanded: boolean
    onToggle: () => void
    activeItem: string
    onItemClick: (id: string) => void
    showCount?: boolean
  }) => (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
      >
        {title}
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 w-full text-left",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center">
                  <Icon
                    className={cn(
                      "mr-3 h-4 w-4 transition-colors",
                      isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                    )}
                  />
                  {item.name}
                </div>
                {showCount && item.count > 0 && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="h-5 px-2 text-xs"
                  >
                    {item.count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <aside className={cn(
      "hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:left-64 lg:top-16 lg:bottom-0 lg:z-30 border-r border-gray-200 shadow-sm bg-white"
    )}>
      <div className="flex flex-col h-full">
        {/* Header avec recherche */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            
            {/* Icônes discrètes - seulement pour la page actualités */}
            {!isFeedbackPage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPublicationModal(true)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 group relative"
                  title="Créer une nouvelle actualité"
                >
                  <FileText className="h-4 w-4" />
                  {/* Tooltip personnalisé */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                    Nouvelle Actualité
                  </div>
                </button>
                
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all duration-200 group relative"
                  title="Créer une nouvelle annonce"
                >
                  <Megaphone className="h-4 w-4" />
                  {/* Tooltip personnalisé */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                    Nouvelle Annonce
                  </div>
                </button>
              </div>
            )}
          </div>
          
        </div>


        {/* Navigation sections */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Filtres principaux */}
          <SidebarSection
            title={filtersSectionTitle}
            items={currentFilterItems}
            isExpanded={expandedSections.filters}
            onToggle={() => toggleSection('filters')}
            activeItem={activeFilter}
            onItemClick={(id) => onFilterChange?.(id)}
          />

          <Separator />

          {/* Filtres temporels */}
          <SidebarSection
            title={timeSectionTitle}
            items={currentTimeFilters}
            isExpanded={expandedSections.time}
            onToggle={() => toggleSection('time')}
            activeItem={activeTimeFilter || 'all'}
            onItemClick={(id) => onTimeFilterChange?.(id)}
          />

          <Separator />

          {/* Catégories */}
          <SidebarSection
            title={categoriesSectionTitle}
            items={currentCategoryItems}
            isExpanded={expandedSections.categories}
            onToggle={() => toggleSection('categories')}
            activeItem={activeDepartment}
            onItemClick={(id) => onDepartmentChange?.(id)}
          />

        </nav>

      </div>

      {/* Modals de création */}
      <PublicationModal 
        isOpen={showPublicationModal} 
        onClose={() => setShowPublicationModal(false)} 
      />
      <AnnouncementModal 
        isOpen={showAnnouncementModal} 
        onClose={() => setShowAnnouncementModal(false)} 
      />
    </aside>
  )
}
