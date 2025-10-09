import { useState, useEffect, useCallback } from "react"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/annuaire`

export interface Department {
  id: number
  name: string
  employee_count: number
  created_at: string
  updated_at: string
}

interface DepartmentsAdminState {
  departments: Department[]
  loading: boolean
  error: string | null
  selectedDepartments: number[]
}

const initialState: DepartmentsAdminState = {
  departments: [],
  loading: false,
  error: null,
  selectedDepartments: []
}

export function useDepartmentsAdmin() {
  const [state, setState] = useState<DepartmentsAdminState>(initialState)

  // Récupérer les départements
  const fetchDepartments = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`${API_BASE_URL}/departments/`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        departments: data.results || data,
        loading: false
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        loading: false
      }))
    }
  }, [])

  // Créer un département
  const createDepartment = useCallback(async (departmentData: { name: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchDepartments()
    } catch (error) {
      console.error('Erreur lors de la création du département:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la création'
      }))
    }
  }, [fetchDepartments])

  // Mettre à jour un département
  const updateDepartment = useCallback(async (departmentId: number, departmentData: { name: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchDepartments()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du département:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      }))
    }
  }, [fetchDepartments])

  // Supprimer un département
  const deleteDepartment = useCallback(async (departmentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchDepartments()
    } catch (error) {
      console.error('Erreur lors de la suppression du département:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      }))
    }
  }, [fetchDepartments])

  // Supprimer plusieurs départements
  const deleteMultipleDepartments = useCallback(async (departmentIds: number[]) => {
    try {
      const deletePromises = departmentIds.map(id => deleteDepartment(id))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error)
    }
  }, [deleteDepartment])

  // Gérer la sélection
  const setSelectedDepartments = useCallback((departmentIds: number[]) => {
    setState(prev => ({ ...prev, selectedDepartments: departmentIds }))
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedDepartments: [] }))
  }, [])

  // Charger les départements au montage
  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return {
    ...state,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    deleteMultipleDepartments,
    setSelectedDepartments,
    clearSelection
  }
}
