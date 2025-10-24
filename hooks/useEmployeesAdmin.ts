"use client"

import { useState, useEffect, useCallback } from "react"

interface Employee {
  id: number
  first_name: string
  last_name: string
  full_name: string
  initials: string
  email: string
  phone_fixed: string | null
  phone_mobile: string | null
  employee_id: string
  matricule: string
  position_title: string
  department: number
  main_direction_name: string
  avatar: string | null
  created_at: string
  updated_at: string
}

interface Department {
  id: number
  name: string
  employee_count: number
  created_at: string
  updated_at: string
}

interface EmployeesFilters {
  search: string
  department: string
  page: number
  page_size: number
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
  start: number
  end: number
}

interface EmployeesAdminState {
  employees: Employee[]
  departments: Department[]
  loading: boolean
  error: string | null
  pagination: Pagination
  filters: EmployeesFilters
  selectedEmployees: number[]
}

const initialFilters: EmployeesFilters = {
  search: '',
  department: 'all',
  page: 1,
  page_size: 10
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/annuaire`

export const useEmployeesAdmin = () => {
  const [state, setState] = useState<EmployeesAdminState>({
    employees: [],
    departments: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      page_size: 10,
      total: 0,
      total_pages: 0,
      start: 0,
      end: 0
    },
    filters: initialFilters,
    selectedEmployees: []
  })

  // Fonction pour construire les paramètres de requête
  const buildQueryParams = useCallback((filters: EmployeesFilters) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.department && filters.department !== 'all') params.append('department', filters.department)
    params.append('page', filters.page.toString())
    params.append('page_size', filters.page_size.toString())
    
    return params.toString()
  }, [])

  // Récupérer les employés
  const fetchEmployees = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const queryParams = buildQueryParams(state.filters)
      const url = `${API_BASE_URL}/employees/?${queryParams}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Si l'API retourne directement un tableau
      if (Array.isArray(data)) {
        setState(prev => ({
          ...prev,
          employees: data,
          loading: false,
          pagination: {
            ...prev.pagination,
            total: data.length,
            start: 1,
            end: data.length
          }
        }))
      } else {
        // Si l'API retourne un objet avec pagination
        setState(prev => ({
          ...prev,
          employees: data.results || data.employees || [],
          loading: false,
          pagination: {
            page: data.page || 1,
            page_size: data.page_size || 10,
            total: data.total || data.count || 0,
            total_pages: data.total_pages || Math.ceil((data.total || data.count || 0) / (data.page_size || 10)),
            start: ((data.page || 1) - 1) * (data.page_size || 10) + 1,
            end: Math.min((data.page || 1) * (data.page_size || 10), data.total || data.count || 0)
          }
        }))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        loading: false
      }))
    }
  }, [state.filters, buildQueryParams])

  // Récupérer les départements
  const fetchDepartments = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/departments/`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      const departments = data.results || data
      
      setState(prev => ({
        ...prev,
        departments: departments
      }))
    } catch (error) {
      console.error('❌ [USE_EMPLOYEES_ADMIN] Erreur récupération départements:', error)
    }
  }, [])

  // Supprimer un employé
  const deleteEmployee = useCallback(async (employeeId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchEmployees()
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      }))
    }
  }, [fetchEmployees])

  // Supprimer plusieurs employés
  const deleteMultipleEmployees = useCallback(async (employeeIds: number[]) => {
    try {
      const deletePromises = employeeIds.map(id => deleteEmployee(id))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error)
    }
  }, [deleteEmployee])

  // Mettre à jour un employé
  const updateEmployee = useCallback(async (employeeId: number, employeeData: Partial<Employee> | FormData) => {
    try {
      const isFormData = employeeData instanceof FormData
      
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/`, {
        method: 'PATCH',
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
        },
        body: isFormData ? employeeData : JSON.stringify(employeeData)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchEmployees()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      }))
    }
  }, [fetchEmployees])

  // Créer un nouvel employé
  const createEmployee = useCallback(async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'> | FormData) => {
    try {
      console.log('🖼️ [CREATE_EMPLOYEE] === CRÉATION EMPLOYÉ AVEC IMAGE ===')
      
      const isFormData = employeeData instanceof FormData
      if (isFormData) {
        console.log('📋 [CREATE_EMPLOYEE] Contenu FormData:')
        for (let [key, value] of employeeData.entries()) {
          if (key === 'avatar') {
            console.log(`  🖼️ ${key}: [File] ${(value as File).name} (${(value as File).size} bytes, ${(value as File).type})`)
          } else {
            console.log(`  📋 ${key}: "${value}"`)
          }
        }
      }
      
      const url = `${API_BASE_URL}/employees/`
      const requestOptions = {
        method: 'POST',
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
        },
        body: isFormData ? employeeData : JSON.stringify(employeeData)
      }
      
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [USE_EMPLOYEES_ADMIN] Erreur de réponse:')
        console.error('  - Status:', response.status)
        console.error('  - Status Text:', response.statusText)
        console.error('  - Body:', errorText)
        
        // Essayer de parser l'erreur JSON pour obtenir un message plus clair
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            throw new Error(errorData.error)
          }
        } catch (parseError) {
          // Si le parsing échoue, utiliser le message par défaut
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
        const responseData = await response.json()
        
        // Logs spécifiques pour l'avatar
        console.log('🖼️ [USE_EMPLOYEES_ADMIN] === ANALYSE RÉPONSE BACKEND ===')
        if (responseData.avatar) {
          console.log('🖼️ [USE_EMPLOYEES_ADMIN] Avatar reçu du backend:')
          console.log('  - URL:', responseData.avatar)
          console.log('  - Type:', typeof responseData.avatar)
          console.log('  - Est URL complète:', responseData.avatar.startsWith('http'))
        } else {
          console.log('⚠️ [USE_EMPLOYEES_ADMIN] Aucun avatar dans la réponse du backend')
          console.log('⚠️ [USE_EMPLOYEES_ADMIN] Champs disponibles:', Object.keys(responseData))
        }
      
      // Rafraîchir la liste
      await fetchEmployees()
    } catch (error) {
      console.error('❌ [USE_EMPLOYEES_ADMIN] === ERREUR CRÉATION EMPLOYÉ ===')
      console.error('❌ [USE_EMPLOYEES_ADMIN] Erreur complète:', error)
      console.error('❌ [USE_EMPLOYEES_ADMIN] Type d\'erreur:', typeof error)
      console.error('❌ [USE_EMPLOYEES_ADMIN] Message d\'erreur:', error instanceof Error ? error.message : 'Erreur inconnue')
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la création'
      }))
    }
  }, [fetchEmployees])

  // Mettre à jour les filtres
  const setFilters = useCallback((newFilters: Partial<EmployeesFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters, page: 1 }
    }))
  }, [])

  // Gérer la sélection
  const setSelectedEmployees = useCallback((employeeIds: number[]) => {
    setState(prev => ({ ...prev, selectedEmployees: employeeIds }))
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedEmployees: [] }))
  }, [])

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return {
    ...state,
    fetchEmployees,
    deleteEmployee,
    deleteMultipleEmployees,
    updateEmployee,
    createEmployee,
    setFilters,
    setSelectedEmployees,
    clearSelection
  }
}

// Export par défaut pour compatibilité
export default useEmployeesAdmin
