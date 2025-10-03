"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  Calendar,
  Building2
} from "lucide-react"

interface RecrutementSidebarProps {
  onFilterChange?: (filters: {
    department: string
    type: string
    urgency: string
    experience: string
  }) => void
  onSearchChange?: (search: string) => void
  searchTerm?: string
  activeFilters?: {
    department: string
    type: string
    urgency: string
    experience: string
  }
}

export function RecrutementSidebar({ 
  onFilterChange,
  onSearchChange,
  searchTerm = "",
  activeFilters = {
    department: "all",
    type: "all", 
    urgency: "all",
    experience: "all"
  }
}: RecrutementSidebarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [localFilters, setLocalFilters] = useState(activeFilters)

  const departments = [
    { value: "all", label: "Tous les départements" },
    { value: "Direction Informatique", label: "Direction Informatique" },
    { value: "Direction Marketing & Communication", label: "Marketing & Communication" },
    { value: "Direction Technique", label: "Direction Technique" },
    { value: "Direction des Ressources Humaines", label: "Ressources Humaines" },
    { value: "Direction Financière", label: "Direction Financière" },
    { value: "Direction Commerciale", label: "Direction Commerciale" },
    { value: "Direction Logistique", label: "Direction Logistique" }
  ]

  const jobTypes = [
    { value: "all", label: "Tous les types" },
    { value: "CDI", label: "CDI" },
    { value: "CDD", label: "CDD" },
    { value: "Stage", label: "Stage" },
    { value: "Freelance", label: "Freelance" }
  ]

  const urgencyLevels = [
    { value: "all", label: "Tous les niveaux" },
    { value: "très urgent", label: "Très urgent", color: "text-red-600" },
    { value: "urgent", label: "Urgent", color: "text-orange-600" },
    { value: "normal", label: "Normal", color: "text-green-600" }
  ]

  const experienceLevels = [
    { value: "all", label: "Tous les niveaux" },
    { value: "0-2", label: "0-2 ans" },
    { value: "3-5", label: "3-5 ans" },
    { value: "6-10", label: "6-10 ans" },
    { value: "10+", label: "10+ ans" }
  ]

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value)
    onSearchChange?.(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      department: "all",
      type: "all",
      urgency: "all",
      experience: "all"
    }
    setLocalFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(filter => filter !== "all")

  return (
    <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:left-64 lg:top-32 lg:bottom-0 lg:z-30 border-r border-gray-200 shadow-sm bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filtres de Recherche</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Mots-clés..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Department Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Département
              </label>
              {localFilters.department !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {departments.find(d => d.value === localFilters.department)?.label}
                </Badge>
              )}
            </div>
            <select
              value={localFilters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Type de contrat
              </label>
              {localFilters.type !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {jobTypes.find(t => t.value === localFilters.type)?.label}
                </Badge>
              )}
            </div>
            <select
              value={localFilters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {jobTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Urgence
              </label>
              {localFilters.urgency !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {urgencyLevels.find(u => u.value === localFilters.urgency)?.label}
                </Badge>
              )}
            </div>
            <select
              value={localFilters.urgency}
              onChange={(e) => handleFilterChange("urgency", e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {urgencyLevels.map(urgency => (
                <option key={urgency.value} value={urgency.value}>
                  {urgency.label}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Expérience
              </label>
              {localFilters.experience !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {experienceLevels.find(e => e.value === localFilters.experience)?.label}
                </Badge>
              )}
            </div>
            <select
              value={localFilters.experience}
              onChange={(e) => handleFilterChange("experience", e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {experienceLevels.map(exp => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Effacer tous les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Statistiques</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-blue-600">12</div>
                <div className="text-gray-500">Postes ouverts</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-green-600">8</div>
                <div className="text-gray-500">Candidatures</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              <Calendar className="h-3 w-3 inline mr-1" />
              Dernière mise à jour: Aujourd'hui
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}


