"use client"

import { useState, useEffect, useCallback } from "react"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/organigramme`

export interface Agent {
  id: number
  first_name: string
  last_name: string
  full_name: string
  initials: string
  job_title: string
  email: string
  phone_fixed: string | null
  phone_mobile: string | null
  matricule: string
  hierarchy_level: number
  avatar: string | null
  manager: number | null
  manager_name: string | null
  main_direction: number | null
  main_direction_name: string
  directions: Array<{
    id: number
    name: string
  }>
  created_at: string
  updated_at: string
}

export interface Direction {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface AgentsFilters {
  search: string
  direction: string
  manager: string
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

interface AgentsAdminState {
  agents: Agent[]
  directions: Direction[]
  managers: Agent[]
  loading: boolean
  error: string | null
  pagination: Pagination
  filters: AgentsFilters
  selectedAgents: number[]
}

const initialFilters: AgentsFilters = {
  search: '',
  direction: 'all',
  manager: 'all',
  page: 1,
  page_size: 10
}

export function useAgentsAdmin() {
  const [state, setState] = useState<AgentsAdminState>({
    agents: [],
    directions: [],
    managers: [],
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
    selectedAgents: []
  })

  // Fonction pour construire les paramètres de requête
  const buildQueryParams = useCallback((filters: AgentsFilters) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.direction && filters.direction !== 'all') params.append('direction', filters.direction)
    if (filters.manager && filters.manager !== 'all') params.append('manager', filters.manager)
    params.append('page', filters.page.toString())
    params.append('page_size', filters.page_size.toString())
    
    return params.toString()
  }, [])

  // Récupérer les agents
  const fetchAgents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const queryParams = buildQueryParams(state.filters)
      const response = await fetch(`${API_BASE_URL}/agents/?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Si l'API retourne directement un tableau
      if (Array.isArray(data)) {
        setState(prev => ({
          ...prev,
          agents: data,
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
          agents: data.results || data.agents || [],
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
      console.error('Erreur lors de la récupération des agents:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        loading: false
      }))
    }
  }, [state.filters, buildQueryParams])

  // Récupérer les directions
  const fetchDirections = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/directions/`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        directions: data.results || data
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des directions:', error)
    }
  }, [])

  // Récupérer les managers (tous les agents peuvent être managers)
  const fetchManagers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const agents = data.results || data.agents || data || []
      
      // Tous les agents peuvent être des managers potentiels
      // On les trie par niveau hiérarchique pour un affichage logique
      const managers = agents.sort((a: Agent, b: Agent) => {
        // D'abord par niveau hiérarchique (ascendant)
        if (a.hierarchy_level !== b.hierarchy_level) {
          return a.hierarchy_level - b.hierarchy_level
        }
        // Puis par nom de famille
        return a.last_name.localeCompare(b.last_name)
      })
      
      setState(prev => ({
        ...prev,
        managers
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des managers:', error)
    }
  }, [])

  // Supprimer un agent
  const deleteAgent = useCallback(async (agentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchAgents()
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'agent:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      }))
    }
  }, [fetchAgents])

  // Supprimer plusieurs agents
  const deleteMultipleAgents = useCallback(async (agentIds: number[]) => {
    try {
      const deletePromises = agentIds.map(id => deleteAgent(id))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error)
    }
  }, [deleteAgent])

  // Mettre à jour un agent
  const updateAgent = useCallback(async (agentId: number, agentData: Partial<Agent> | FormData) => {
    try {
      const isFormData = agentData instanceof FormData
      
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/`, {
        method: 'PATCH',
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
        },
        body: isFormData ? agentData : JSON.stringify(agentData)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchAgents()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'agent:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      }))
    }
  }, [fetchAgents])

  // Créer un nouvel agent
  const createAgent = useCallback(async (agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'> | FormData) => {
    try {
      const isFormData = agentData instanceof FormData
      
      const response = await fetch(`${API_BASE_URL}/agents/`, {
        method: 'POST',
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
        },
        body: isFormData ? agentData : JSON.stringify(agentData)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchAgents()
    } catch (error) {
      console.error('Erreur lors de la création de l\'agent:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la création'
      }))
    }
  }, [fetchAgents])

  // Uploader l'avatar d'un agent
  const uploadAgentAvatar = useCallback(async (agentId: number, avatarFile: File) => {
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/avatar/`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchAgents()
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload'
      }))
    }
  }, [fetchAgents])

  // Mettre à jour les filtres
  const setFilters = useCallback((newFilters: Partial<AgentsFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters, page: 1 }
    }))
  }, [])

  // Gérer la sélection
  const setSelectedAgents = useCallback((agentIds: number[]) => {
    setState(prev => ({ ...prev, selectedAgents: Array.isArray(agentIds) ? agentIds : [] }))
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedAgents: [] }))
  }, [])

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  useEffect(() => {
    fetchDirections()
  }, [fetchDirections])

  useEffect(() => {
    fetchManagers()
  }, [fetchManagers])

  return {
    ...state,
    fetchAgents,
    deleteAgent,
    deleteMultipleAgents,
    updateAgent,
    createAgent,
    uploadAgentAvatar,
    setFilters,
    setSelectedAgents,
    clearSelection
  }
}
