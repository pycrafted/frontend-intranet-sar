"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import ReactFlowOrganigramme, { ReactFlowOrganigrammeRef } from "@/components/react-flow-organigramme"
import { useState, useEffect, useCallback, useRef } from "react"
import { useOrgChart, Employee } from "@/hooks/useOrgChart"

export default function OrganigrammePage() {
  const [selectedDepartment, setSelectedDepartment] = useState("Direction Générale")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  
  const { employees, departments, loading, error, searchEmployees } = useOrgChart()
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const reactFlowRef = useRef<ReactFlowOrganigrammeRef>(null)

  // Effectuer le filtrage par département
  useEffect(() => {
    const performFilter = async () => {
      console.log('🔄 [ORGANIGRAMME_PAGE] performFilter appelé:', {
        selectedDepartment,
        employeesCount: employees?.length || 0
      })
      
      if (!employees || employees.length === 0) {
        console.log('⏳ [ORGANIGRAMME_PAGE] Pas d\'employés chargés, attente...')
        return
      }
      
      if (selectedDepartment) {
        try {
          console.log('🔍 [ORGANIGRAMME_PAGE] Filtrage par département:', { selectedDepartment })
          const results = await searchEmployees("", selectedDepartment)
          console.log('✅ [ORGANIGRAMME_PAGE] Résultats de filtrage:', { 
            count: results.length,
            results: results.map((emp: any) => ({ 
              id: emp.id, 
              name: emp.full_name, 
              department: emp.main_direction_name,
              directions: emp.directions?.map((d: any) => d.name) || []
            }))
          })
          setFilteredEmployees(results)
        } catch (err) {
          console.error('❌ [ORGANIGRAMME_PAGE] Erreur lors du filtrage:', err)
          setFilteredEmployees(employees)
        }
      } else {
        console.log('📋 [ORGANIGRAMME_PAGE] Affichage de tous les employés:', { 
          count: employees.length,
          employees: employees.map((emp: any) => ({ 
            id: emp.id, 
            name: emp.full_name, 
            department: emp.main_direction_name,
            directions: emp.directions?.map((d: any) => d.name) || []
          }))
        })
        setFilteredEmployees(employees)
      }
    }

    performFilter()
  }, [selectedDepartment, employees, searchEmployees])

  // Gestion de la sélection d'employé
  const handleEmployeeSelect = useCallback((employee: Employee) => {
    setSelectedEmployee(employee)
  }, [])

  // Options des départements (sans "Tous")
  const departmentOptions = departments.map(dept => dept.name)

  return (
    <LayoutWrapper
      secondaryNavbarProps={{
        selectedDepartment,
        onDepartmentChange: setSelectedDepartment,
        departmentOptions
      }}
    >
      <div className="h-[calc(100vh-12rem)] xs:h-[calc(100vh-14rem)] sm:h-[calc(100vh-16rem)] bg-gray-100 overflow-auto">
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
