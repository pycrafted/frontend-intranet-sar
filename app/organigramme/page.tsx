"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Building, Loader2 } from "lucide-react"
import InteractiveOrgChart from "@/components/interactive-orgchart"
import { useOrgChart, Employee, Department } from "@/hooks/useOrgChart"
import { StandardLoader } from "@/components/ui/standard-loader"

// Les données sont maintenant gérées par le hook useOrgChart

export default function OrganigrammePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isTyping, setIsTyping] = useState(false)

  console.log('🏢 [ORGANIGRAMME_PAGE] Initialisation - UTILISATION DU HOOK DÉDIÉ (pas de base de données)')

  // Utiliser le hook dédié à l'organigramme
  const { 
    employees, 
    departments, 
    loading, 
    error, 
    searchEmployees 
  } = useOrgChart()

  console.log('📊 [ORGANIGRAMME_PAGE] Données reçues du hook:', {
    source: 'ORGCHART_HOOK',
    employeesCount: employees?.length || 0,
    departmentsCount: departments?.length || 0,
    loading,
    error: error || 'Aucune erreur'
  })

  // Debounce pour la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Construire la liste des départements pour le filtre
  const departmentOptions = ["Tous", ...(departments.map(dept => dept.name) || [])]

  const handleSearch = async (term: string) => {
    console.log('🔍 [ORGANIGRAMME_PAGE] Recherche déclenchée:', {
      term,
      department: selectedDepartment,
      source: 'ORGCHART_HOOK'
    })
    setSearchTerm(term)
    if (term.trim()) {
      await searchEmployees(term, selectedDepartment !== "Tous" ? selectedDepartment : undefined)
    } else {
      setFilteredEmployees(employees || [])
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
    }
  }

  const handleDepartmentChange = async (department: string) => {
    console.log('🏢 [ORGANIGRAMME_PAGE] Changement de département:', {
      department,
      searchTerm,
      source: 'ORGCHART_HOOK'
    })
    setSelectedDepartment(department)
    if (searchTerm.trim()) {
      await searchEmployees(searchTerm, department !== "Tous" ? department : undefined)
    } else {
      setFilteredEmployees(employees || [])
    }
  }

  // Initialiser les employés filtrés
  useEffect(() => {
    if (employees && employees.length > 0) {
      setFilteredEmployees(employees)
    }
  }, [employees])

  // Gestion du loading et des erreurs
  if (loading || error) {
    return (
      <LayoutWrapper>
        <StandardLoader 
          title={loading ? "Chargement de l'organigramme..." : undefined}
          message={loading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
          error={error}
          showRetry={!!error}
          onRetry={() => window.location.reload()}
        />
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper 
      secondaryNavbarProps={{
        searchTerm,
        onSearchChange: handleSearch,
        onSearchKeyDown: handleSearchKeyDown,
        searchPlaceholder: "Rechercher par nom, poste ou département...",
        isTyping,
        selectedDepartment,
        onDepartmentChange: handleDepartmentChange,
        departmentOptions
      }}
    >
      <div className="min-h-screen" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="px-6 pt-6 space-y-6">
          {/* Interactive Organizational Chart - Full Width */}
          <div className="rounded-lg border shadow-sm overflow-hidden -mx-6" style={{ backgroundColor: '#e5e7eb', borderColor: '#d1d5db' }}>
            <div className="h-[calc(100vh-200px)] relative">
              <InteractiveOrgChart />
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
