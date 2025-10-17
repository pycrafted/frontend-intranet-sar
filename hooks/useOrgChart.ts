import { useState, useEffect, useCallback } from 'react'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  full_name: string
  initials: string
  email: string
  phone_fixed: string | null
  phone_mobile: string | null
  matricule: string
  job_title: string
  main_direction_name: string
  manager: number | null
  manager_name: string | null
  hierarchy_level: number
  avatar: string | null
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
    job_title: "Chief Executive Officer",
    main_direction_name: "Executive",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    work_schedule: "Full-time",
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
    job_title: "Chief Operating Officer",
    main_direction_name: "Operations",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    work_schedule: "Full-time",
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
    job_title: "Chief Marketing Officer",
    main_direction_name: "Marketing",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    work_schedule: "Full-time",
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
    job_title: "Chief Human Resources Officer",
    main_direction_name: "Human Resources",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    work_schedule: "Full-time",
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
    job_title: "Chief Technology Officer",
    main_direction_name: "Technology",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    work_schedule: "Full-time",
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
    job_title: "Chief Financial Officer",
    main_direction_name: "Finance",
    manager: 1,
    manager_name: "John Smith",
    hierarchy_level: 2,
    work_schedule: "Full-time",
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
    job_title: "Quality Assurance Manager",
    main_direction_name: "Quality Assurance",
    manager: 4,
    manager_name: "Emily Davis",
    hierarchy_level: 3,
    work_schedule: "Full-time",
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
    job_title: "Project Manager",
    main_direction_name: "Technology",
    manager: 5,
    manager_name: "David Wilson",
    hierarchy_level: 3,
    work_schedule: "Full-time",
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
    job_title: "Financial Analyst",
    main_direction_name: "Finance",
    manager: 6,
    manager_name: "Jessica Miller",
    hierarchy_level: 3,
    work_schedule: "Full-time",
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

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/organigramme`

export const useOrgChart = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [orgChartData, setOrgChartData] = useState<OrgChartData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les données depuis l'API
  const fetchEmployees = async () => {
    try {
      console.log('🏢 [ORGCHART_HOOK] fetchEmployees - UTILISATION DE L API ORGANIGRAMME', {
        url: `${API_BASE_URL}/agents/`,
        environment: process.env.NODE_ENV,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      })
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/agents/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit' // Pas d'authentification requise
      })
      
      console.log('🌐 [ORGCHART_HOOK] Réponse API employés:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [ORGCHART_HOOK] Erreur API employés:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        })
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const employeesData = Array.isArray(data) ? data : data.results || []
      
      console.log('📊 [ORGCHART_HOOK] Données employés chargées:', {
        source: 'API_ORGANIGRAMME',
        count: employeesData.length,
        isArray: Array.isArray(data),
        hasResults: data.results ? true : false,
        employees: employeesData.map((emp: any) => ({ 
          id: emp.id, 
          name: emp.full_name, 
          department: emp.main_direction_name || emp.department_name,
          job_title: emp.job_title
        }))
      })
      
      // Si aucune donnée de l'API, utiliser les données statiques
      if (employeesData.length === 0) {
        console.log('🔄 [ORGCHART_HOOK] Aucune donnée de l\'API, utilisation des données statiques')
        setEmployees(staticEmployees)
      } else {
        setEmployees(employeesData)
      }
    } catch (err) {
      console.error('❌ [ORGCHART_HOOK] Erreur fetchEmployees:', {
        error: err,
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Fallback sur les données statiques en cas d'erreur
      console.log('🔄 [ORGCHART_HOOK] Fallback sur les données statiques')
      setEmployees(staticEmployees)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      console.log('🏢 [ORGCHART_HOOK] fetchDepartments - UTILISATION DE L API ORGANIGRAMME', {
        url: `${API_BASE_URL}/directions/`,
        environment: process.env.NODE_ENV
      })
      
      const response = await fetch(`${API_BASE_URL}/directions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit' // Pas d'authentification requise
      })
      
      console.log('🌐 [ORGCHART_HOOK] Réponse API départements:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [ORGCHART_HOOK] Erreur API départements:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        })
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      // L'API retourne les données dans un format paginé avec 'results'
      const departmentsData = data.results || data
      // Convertir les directions en format attendu
      const departmentsList = Array.isArray(departmentsData) ? departmentsData.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        employee_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) : []
      
      console.log('📊 [ORGCHART_HOOK] Données départements chargées:', {
        source: 'API_ORGANIGRAMME',
        count: departmentsList.length,
        isArray: Array.isArray(departmentsData),
        hasResults: data.results ? true : false,
        departments: departmentsList.map(dept => ({ id: dept.id, name: dept.name, employee_count: dept.employee_count }))
      })
      
      // Si aucune donnée de l'API, utiliser les données statiques
      if (departmentsList.length === 0) {
        console.log('🔄 [ORGCHART_HOOK] Aucune donnée de l\'API pour départements, utilisation des données statiques')
        setDepartments(staticDepartments)
      } else {
        setDepartments(departmentsList)
      }
    } catch (err) {
      console.error('❌ [ORGCHART_HOOK] Erreur fetchDepartments:', {
        error: err,
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Fallback sur les données statiques en cas d'erreur
      console.log('🔄 [ORGCHART_HOOK] Fallback sur les données statiques pour départements')
      setDepartments(staticDepartments)
    }
  }

  const fetchOrgChartData = async () => {
    try {
      console.log('🏢 [ORGCHART_HOOK] fetchOrgChartData - UTILISATION DE L API ORGANIGRAMME', {
        url: `${API_BASE_URL}/tree/`,
        environment: process.env.NODE_ENV
      })
      
      const response = await fetch(`${API_BASE_URL}/tree/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit' // Pas d'authentification requise
      })
      
      console.log('🌐 [ORGCHART_HOOK] Réponse API organigramme:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [ORGCHART_HOOK] Erreur API organigramme:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        })
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Construire les données d'organigramme à partir de l'API
      const chartData: OrgChartData = {}
      
      const buildChartData = (employee: any, level: number = 1) => {
        const levelKey = level.toString()
        if (!chartData[levelKey]) {
          chartData[levelKey] = []
        }
        
        chartData[levelKey].push({
          id: employee.id,
          name: employee.full_name,
          role: employee.job_title,
          department: employee.main_direction_name,
          email: employee.email,
          phone: employee.phone || '',
          location: employee.office_location,
          avatar: employee.avatar,
          initials: employee.initials,
          level: level,
          parentId: employee.manager,
          children: []
        })
        
        // Traiter les subordonnés récursivement
        if (employee.subordinates && employee.subordinates.length > 0) {
          employee.subordinates.forEach((sub: any) => buildChartData(sub, level + 1))
        }
      }
      
      buildChartData(data)
      
      console.log('📊 [ORGCHART_HOOK] Données organigramme construites:', {
        source: 'API_ORGANIGRAMME',
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
      // Fallback sur les données statiques en cas d'erreur
      const chartData: OrgChartData = {}
      staticEmployees.forEach(employee => {
        const level = employee.hierarchy_level.toString()
        if (!chartData[level]) {
          chartData[level] = []
        }
        chartData[level].push({
          id: employee.id,
          name: employee.full_name,
          role: employee.job_title,
          department: employee.main_direction_name,
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
      setOrgChartData(chartData)
    }
  }

  const searchEmployees = useCallback(async (query: string, department?: string) => {
    try {
      console.log('🔍 [ORGCHART_HOOK] searchEmployees - RECHERCHE VIA API ORGANIGRAMME', {
        query,
        department,
        source: 'API_ORGANIGRAMME'
      })
      setLoading(true)
      
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (department && department !== 'Tous') {
        // Utiliser directement le nom du département
        params.append('direction', department)
      }
      
      const response = await fetch(`${API_BASE_URL}/agents/search/?${params}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche')
      const data = await response.json()
      
      console.log('🔍 [ORGCHART_HOOK] Résultats de recherche:', {
        source: 'API_ORGANIGRAMME',
        query,
        department,
        resultsCount: data.length,
        results: data.map((emp: any) => ({ 
          id: emp.id, 
          name: emp.full_name, 
          department: emp.main_direction_name,
          directions: emp.directions?.map((d: any) => d.name) || []
        }))
      })
      
      const results = Array.isArray(data) ? data : data.results || []
      return results
    } catch (err) {
      console.error('❌ [ORGCHART_HOOK] Erreur searchEmployees:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Fallback sur les données statiques en cas d'erreur
      let filteredEmployees = staticEmployees
      
      // Filtrer par terme de recherche
      if (query.trim()) {
        const searchTerm = query.toLowerCase()
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.full_name.toLowerCase().includes(searchTerm) ||
          employee.job_title.toLowerCase().includes(searchTerm) ||
          employee.main_direction_name.toLowerCase().includes(searchTerm) ||
          employee.email.toLowerCase().includes(searchTerm)
        )
      }
      
      // Filtrer par département
      if (department && department !== 'Tous') {
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.main_direction_name === department
        )
      }
      
      console.log('📊 [ORGCHART_HOOK] Résultats de recherche (fallback):', {
        source: 'STATIC_DATA',
        originalCount: staticEmployees.length,
        filteredCount: filteredEmployees.length,
        results: filteredEmployees.map(emp => ({ id: emp.id, name: emp.full_name, department: emp.main_direction_name }))
      })
      
      return filteredEmployees
    } finally {
      setLoading(false)
    }
  }, [departments])

  const getEmployeeById = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}/`)
      if (!response.ok) throw new Error('Employé non trouvé')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Fallback sur les données statiques
      return staticEmployees.find(emp => emp.id === id) || null
    }
  }

  const getEmployeeSubordinates = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}/subordinates/`)
      if (!response.ok) throw new Error('Erreur lors du chargement des subordonnés')
      const data = await response.json()
      return data.results || data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Fallback sur les données statiques
      return staticEmployees.filter(emp => emp.manager === id)
    }
  }

  const getDepartmentStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/directions/`)
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
      const data = await response.json()
      return data.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        employee_count: 0, // À calculer côté backend si nécessaire
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Fallback sur les données statiques
      return staticDepartments.map(dept => ({
        ...dept,
        employee_count: staticEmployees.filter(emp => emp.main_direction_name === dept.name).length
      }))
    }
  }

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 [ORGCHART_HOOK] Initialisation - CHARGEMENT VIA API ORGANIGRAMME')
      await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
        fetchOrgChartData()
      ])
      console.log('✅ [ORGCHART_HOOK] Initialisation terminée - DONNÉES CHARGÉES VIA API ORGANIGRAMME')
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
