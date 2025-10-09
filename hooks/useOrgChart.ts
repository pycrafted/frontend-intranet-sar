import { useState, useEffect } from 'react'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  full_name: string
  initials: string
  email: string
  phone: string | null
  employee_id: string | null
  position: number
  position_title: string
  department_name: string
  manager: number | null
  manager_name: string | null
  hierarchy_level: number
  is_manager: boolean
  is_active: boolean
  avatar: string | null
  office_location: string | null
  work_schedule: string
  hire_date: string
  created_at: string
  updated_at: string
  children?: Employee[]
}

export interface Department {
  id: number
  name: string
  employee_count: number
  created_at: string
  updated_at: string
}

export interface OrgChartData {
  [level: string]: Array<{
    id: number
    name: string
    role: string
    department: string
    email: string
    phone: string
    location: string | null
    avatar: string | null
    initials: string
    level: number
    parentId: number | null
    children: any[]
  }>
}

// Données statiques pour l'organigramme - NOMS AMÉRICAINS POUR TEST
const staticEmployees: Employee[] = [
  {
    id: 1,
    first_name: "John",
    last_name: "Smith",
    full_name: "John Smith",
    initials: "JS",
    email: "john.smith@company.com",
    phone: "+1 555 123 4567",
    employee_id: "EMP001",
    position: 1,
    position_title: "Chief Executive Officer",
    department_name: "Executive",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2020-01-01",
    avatar: "/placeholder-user.jpg",
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  },
  {
    id: 2,
    first_name: "Sarah",
    last_name: "Johnson",
    full_name: "Sarah Johnson",
    initials: "SJ",
    email: "sarah.johnson@company.com",
    phone: "+1 555 234 5678",
    employee_id: "EMP002",
    position: 2,
    position_title: "Chief Operating Officer",
    department_name: "Operations",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    is_manager: true,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2020-06-01",
    avatar: "/placeholder-user.jpg",
    created_at: "2020-06-01T00:00:00Z",
    updated_at: "2020-06-01T00:00:00Z",
  },
  {
    id: 3,
    first_name: "Michael",
    last_name: "Brown",
    full_name: "Michael Brown",
    initials: "MB",
    email: "michael.brown@company.com",
    phone: "+1 555 345 6789",
    employee_id: "EMP003",
    position: 3,
    position_title: "Chief Marketing Officer",
    department_name: "Marketing",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    is_manager: true,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2020-03-15",
    avatar: "/placeholder-user.jpg",
    created_at: "2020-03-15T00:00:00Z",
    updated_at: "2020-03-15T00:00:00Z",
  },
  {
    id: 4,
    first_name: "Emily",
    last_name: "Davis",
    full_name: "Emily Davis",
    initials: "ED",
    email: "emily.davis@company.com",
    phone: "+1 555 456 7890",
    employee_id: "EMP004",
    position: 4,
    position_title: "Chief Human Resources Officer",
    department_name: "Human Resources",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    is_manager: true,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2020-02-01",
    avatar: "/placeholder-user.jpg",
    created_at: "2020-02-01T00:00:00Z",
    updated_at: "2020-02-01T00:00:00Z",
  },
  {
    id: 5,
    first_name: "David",
    last_name: "Wilson",
    full_name: "David Wilson",
    initials: "DW",
    email: "david.wilson@company.com",
    phone: "+1 555 567 8901",
    employee_id: "EMP005",
    position: 5,
    position_title: "Chief Technology Officer",
    department_name: "Technology",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    is_manager: true,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2020-04-01",
    avatar: "/placeholder-user.jpg",
    created_at: "2020-04-01T00:00:00Z",
    updated_at: "2020-04-01T00:00:00Z",
  },
  {
    id: 6,
    first_name: "Jessica",
    last_name: "Miller",
    full_name: "Jessica Miller",
    initials: "JM",
    email: "jessica.miller@company.com",
    phone: "+1 555 678 9012",
    employee_id: "EMP006",
    position: 6,
    position_title: "Chief Financial Officer",
    department_name: "Finance",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    is_manager: true,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2020-05-01",
    avatar: "/placeholder-user.jpg",
    created_at: "2020-05-01T00:00:00Z",
    updated_at: "2020-05-01T00:00:00Z",
  },
  {
    id: 7,
    first_name: "Robert",
    last_name: "Garcia",
    full_name: "Robert Garcia",
    initials: "RG",
    email: "robert.garcia@company.com",
    phone: "+1 555 789 0123",
    employee_id: "EMP007",
    position: 7,
    position_title: "Quality Assurance Manager",
    department_name: "Quality Assurance",
    manager: 4,
    manager_name: "Emily Davis",
    hierarchy_level: 3,
    is_manager: false,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2021-03-15",
    avatar: "/placeholder-user.jpg",
    created_at: "2021-03-15T00:00:00Z",
    updated_at: "2021-03-15T00:00:00Z",
  },
  {
    id: 8,
    first_name: "Jennifer",
    last_name: "Martinez",
    full_name: "Jennifer Martinez",
    initials: "JM",
    email: "jennifer.martinez@company.com",
    phone: "+1 555 890 1234",
    employee_id: "EMP008",
    position: 8,
    position_title: "Project Manager",
    department_name: "Technology",
    manager: 5,
    manager_name: "David Wilson",
    hierarchy_level: 3,
    is_manager: false,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2021-06-01",
    avatar: "/placeholder-user.jpg",
    created_at: "2021-06-01T00:00:00Z",
    updated_at: "2021-06-01T00:00:00Z",
  },
  {
    id: 9,
    first_name: "Christopher",
    last_name: "Anderson",
    full_name: "Christopher Anderson",
    initials: "CA",
    email: "christopher.anderson@company.com",
    phone: "+1 555 901 2345",
    employee_id: "EMP009",
    position: 9,
    position_title: "Financial Analyst",
    department_name: "Finance",
    manager: 6,
    manager_name: "Jessica Miller",
    hierarchy_level: 3,
    is_manager: false,
    office_location: "New York - Headquarters",
    work_schedule: "Full-time",
    is_active: true,
    hire_date: "2022-01-10",
    avatar: "/placeholder-user.jpg",
    created_at: "2022-01-10T00:00:00Z",
    updated_at: "2022-01-10T00:00:00Z",
  }
]

