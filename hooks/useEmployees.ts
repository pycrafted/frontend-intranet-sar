import { useState, useEffect } from 'react'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  full_name: string
  initials: string
  email: string
  phone_fixed: string | null  // Téléphone fixe
  phone_mobile: string | null  // Téléphone mobile
  employee_id: string | null
  matricule: string | null  // Ajout du champ matricule (alias de employee_id)
  position: number  // ID de la position
  position_title: string
  department_name: string
  manager: number | null
  manager_name: string | null
  hierarchy_level: number
  is_manager: boolean
  is_active: boolean
  avatar: string | null  // URL complète de l'avatar
  office_location: string | null
  work_schedule: string
  hire_date: string
  created_at: string
  updated_at: string
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
    phone_fixed: string | null
    phone_mobile: string | null
    location: string | null
    avatar: string | null
    initials: string
    level: number
    parentId: number | null
    children: any[]
  }>
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/organigramme`

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [orgChartData, setOrgChartData] = useState<OrgChartData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      // Utiliser l'endpoint organigramme pour les employés
      const response = await fetch(`${API_BASE_URL}/agents/`)
      if (!response.ok) throw new Error('Erreur lors du chargement des employés')
      const data = await response.json()
      setEmployees(data.results || data) // Gérer la pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      // Utiliser l'endpoint organigramme pour les directions
      const response = await fetch(`${API_BASE_URL}/directions/`)
      if (!response.ok) throw new Error('Erreur lors du chargement des départements')
      const data = await response.json()
      // Convertir les directions en format attendu
      const departmentsList = data.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        description: null,
        location: null,
        employee_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      setDepartments(departmentsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const fetchOrgChartData = async () => {
    try {
      // Utiliser l'endpoint organigramme pour l'arborescence
      const response = await fetch(`${API_BASE_URL}/tree/`)
      if (!response.ok) throw new Error('Erreur lors du chargement de l\'organigramme')
      const data = await response.json()
      setOrgChartData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const searchEmployees = async (query: string, department?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      
      // Trouver l'ID du département par son nom
      if (department && department !== 'Tous') {
        const dept = departments.find(d => d.name === department)
        if (dept) {
          params.append('department', dept.id.toString())
        }
      }
      
      // Utiliser l'endpoint organigramme pour la recherche d'agents
      const response = await fetch(`${API_BASE_URL}/agents/search/?${params}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche')
      const data = await response.json()
      
      
      setEmployees(data.results || data) // Gérer la pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeById = async (id: number) => {
    try {
      // Utiliser l'endpoint organigramme pour les détails d'agent
      const response = await fetch(`${API_BASE_URL}/agents/${id}/`)
      if (!response.ok) throw new Error('Employé non trouvé')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  const getEmployeeSubordinates = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}/subordinates/`)
      if (!response.ok) throw new Error('Erreur lors du chargement des subordonnés')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return []
    }
  }

  const getDepartmentStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics/departments/`)
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return []
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
        fetchOrgChartData()
      ])
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
