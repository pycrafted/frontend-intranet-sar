"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import ReactFlowOrganigramme from "@/components/react-flow-organigramme"
import { useState, useEffect, useCallback } from "react"
import { useOrgChart, Employee } from "@/hooks/useOrgChart"

export default function OrganigrammePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [isTyping, setIsTyping] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  
  const { employees, departments, loading, error, searchEmployees } = useOrgChart()
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])

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
          console.log('✅ [ORGANIGRAMME_PAGE] Résultats de recherche:', { count: results.length })
          setFilteredEmployees(results)
        } catch (err) {
          console.error('❌ [ORGANIGRAMME_PAGE] Erreur lors de la recherche:', err)
          setFilteredEmployees(employees)
        }
      } else {
        console.log('📋 [ORGANIGRAMME_PAGE] Affichage de tous les employés:', { count: employees.length })
        setFilteredEmployees(employees)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, selectedDepartment, employees, searchEmployees])

  // Gestion de la recherche
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setIsTyping(value.length > 0)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
    }
  }

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
      <div className="min-h-screen" style={{ backgroundColor: '#e5e7eb' }}>
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-20 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
            <div>Loading: {loading ? 'true' : 'false'}</div>
            <div>Error: {error || 'none'}</div>
            <div>Employees: {employees?.length || 0}</div>
            <div>Filtered: {filteredEmployees?.length || 0}</div>
            <div>Departments: {departments?.length || 0}</div>
            <div>Dept Names: {departments?.map(d => d.name).join(', ') || 'none'}</div>
            <div>Selected: {selectedDepartment}</div>
          </div>
        )}
        
        {/* Organigramme React Flow */}
        <ReactFlowOrganigramme 
          employees={filteredEmployees} 
          loading={loading}
          error={error}
        />
      </div>
    </LayoutWrapper>
  )
}