const staticDepartments: Department[] = [
  {
    id: 1,
    name: "Executive",
    employee_count: 1,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "Operations",
    employee_count: 1,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z"
  },
  {
    id: 3,
    name: "Marketing",
    employee_count: 1,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z"
  },
  {
    id: 4,
    name: "Human Resources",
    employee_count: 2,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z"
  },
  {
    id: 5,
    name: "Technology",
    employee_count: 2,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z"
  },
  {
    id: 6,
    name: "Finance",
    employee_count: 2,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z"
  },
  {
    id: 7,
    name: "Quality Assurance",
    employee_count: 1,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z"
  }
]

export const useOrgChart = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [orgChartData, setOrgChartData] = useState<OrgChartData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simuler le chargement des données
  const fetchEmployees = async () => {
    try {
      console.log('🏢 [ORGCHART_HOOK] fetchEmployees - UTILISATION DE DONNÉES STATIQUES (pas de base de données)')
      setLoading(true)
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('📊 [ORGCHART_HOOK] Données employés chargées:', {
        source: 'STATIC_DATA',
        count: staticEmployees.length,
        employees: staticEmployees.map(emp => ({ id: emp.id, name: emp.full_name, department: emp.department_name }))
      })
      setEmployees(staticEmployees)
    } catch (err) {
      console.error('❌ [ORGCHART_HOOK] Erreur fetchEmployees:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      console.log('🏢 [ORGCHART_HOOK] fetchDepartments - UTILISATION DE DONNÉES STATIQUES (pas de base de données)')
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('📊 [ORGCHART_HOOK] Données départements chargées:', {
        source: 'STATIC_DATA',
        count: staticDepartments.length,
        departments: staticDepartments.map(dept => ({ id: dept.id, name: dept.name, employee_count: dept.employee_count }))
      })
      setDepartments(staticDepartments)
    } catch (err) {
      console.error('❌ [ORGCHART_HOOK] Erreur fetchDepartments:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const fetchOrgChartData = async () => {
    try {
      console.log('🏢 [ORGCHART_HOOK] fetchOrgChartData - UTILISATION DE DONNÉES STATIQUES (pas de base de données)')
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 200))
      // Construire les données d'organigramme à partir des employés statiques
      const chartData: OrgChartData = {}
      
      staticEmployees.forEach(employee => {
        const level = employee.hierarchy_level.toString()
        if (!chartData[level]) {
          chartData[level] = []
        }
        
        chartData[level].push({
          id: employee.id,
          name: employee.full_name,
          role: employee.position_title,
          department: employee.department_name,
          email: employee.email,
          phone: employee.phone || '',
          location: employee.office_location,
          avatar: employee.avatar,
          initials: employee.initials,
          level: employee.hierarchy_level,
          parentId: employee.manager,
          children: []
        })
      })
      
      console.log('📊 [ORGCHART_HOOK] Données organigramme construites:', {
        source: 'STATIC_DATA',
        levels: Object.keys(chartData).length,
        totalNodes: Object.values(chartData).flat().length,
        hierarchy: Object.entries(chartData).map(([level, nodes]) => ({
          level: parseInt(level),
          count: nodes.length,
          employees: nodes.map(n => n.name)
        }))
      })
      
      setOrgChartData(chartData)
    } catch (err) {
      console.error('❌ [ORGCHART_HOOK] Erreur fetchOrgChartData:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const searchEmployees = async (query: string, department?: string) => {
    try {
      console.log('🔍 [ORGCHART_HOOK] searchEmployees - RECHERCHE DANS DONNÉES STATIQUES (pas de base de données)', {
        query,
        department,
        source: 'STATIC_DATA'
      })
      setLoading(true)
      // Simuler un délai de recherche
      await new Promise(resolve => setTimeout(resolve, 300))
      
      let filteredEmployees = staticEmployees
      
      // Filtrer par terme de recherche
      if (query.trim()) {
        const searchTerm = query.toLowerCase()
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.full_name.toLowerCase().includes(searchTerm) ||
          employee.position_title.toLowerCase().includes(searchTerm) ||
          employee.department_name.toLowerCase().includes(searchTerm) ||
          employee.email.toLowerCase().includes(searchTerm)
        )
      }
      
      // Filtrer par département
      if (department && department !== 'Tous') {
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.department_name === department
        )
      }
      
      console.log('📊 [ORGCHART_HOOK] Résultats de recherche:', {
        source: 'STATIC_DATA',
        originalCount: staticEmployees.length,
        filteredCount: filteredEmployees.length,
        results: filteredEmployees.map(emp => ({ id: emp.id, name: emp.full_name, department: emp.department_name }))
      })
      
      setEmployees(filteredEmployees)
    } catch (err) {
      console.error('❌ [ORGCHART_HOOK] Erreur searchEmployees:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeById = async (id: number) => {
    try {
      // Simuler un délai de recherche
      await new Promise(resolve => setTimeout(resolve, 200))
      return staticEmployees.find(emp => emp.id === id) || null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  const getEmployeeSubordinates = async (id: number) => {
    try {
      // Simuler un délai de recherche
      await new Promise(resolve => setTimeout(resolve, 200))
      return staticEmployees.filter(emp => emp.manager === id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return []
    }
  }

  const getDepartmentStatistics = async () => {
    try {
      // Simuler un délai de calcul
      await new Promise(resolve => setTimeout(resolve, 200))
      return staticDepartments.map(dept => ({
        ...dept,
        employee_count: staticEmployees.filter(emp => emp.department_name === dept.name).length
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return []
    }
  }

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 [ORGCHART_HOOK] Initialisation - CHARGEMENT DE DONNÉES STATIQUES (pas de base de données)')
      await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
        fetchOrgChartData()
      ])
      console.log('✅ [ORGCHART_HOOK] Initialisation terminée - TOUTES LES DONNÉES PROVIENNENT DE DONNÉES STATIQUES')
    }
    loadData()
  }, [])

  return {
    employees,
    departments,
    orgChartData,
    loading,
    error,
    searchEmployees,
    getEmployeeById,
    getEmployeeSubordinates,
    getDepartmentStatistics,
    refetch: fetchEmployees
  }
}
