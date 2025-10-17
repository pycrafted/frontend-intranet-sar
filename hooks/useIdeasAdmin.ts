"use client"

import { useState, useEffect, useCallback } from "react"

interface Idea {
  id: number
  description: string
  department: string
  department_display: string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented'
  status_display: string
  submitted_at: string
  updated_at: string
}

interface IdeasFilters {
  search: string
  department: string
  status: string
  time_filter: string
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

interface IdeasAdminState {
  ideas: Idea[]
  loading: boolean
  error: string | null
  pagination: Pagination
  filters: IdeasFilters
  selectedIdeas: number[]
}

const initialFilters: IdeasFilters = {
  search: '',
  department: 'all',
  status: 'all',
  time_filter: 'all',
  page: 1,
  page_size: 10
}

const initialPagination: Pagination = {
  page: 1,
  page_size: 10,
  total: 0,
  total_pages: 0,
  start: 0,
  end: 0
}

export const useIdeasAdmin = () => {
  const [state, setState] = useState<IdeasAdminState>({
    ideas: [],
    loading: false,
    error: null,
    pagination: initialPagination,
    filters: initialFilters,
    selectedIdeas: []
  })

  // Construire les paramètres de requête
  const buildQueryParams = useCallback((filters: IdeasFilters) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.department !== 'all') params.append('department', filters.department)
    if (filters.status !== 'all') params.append('status', filters.status)
    if (filters.time_filter !== 'all') {
      const today = new Date()
      switch (filters.time_filter) {
        case 'today':
          params.append('date_from', today.toISOString().split('T')[0])
          params.append('date_to', today.toISOString().split('T')[0])
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          params.append('date_from', weekAgo.toISOString().split('T')[0])
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          params.append('date_from', monthAgo.toISOString().split('T')[0])
          break
      }
    }
    params.append('page', filters.page.toString())
    params.append('page_size', filters.page_size.toString())
    
    return params.toString()
  }, [])

  // Récupérer les idées
  const fetchIdeas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const queryParams = buildQueryParams(state.filters)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/ideas/?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Si l'API retourne directement un tableau
      if (Array.isArray(data)) {
        setState(prev => ({
          ...prev,
          ideas: data,
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
          ideas: data.results || data.ideas || [],
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
      console.error('Erreur lors de la récupération des idées:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }, [state.filters, buildQueryParams])

  // Mettre à jour le statut d'une idée
  const updateIdeaStatus = useCallback(async (ideaId: number, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/ideas/${ideaId}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchIdeas()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      }))
    }
  }, [fetchIdeas])

  // Supprimer une idée
  const deleteIdea = useCallback(async (ideaId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/ideas/${ideaId}/delete/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchIdeas()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      }))
    }
  }, [fetchIdeas])

  // Supprimer plusieurs idées
  const deleteMultipleIdeas = useCallback(async (ideaIds: number[]) => {
    try {
      const deletePromises = ideaIds.map(id => deleteIdea(id))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error)
    }
  }, [deleteIdea])

  // Mettre à jour le statut de plusieurs idées
  const updateMultipleIdeasStatus = useCallback(async (ideaIds: number[], status: string) => {
    try {
      const updatePromises = ideaIds.map(id => updateIdeaStatus(id, status))
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Erreur lors de la mise à jour multiple:', error)
    }
  }, [updateIdeaStatus])

  // Mettre à jour les filtres
  const setFilters = useCallback((newFilters: Partial<IdeasFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters, page: 1 } // Reset à la page 1 lors du changement de filtre
    }))
  }, [])

  // Gérer la sélection
  const setSelectedIdeas = useCallback((ideaIds: number[]) => {
    setState(prev => ({ ...prev, selectedIdeas: ideaIds }))
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIdeas: [] }))
  }, [])

  // Charger les idées au montage et quand les filtres changent
  useEffect(() => {
    fetchIdeas()
  }, [fetchIdeas])

  return {
    ...state,
    fetchIdeas,
    updateIdeaStatus,
    deleteIdea,
    deleteMultipleIdeas,
    updateMultipleIdeasStatus,
    setFilters,
    setSelectedIdeas,
    clearSelection
  }
}

// Export par défaut pour compatibilité
export default useIdeasAdmin
