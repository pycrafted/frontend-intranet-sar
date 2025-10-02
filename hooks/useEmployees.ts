import { useState, useEffect } from 'react'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  full_name: string
  initials: string
  email: string
  phone: string | null  // Corrigé : phone au lieu de phone_number
  employee_id: string | null
  position: number  // ID de la position
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
}

export interface Department {
  id: number
  name: string
  description: string | null
  location: string | null
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

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/annuaire`

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [orgChartData, setOrgChartData] = useState<OrgChartData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      // Utiliser le nouvel endpoint pour les employés (modèles annuaire)
      const response = await fetch(`${API_BASE_URL}/employees/`)
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
      // Utiliser le nouvel endpoint corrigé pour les départements
      const response = await fetch(`${API_BASE_URL}/departments-list-corrected/`)
      if (!response.ok) throw new Error('Erreur lors du chargement des départements')
      const data = await response.json()
      // Convertir la liste de départements en format attendu
      const departmentsList = data.map((dept: string, index: number) => ({
        id: index + 1,
        name: dept,
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
      // Utiliser le nouvel endpoint corrigé pour l'organigramme
      const response = await fetch(`${API_BASE_URL}/hierarchy-data-corrected/`)
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
      if (department && department !== 'Tous') params.append('department', department)
      
      // Utiliser le nouvel endpoint pour la recherche d'employés
      const response = await fetch(`${API_BASE_URL}/employees/search/?${params}`)
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
      // Utiliser le nouvel endpoint pour les détails d'employé
      const response = await fetch(`${API_BASE_URL}/employees/${id}/`)
      if (!response.ok) throw new Error('Employé non trouvé')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  const getEmployeeSubordinates = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}/subordinates/`)
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
