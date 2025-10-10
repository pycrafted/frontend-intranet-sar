"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Folder,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Download,
  Eye,
  Calendar,
  User,
  HardDrive,
  File,
  Plus,
  BarChart3,
  Clock,
  Target,
  Building2,
  Shield,
  Users,
  TrendingUp,
  Bookmark,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  SortAsc,
  SortDesc
} from "lucide-react"

// Hook pour récupérer les statistiques des documents
function useDocumentsStats() {
  const [stats, setStats] = useState({
    total_documents: 0,
    total_downloads: 0,
    recent_documents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/documents/stats/')
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


interface DocumentsSidebarProps {
  activeSort?: string
  onSortChange?: (sort: string) => void
  activeTimeFilter?: string
  onTimeFilterChange?: (timeFilter: string) => void
  title?: string
  documentsCount?: number
  documents?: any[]
  onUploadSuccess?: () => void
  onUploadClick?: () => void
}

export function DocumentsSidebar({ 
  activeSort = "-created_at",
  onSortChange,
  activeTimeFilter = "all",
  onTimeFilterChange,
  title = "Documents",
  documentsCount = 0,
  documents = [],
  onUploadSuccess,
  onUploadClick
}: DocumentsSidebarProps) {
  const { stats, loading: statsLoading } = useDocumentsStats()
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    time: true
  })


  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Options de tri
  const filterItems = [
    { 
      id: "title", 
      name: "Nom A-Z", 
      icon: SortAsc, 
      count: 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      id: "-title", 
      name: "Nom Z-A", 
      icon: SortDesc, 
      count: 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      id: "-created_at", 
      name: "Plus récent", 
      icon: Calendar, 
      count: 0,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      id: "created_at", 
      name: "Plus ancien", 
      icon: Calendar, 
      count: 0,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      id: "downloaded", 
      name: "Plus téléchargé", 
      icon: Download, 
      count: 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    { 
      id: "-file_size", 
      name: "Plus volumineux", 
      icon: File, 
      count: 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  // Filtres temporels
  const timeFilters = [
    { id: "all", name: "Toutes les périodes", icon: Calendar, count: documentsCount },
    { id: "today", name: "Aujourd'hui", icon: Clock, count: 0 },
    { id: "week", name: "Cette semaine", icon: Calendar, count: 0 },
    { id: "month", name: "Ce mois", icon: Calendar, count: 0 }
  ]


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
      id: string | number | null
      name: string
      icon: any
      count: number
      color?: string
      bgColor?: string
    }>
    isExpanded: boolean
    onToggle: () => void
    activeItem: string | number | null
    onItemClick: (id: string | number | null) => void
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
                key={item.id || 'all'}
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
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onUploadClick}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 group relative"
                title="Ajouter un document"
              >
                <Plus className="h-4 w-4" />
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                  Nouveau Document
                </div>
              </button>
            </div>
          </div>
          
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Options de tri */}
          <SidebarSection
            title="Trier par"
            items={filterItems}
            isExpanded={expandedSections.filters}
            onToggle={() => toggleSection('filters')}
            activeItem={activeSort}
            onItemClick={(id) => onSortChange?.(id as string)}
          />

          <Separator />

          {/* Filtres temporels */}
          <SidebarSection
            title="Période"
            items={timeFilters}
            isExpanded={expandedSections.time}
            onToggle={() => toggleSection('time')}
            activeItem={activeTimeFilter || 'all'}
            onItemClick={(id) => onTimeFilterChange?.(id as string)}
          />

          <Separator />


        </nav>
      </div>

    </aside>
  )
}
