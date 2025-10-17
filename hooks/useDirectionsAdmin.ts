"use client"

import { useState, useEffect, useCallback } from 'react'

export interface Direction {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface UseDirectionsAdminReturn {
  directions: Direction[]
  loading: boolean
  error: string | null
  selectedDirections: number[]
  setSelectedDirections: (directions: number[]) => void
  clearSelection: () => void
  createDirection: (data: { name: string }) => Promise<void>
  updateDirection: (id: number, data: { name: string }) => Promise<void>
  deleteDirection: (id: number) => Promise<void>
  deleteMultipleDirections: (ids: number[]) => Promise<void>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const useDirectionsAdmin = (): UseDirectionsAdminReturn => {
  const [directions, setDirections] = useState<Direction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDirections, setSelectedDirections] = useState<number[]>([])

  // Charger les directions
  const fetchDirections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/organigramme/directions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const directionsData = Array.isArray(data) ? data : data.results || []
      setDirections(directionsData)
    } catch (err) {
      console.error('❌ [DIRECTIONS_ADMIN] Erreur fetchDirections:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  // Créer une direction
  const createDirection = useCallback(async (data: { name: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organigramme/directions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }

      // Recharger les directions
      await fetchDirections()
    } catch (err) {
      console.error('❌ [DIRECTIONS_ADMIN] Erreur createDirection:', err)
      throw err
    }
  }, [fetchDirections])

  // Mettre à jour une direction
  const updateDirection = useCallback(async (id: number, data: { name: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organigramme/directions/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }

      // Recharger les directions
      await fetchDirections()
    } catch (err) {
      console.error('❌ [DIRECTIONS_ADMIN] Erreur updateDirection:', err)
      throw err
    }
  }, [fetchDirections])

  // Supprimer une direction
  const deleteDirection = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organigramme/directions/${id}/`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }

      // Recharger les directions
      await fetchDirections()
    } catch (err) {
      console.error('❌ [DIRECTIONS_ADMIN] Erreur deleteDirection:', err)
      throw err
    }
  }, [fetchDirections])

  // Supprimer plusieurs directions
  const deleteMultipleDirections = useCallback(async (ids: number[]) => {
    try {
      const deletePromises = ids.map(id => deleteDirection(id))
      await Promise.all(deletePromises)
    } catch (err) {
      console.error('❌ [DIRECTIONS_ADMIN] Erreur deleteMultipleDirections:', err)
      throw err
    }
  }, [deleteDirection])

  // Effacer la sélection
  const clearSelection = useCallback(() => {
    setSelectedDirections([])
  }, [])

  // Charger les directions au montage
  useEffect(() => {
    fetchDirections()
  }, [fetchDirections])

  return {
    directions,
    loading,
    error,
    selectedDirections,
    setSelectedDirections,
    clearSelection,
    createDirection,
    updateDirection,
    deleteDirection,
    deleteMultipleDirections
  }
}

// Export par défaut pour compatibilité
export default useDirectionsAdmin