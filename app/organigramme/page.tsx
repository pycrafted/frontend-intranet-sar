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
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])

  // Utiliser l'API
  const { 
    employees, 
    departments, 
    loading, 
    error, 
    searchEmployees 
  } = useEmployees()

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
    <LayoutWrapper>
      <div className="min-h-screen" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="px-6 pt-6 space-y-6">
          {/* Search and Filters */}
          <div className="rounded-lg border shadow-sm" style={{ backgroundColor: '#e5e7eb', borderColor: '#d1d5db' }}>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Rechercher par nom, poste ou département..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-slate-500" />
                  <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                    <SelectTrigger className="w-56 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Filtrer par département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((department, index) => (
                        <SelectItem key={`${department}-${index}`} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Organizational Chart - Full Width */}
          <div className="rounded-lg border shadow-sm overflow-hidden -mx-6" style={{ backgroundColor: '#e5e7eb', borderColor: '#d1d5db' }}>
            <div className="h-[calc(100vh-300px)] relative">
              <InteractiveOrgChart />
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
