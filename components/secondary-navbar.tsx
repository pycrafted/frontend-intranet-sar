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
      <div className="flex h-16 items-center justify-center px-2 sm:px-4 lg:px-6">
        {/* Conteneur responsive avec recherche et filtre */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full max-w-6xl">
          {/* Champ de recherche - responsive */}
          <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-xl">
            <Search className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 transition-colors ${
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
              className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-xs sm:text-sm border-2 rounded-lg transition-all duration-200 ${
                searchFocused 
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-md' 
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="h-2 w-2 sm:h-3 sm:w-3 text-gray-400" />
              </button>
            )}
            
            {/* Indicateur de frappe - responsive */}
            {searchTerm && isTyping && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 text-xs text-gray-600 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="hidden sm:inline">En cours de recherche...</span>
                  <span className="sm:hidden">Recherche...</span>
                </div>
              </div>
            )}
          </div>

          {/* Filtres - conditionnels et responsive */}
          {showFilter && (
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Filtre par département - responsive */}
              <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0" />
                <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
                  <SelectTrigger className="w-full sm:w-40 lg:w-48 h-10 sm:h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm">
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept, index) => (
                      <SelectItem key={`${dept}-${index}`} value={dept} className="text-xs sm:text-sm">
                        {dept}
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
