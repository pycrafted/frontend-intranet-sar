"use client"

import { useState, useEffect, useCallback } from "react"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/organigramme`

export interface Direction {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface DirectionsAdminState {
  directions: Direction[]
  loading: boolean
  error: string | null
  selectedDirections: number[]
}

const initialState: DirectionsAdminState = {
  directions: [],
  loading: false,
  error: null,
  selectedDirections: []
}

export function useDirectionsAdmin() {
  const [state, setState] = useState<DirectionsAdminState>(initialState)

  // Récupérer les directions
  const fetchDirections = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`${API_BASE_URL}/directions/`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        directions: data.results || data,
        loading: false
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des directions:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        loading: false
      }))
    }
  }, [])

  // Créer une direction
  const createDirection = useCallback(async (directionData: { name: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/directions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(directionData)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchDirections()
    } catch (error) {
      console.error('Erreur lors de la création de la direction:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la création'
      }))
    }
  }, [fetchDirections])

  // Mettre à jour une direction
  const updateDirection = useCallback(async (directionId: number, directionData: { name: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/directions/${directionId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(directionData)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchDirections()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la direction:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      }))
    }
  }, [fetchDirections])

  // Supprimer une direction
  const deleteDirection = useCallback(async (directionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/directions/${directionId}/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Rafraîchir la liste
      await fetchDirections()
    } catch (error) {
      console.error('Erreur lors de la suppression de la direction:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      }))
    }
  }, [fetchDirections])

  // Supprimer plusieurs directions
  const deleteMultipleDirections = useCallback(async (directionIds: number[]) => {
    try {
      const deletePromises = directionIds.map(id => deleteDirection(id))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error)
    }
  }, [deleteDirection])

  // Gérer la sélection
  const setSelectedDirections = useCallback((directionIds: number[]) => {
    setState(prev => ({ ...prev, selectedDirections: Array.isArray(directionIds) ? directionIds : [] }))
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedDirections: [] }))
  }, [])

  // Charger les directions au montage
  useEffect(() => {
    fetchDirections()
  }, [fetchDirections])

  return {
    ...state,
    fetchDirections,
    createDirection,
    updateDirection,
    deleteDirection,
    deleteMultipleDirections,
    setSelectedDirections,
    clearSelection
  }
}
