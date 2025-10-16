"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import ReactFlowOrganigramme, { ReactFlowOrganigrammeRef } from "@/components/react-flow-organigramme"
import { useState, useEffect, useCallback, useRef } from "react"
import { useOrgChart, Employee } from "@/hooks/useOrgChart"

export default function OrganigrammePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [isTyping, setIsTyping] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  
  const { employees, departments, loading, error, searchEmployees } = useOrgChart()
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const reactFlowRef = useRef<ReactFlowOrganigrammeRef>(null)

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Effectuer la recherche et le filtrage - UN SEUL useEffect
  useEffect(() => {
    const performSearch = async () => {
      console.log('🔄 [ORGANIGRAMME_PAGE] performSearch appelé:', {
        debouncedSearchTerm,
        selectedDepartment,
        employeesCount: employees?.length || 0
      })
      
      if (!employees || employees.length === 0) {
        console.log('⏳ [ORGANIGRAMME_PAGE] Pas d\'employés chargés, attente...')
        return
      }
      
      if (debouncedSearchTerm || selectedDepartment !== "Tous") {
        try {
          console.log('🔍 [ORGANIGRAMME_PAGE] Recherche avec filtres:', { debouncedSearchTerm, selectedDepartment })
          const results = await searchEmployees(debouncedSearchTerm, selectedDepartment)
          console.log('✅ [ORGANIGRAMME_PAGE] Résultats de recherche:', { 
            count: results.length,
            results: results.map((emp: any) => ({ 
              id: emp.id, 
              name: emp.full_name, 
              department: emp.department_name,
              directions: emp.directions?.map((d: any) => d.name) || []
            }))
          })
          setFilteredEmployees(results)
        } catch (err) {
          console.error('❌ [ORGANIGRAMME_PAGE] Erreur lors de la recherche:', err)
          setFilteredEmployees(employees)
        }
      } else {
        console.log('📋 [ORGANIGRAMME_PAGE] Affichage de tous les employés:', { 
          count: employees.length,
          employees: employees.map((emp: any) => ({ 
            id: emp.id, 
            name: emp.full_name, 
            department: emp.department_name,
            directions: emp.directions?.map((d: any) => d.name) || []
          }))
        })
        setFilteredEmployees(employees)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, selectedDepartment, employees, searchEmployees])

  // Gestion de la recherche
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setIsTyping(value.length > 0)
    
    // Si on tape un nom d'employé, essayer de le sélectionner
    if (value.length > 2 && employees && reactFlowRef.current) {
      reactFlowRef.current.selectEmployeeByName(value)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
      
      // Rechercher et sélectionner l'employé
      if (searchTerm.length > 0 && employees && reactFlowRef.current) {
        reactFlowRef.current.selectEmployeeByName(searchTerm)
      }
    }
  }

  // Gestion de la sélection d'employé
  const handleEmployeeSelect = useCallback((employee: Employee) => {
    setSelectedEmployee(employee)
  }, [])

  // Options des départements
  const departmentOptions = ["Tous", ...departments.map(dept => dept.name)]

  return (
    <LayoutWrapper
      secondaryNavbarProps={{
        searchTerm,
        onSearchChange: handleSearchChange,
        onSearchKeyDown: handleSearchKeyDown,
        searchPlaceholder: "Rechercher un employé...",
        isTyping,
        selectedDepartment,
        onDepartmentChange: setSelectedDepartment,
        departmentOptions
      }}
    >
      <div className="min-h-screen bg-gray-100">
        {/* Organigramme React Flow */}
        <ReactFlowOrganigramme 
          ref={reactFlowRef}
          employees={filteredEmployees} 
          loading={loading} 
          error={error}
          onEmployeeSelect={handleEmployeeSelect}
        />
      </div>
    </LayoutWrapper>
  )
}
