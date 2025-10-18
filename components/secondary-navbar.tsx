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
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-16 z-30">
      <div className="flex h-12 xs:h-14 sm:h-16 items-center justify-center px-2 xs:px-3 sm:px-4 lg:px-6">
        {/* Conteneur responsive avec recherche et filtre */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-2 xs:gap-3 sm:gap-4 w-full max-w-7xl">
          {/* Champ de recherche - responsive */}
          <div className="relative w-full xs:max-w-xs sm:max-w-md lg:max-w-xl">
            <Search className={`absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 transition-colors ${
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
              className={`w-full pl-7 xs:pl-8 sm:pl-10 pr-7 xs:pr-8 sm:pr-10 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm border-2 rounded-lg transition-all duration-200 ${
                searchFocused 
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-md' 
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-2 xs:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="h-2 w-2 xs:h-3 xs:w-3 text-gray-400" />
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
                  <span className="hidden xs:inline">En cours de recherche...</span>
                  <span className="xs:hidden">Recherche...</span>
                </div>
              </div>
            )}
          </div>

          {/* Filtres - conditionnels et responsive */}
          {showFilter && (
            <div className="flex items-center gap-2 xs:gap-3 w-full xs:w-auto">
              {/* Filtre par département - responsive */}
              <div className="flex items-center gap-1 xs:gap-2 flex-1 xs:flex-none">
                <Building className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0" />
                <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
                  <SelectTrigger className="w-full xs:w-32 sm:w-40 lg:w-48 h-8 xs:h-9 sm:h-10 lg:h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-xs xs:text-sm">
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept, index) => (
                      <SelectItem key={`${dept}-${index}`} value={dept} className="text-xs xs:text-sm">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par période - responsive */}
              <div className="flex items-center gap-1 xs:gap-2 flex-1 xs:flex-none">
                <Calendar className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0" />
                <Select value={selectedTimeFilter} onValueChange={onTimeFilterChange}>
                  <SelectTrigger className="w-full xs:w-32 sm:w-36 lg:w-40 h-8 xs:h-9 sm:h-10 lg:h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-xs xs:text-sm">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFilterOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id} className="text-xs xs:text-sm">
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
