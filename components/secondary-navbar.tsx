"use client"

import { Building, Calendar } from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"

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
  showTimeFilter?: boolean
  showDepartmentFilter?: boolean
  departmentFilterStatic?: boolean
  rightActions?: ReactNode
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
  showFilter = true,
  showTimeFilter = true,
  showDepartmentFilter = true,
  departmentFilterStatic = false,
  rightActions,
}: SecondaryNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  
  // Masquer le champ de recherche si les props ne sont pas fournies
  // Utiliser une vérification stricte pour éviter les problèmes d'hydratation
  const showSearch = Boolean(searchTerm !== undefined && onSearchChange !== undefined && searchPlaceholder)
  
  // Déterminer la couleur de fond selon la page
  const backgroundColor = pathname === "/securite" ? "#344257" : "white"
  const textColor = pathname === "/securite" ? "white" : "inherit"
  const borderColor = pathname === "/securite" ? "rgba(255, 255, 255, 0.1)" : "#e5e7eb"
  
  // Construire le message pour la page sécurité
  const buildSecurityMessage = () => {
    const steps: string[] = []
    let stepNumber = 1
    
    // Étape 1: Vidéos (combinaison des points 1 et 2)
    steps.push(`${stepNumber}) Visionnez les différentes vidéos de la page concernant la sécurité`)
    stepNumber++
    
    // Étape 2: PDF
    steps.push(`${stepNumber}) Lisez les PDF sur la sécurité et le règlement intérieur de la SAR`)
    stepNumber++
    
    // Étape 3: Quiz
    steps.push(`${stepNumber}) Répondez aux quiz`)
    stepNumber++
    
    // Étape 4: Recommandation
    steps.push(`${stepNumber}) Si vous n'avez pas un score parfait, veuillez recommencer pour vous améliorer`)
    
    return steps.join(" • ")
  }
  
  const securityMessage = pathname === "/securite" ? buildSecurityMessage() : ""
  // Dupliquer le message plusieurs fois pour un défilement fluide sans saccade
  const duplicatedSecurityMessage = pathname === "/securite" ? Array(5).fill(securityMessage).join(" • ") : ""

  // Gestion du changement de département avec vérification de connexion
  const handleDepartmentChange = (value: string) => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour accéder à l'organigramme des autres directions et services de la SAR")
      return
    }
    onDepartmentChange?.(value)
  }

  return (
    <header 
      className={`w-full border-b shadow-sm sticky top-12 xs:top-14 sm:top-16 z-30 ${
        pathname === "/securite" ? "border-t-2 border-t-white" : ""
      }`}
      style={{ 
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        color: textColor
      }}
    >
      <div className="flex h-12 xs:h-14 sm:h-16 items-center justify-center px-2 xs:px-3 sm:px-4 lg:px-6 relative overflow-hidden">
        {/* Message défilant pour la page sécurité */}
        {pathname === "/securite" && (
          <div className="absolute inset-0 flex items-center overflow-hidden">
            <div
              className="whitespace-nowrap flex items-center h-full security-marquee-left"
              style={{
                animationDuration: "90s",
                willChange: 'transform'
              }}
            >
              <span className="text-xs xs:text-sm sm:text-base font-semibold px-2 text-white">
                {duplicatedSecurityMessage}
              </span>
            </div>
          </div>
        )}
        
        {/* Conteneur 3 colonnes : [spacer gauche] [contenu centré] [actions droite] */}
        <div className={`flex flex-row items-center w-full max-w-7xl ${pathname === "/securite" ? "opacity-0 pointer-events-none" : ""}`}>

          {/* Colonne gauche — spacer flex-1 */}
          <div className="flex-1" />

          {/* Colonne centre — recherche + filtres */}
          <div className="flex flex-row items-center gap-2 xs:gap-3">
            {/* Champ de recherche */}
            {showSearch && (
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-48 xs:w-56 sm:w-72 md:w-80 lg:w-96 px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm border-2 rounded-lg transition-all duration-200 ${
                    searchFocused
                      ? pathname === "/securite"
                        ? 'border-blue-400 ring-2 ring-blue-900/30 bg-gray-700/50 shadow-md text-white placeholder-gray-400'
                        : 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-md'
                      : pathname === "/securite"
                        ? 'border-gray-500 hover:border-gray-400 bg-gray-700/30 text-white placeholder-gray-400'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                />
                {/* Indicateur de frappe */}
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
            )}

            {/* Filtre département */}
            {showFilter && showDepartmentFilter && (
              <div className="flex items-center gap-1 xs:gap-2">
                <Building className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                  pathname === "/securite"
                    ? isAuthenticated ? 'text-gray-300' : 'text-gray-600'
                    : isAuthenticated ? 'text-slate-500' : 'text-gray-300'
                }`} />
                {departmentFilterStatic ? (
                  <div className="w-32 sm:w-40 lg:w-48 h-8 xs:h-9 sm:h-10 lg:h-12 rounded-lg bg-white flex items-center justify-center text-xs xs:text-sm sm:text-base font-semibold select-none tracking-wide" style={{ border: "2px solid #344256", color: "#344256" }}>
                    {selectedDepartment}
                  </div>
                ) : (
                  <Select value={selectedDepartment} onValueChange={handleDepartmentChange} disabled={!isAuthenticated}>
                    <SelectTrigger className={`w-32 sm:w-40 lg:w-48 h-8 xs:h-9 sm:h-10 lg:h-12 border-2 text-xs xs:text-sm rounded-lg ${
                      pathname === "/securite"
                        ? isAuthenticated
                          ? 'border-gray-500 focus:border-blue-400 focus:ring-blue-400 cursor-pointer bg-gray-700/30 text-white'
                          : 'border-gray-600 bg-gray-800/30 cursor-not-allowed opacity-60 text-gray-400'
                        : isAuthenticated
                          ? 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}>
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
                )}
              </div>
            )}

            {/* Filtre période */}
            {showFilter && showTimeFilter && (
              <div className="flex items-center gap-1 xs:gap-2">
                <Calendar className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                  pathname === "/securite" ? 'text-gray-300' : 'text-slate-500'
                }`} />
                <Select value={selectedTimeFilter} onValueChange={onTimeFilterChange}>
                  <SelectTrigger className={`w-32 sm:w-36 lg:w-40 h-8 xs:h-9 sm:h-10 lg:h-12 text-xs xs:text-sm ${
                    pathname === "/securite"
                      ? 'border-gray-500 focus:border-blue-400 focus:ring-blue-400 bg-gray-700/30 text-white'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}>
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
            )}

            {/* Actions à côté de la recherche */}
            {rightActions && (
              <div className="flex items-center">
                {rightActions}
              </div>
            )}
          </div>

          {/* Colonne droite — spacer flex-1 */}
          <div className="flex-1" />
        </div>
      </div>
    </header>
  )
}
