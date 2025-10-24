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
  main_direction_name: string
  manager: number | null
  manager_name: string | null
  hierarchy_level: number
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
      const response = await fetch(`${API_BASE_URL}/employees/`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      
      // Logs spécifiques pour les avatars
      const employeesData = data.results || data
      console.log('🖼️ [ANNUAIRE] === ANALYSE DES AVATARS ===')
      if (employeesData.length > 0) {
        employeesData.forEach((emp: Employee, index: number) => {
          console.log(`🖼️ [ANNUAIRE] ${index + 1}. ${emp.full_name}: ${emp.avatar || 'AUCUN'}`)
        })
      }
      
      setEmployees(employeesData)
    } catch (err) {
      console.error('❌ [ANNUAIRE] Erreur lors du chargement des employés:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setDepartments(data.results || data)
    } catch (err) {
      console.error('❌ [ANNUAIRE] Erreur lors du chargement des départements:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const fetchOrgChartData = async () => {
    try {
      console.log('🔍 [ANNUAIRE] Récupération de l\'organigramme depuis:', `${API_BASE_URL}/hierarchy-data/`)
      // Utiliser l'endpoint annuaire pour l'organigramme
      const response = await fetch(`${API_BASE_URL}/hierarchy-data/`)
      if (!response.ok) {
        console.error('❌ [ANNUAIRE] Erreur HTTP organigramme:', response.status, response.statusText)
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log('✅ [ANNUAIRE] Organigramme récupéré:', Object.keys(data).length, 'niveaux')
      setOrgChartData(data)
    } catch (err) {
      console.error('❌ [ANNUAIRE] Erreur lors du chargement de l\'organigramme:', err)
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
      
      console.log('🔍 [ANNUAIRE] Recherche d\'employés:', `${API_BASE_URL}/employees/search/?${params}`)
      // Utiliser l'endpoint annuaire pour la recherche d'employés
      const response = await fetch(`${API_BASE_URL}/employees/search/?${params}`)
      if (!response.ok) {
        console.error('❌ [ANNUAIRE] Erreur HTTP recherche:', response.status, response.statusText)
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log('✅ [ANNUAIRE] Recherche terminée:', data.length || data.results?.length || 0, 'résultats')
      
      setEmployees(data.results || data) // Gérer la pagination
    } catch (err) {
      console.error('❌ [ANNUAIRE] Erreur lors de la recherche:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeById = async (id: number) => {
    try {
      console.log('🔍 [ANNUAIRE] Récupération employé ID:', id)
      // Utiliser l'endpoint annuaire pour les détails d'employé
      const response = await fetch(`${API_BASE_URL}/employees/${id}/`)
      if (!response.ok) {
        console.error('❌ [ANNUAIRE] Erreur HTTP employé:', response.status, response.statusText)
        throw new Error('Employé non trouvé')
      }
      return await response.json()
    } catch (err) {
      console.error('❌ [ANNUAIRE] Erreur lors de la récupération de l\'employé:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  const getEmployeeSubordinates = async (id: number) => {
    try {
      console.log('🔍 [ANNUAIRE] Récupération subordonnés pour employé ID:', id)
      // L'app annuaire n'a pas de hiérarchie, retourner un tableau vide
      console.log('ℹ️ [ANNUAIRE] L\'app annuaire ne gère pas la hiérarchie, retour d\'un tableau vide')
      return []
    } catch (err) {
      console.error('❌ [ANNUAIRE] Erreur lors de la récupération des subordonnés:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return []
    }
  }

  const getDepartmentStatistics = async () => {
    try {
      console.log('🔍 [ANNUAIRE] Récupération statistiques départements depuis:', `${API_BASE_URL}/statistics/departments/`)
      const response = await fetch(`${API_BASE_URL}/statistics/departments/`)
      if (!response.ok) {
        console.error('❌ [ANNUAIRE] Erreur HTTP statistiques:', response.status, response.statusText)
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log('✅ [ANNUAIRE] Statistiques récupérées:', data.length || 0, 'départements')
      return data
    } catch (err) {
      console.error('❌ [ANNUAIRE] Erreur lors du chargement des statistiques:', err)
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
