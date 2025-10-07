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
import { useEmployees, Employee, Department } from "@/hooks/useEmployees"
import { StandardLoader } from "@/components/ui/standard-loader"

// Données statiques de fallback
const fallbackEmployees: Employee[] = [
  {
    id: 1,
    first_name: "Amadou",
    last_name: "Diallo",
    full_name: "Amadou Diallo",
    initials: "AD",
    email: "amadou.diallo@sar.sn",
    phone: "+221 33 123 4567",
    employee_id: "SAR001",
    position: 1,
    position_title: "Directeur Général",
    department_name: "Direction",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    is_active: true,
    hire_date: "2020-01-01",
    avatar: "/placeholder.svg?height=100&width=100&text=AD",
  }
]

const fallbackDepartments = ["Tous"]

export default function OrganigrammePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Utiliser l'API
  const { 
    employees, 
    departments, 
    loading, 
    error, 
    searchEmployees 
  } = useEmployees()

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
  const departmentOptions = ["Tous", ...(departments.map(dept => dept.name) || ["Direction", "Direction EXECUTIVE - SUPPORT"])]

  const handleSearch = async (term: string) => {
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
    } else {
      // Fallback avec des données de démonstration
      setFilteredEmployees([
        {
          id: 1,
          first_name: "Amadou",
          last_name: "Diallo",
          full_name: "Amadou Diallo",
          initials: "AD",
          email: "amadou.diallo@sar.sn",
          phone: "+221 33 123 4567",
          employee_id: "SAR001",
          position: 1,
          position_title: "Directeur Général",
          department_name: "Direction",
          manager: null,
          manager_name: null,
          hierarchy_level: 1,
          is_manager: true,
          office_location: "Dakar - Siège",
          work_schedule: "Temps plein",
          is_active: true,
          hire_date: "2020-01-01",
          avatar: "/media/avatars/directeur-general--2048x1657.jpg",
        },
        {
          id: 2,
          first_name: "Souleymane",
          last_name: "SECK",
          full_name: "Souleymane SECK",
          initials: "SS",
          email: "souleymaneseck@sar.sn",
          phone: "771459313",
          employee_id: "SAR002",
          position: 2,
          position_title: "Directeur EXECUTIVE - SUPPORT",
          department_name: "Direction EXECUTIVE - SUPPORT",
          manager: 1,
          manager_name: "Amadou Diallo",
          hierarchy_level: 2,
          is_manager: true,
          office_location: "Dakar - Siège",
          work_schedule: "Temps plein",
          is_active: true,
          hire_date: "2020-06-01",
          avatar: "/media/avatars/1716138550515.jpeg",
        }
      ])
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
