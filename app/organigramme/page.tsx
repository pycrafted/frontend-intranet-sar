"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import ReactFlowOrganigramme, { ReactFlowOrganigrammeRef } from "@/components/react-flow-organigramme"
import { useState, useEffect, useCallback, useRef } from "react"
import { useOrgChart, Employee } from "@/hooks/useOrgChart"

interface OrganigrammePageProps {
  isMainSidebarCollapsed?: boolean
  selectedDepartment: string
  setSelectedDepartment: (department: string) => void
}

function OrganigrammePageContent({ 
  isMainSidebarCollapsed = false,
  selectedDepartment,
  setSelectedDepartment
}: OrganigrammePageProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  
  const { employees, departments, loading, error, searchEmployees } = useOrgChart()
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const reactFlowRef = useRef<ReactFlowOrganigrammeRef>(null)

  // Calculer la largeur du sidebar : 64px (rétracté) ou 256px (développé)
  const sidebarWidth = isMainSidebarCollapsed ? 64 : 256

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
    <>
      {/* Conteneur qui prend tout l'espace disponible, collé à tous les bords */}
      <div 
        className="fixed m-0 p-0 flex flex-col bg-gray-100"
        style={{
          top: '64px', // h-16 du navbar (4rem = 64px)
          bottom: '37px', // Hauteur du footer
          left: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : '0px',
          right: '0px',
          transition: 'left 0.3s ease-in-out'
        }}
      >
        {/* Organigramme React Flow */}
        <ReactFlowOrganigramme 
          ref={reactFlowRef}
          employees={filteredEmployees} 
          loading={loading} 
          error={error}
          onEmployeeSelect={handleEmployeeSelect}
        />
      </div>
    </>
  )
}

export default function OrganigrammePage() {
  const [selectedDepartment, setSelectedDepartment] = useState("Direction Générale")
  
  const { departments } = useOrgChart()
  const departmentOptions = departments.map(dept => dept.name)

  return (
    <LayoutWrapper
      secondaryNavbarProps={{
        selectedDepartment,
        onDepartmentChange: setSelectedDepartment,
        departmentOptions
      }}
    >
      <OrganigrammePageContent 
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
      />
    </LayoutWrapper>
  )
}
