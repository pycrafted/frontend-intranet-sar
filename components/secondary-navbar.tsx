"use client"

import { Search, X, Building, Calendar } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SecondaryNavbarProps {
  searchTerm?: string
  onSearchChange?: (search: string) => void
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  searchPlaceholder?: string
  isTyping?: boolean
  // Props pour le filtre département
  selectedDepartment?: string
  onDepartmentChange?: (department: string) => void
  departmentOptions?: string[]
  // Props pour le filtre période
  selectedTimeFilter?: string
  onTimeFilterChange?: (timeFilter: string) => void
  timeFilterOptions?: Array<{id: string, name: string}>
  showFilter?: boolean
}

export function SecondaryNavbar({ 
  searchTerm = "", 
  onSearchChange,
  onSearchKeyDown,
  searchPlaceholder = "Rechercher dans les actualités...",
  isTyping = false,
  selectedDepartment = "Tous",
  onDepartmentChange,
  departmentOptions = ["Tous"],
  selectedTimeFilter = "all",
  onTimeFilterChange,
  timeFilterOptions = [
    {id: "all", name: "Toutes les périodes"},
    {id: "today", name: "Aujourd'hui"},
    {id: "week", name: "Cette semaine"},
    {id: "month", name: "Ce mois"}
  ],
  showFilter = true
}: SecondaryNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-center px-4 lg:px-6">
        {/* Conteneur centré avec recherche et filtre */}
        <div className="flex items-center justify-center gap-4 w-full max-w-6xl">
          {/* Champ de recherche */}
          <div className="relative w-full max-w-xl">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
              searchFocused ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={onSearchKeyDown}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 ${
                searchFocused 
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-md' 
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
            
            {/* Indicateur de frappe */}
            {searchTerm && isTyping && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 text-xs text-gray-600 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span>En cours de recherche...</span>
                </div>
              </div>
            )}
          </div>

          {/* Filtres - conditionnels */}
          {showFilter && (
            <div className="flex items-center gap-3">
              {/* Filtre par période */}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <Select value={selectedTimeFilter} onValueChange={onTimeFilterChange}>
                  <SelectTrigger className="w-48 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFilterOptions.map((option, index) => (
                      <SelectItem key={`${option.id}-${index}`} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
