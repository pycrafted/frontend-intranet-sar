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
  job_title: string
  department: number
  department_name: string
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

export function useEmployeesAdmin() {
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
      const response = await fetch(`${API_BASE_URL}/employees/?${queryParams}`)
      
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
      const response = await fetch(`${API_BASE_URL}/departments/`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        departments: data.results || data
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error)
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
      const isFormData = employeeData instanceof FormData
      
      const response = await fetch(`${API_BASE_URL}/employees/`, {
        method: 'POST',
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
      console.error('Erreur lors de la création de l\'employé:', error)
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
