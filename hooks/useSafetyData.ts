import { useState, useEffect } from 'react'
import { useCachedFetch } from './useCache'

export interface SafetyData {
  id: number
  last_incident_date_sar: string | null
  last_incident_date_ee: string | null
  last_incident_type_sar: string | null
  last_incident_type_ee: string | null
  last_incident_description_sar: string | null
  last_incident_description_ee: string | null
  safety_score: number
  created_at: string
  updated_at: string
  // Propriétés calculées
  days_without_incident_sar: number
  days_without_incident_ee: number
  days_without_incident: number
  last_incident_date: string | null
  last_incident_type: string | null
  last_incident_description: string | null
  appreciation_sar: string
  appreciation_ee: string
  // Champs pour compatibilité frontend
  daysWithoutIncidentSAR: number
  daysWithoutIncidentEE: number
  lastIncidentDateSAR: string | null
  lastIncidentDateEE: string | null
  lastIncidentTypeSAR: string | null
  lastIncidentTypeEE: string | null
  lastIncidentDescriptionSAR: string | null
  lastIncidentDescriptionEE: string | null
  safetyScore: number
}

export function useSafetyData() {
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { fetchWithCache } = useCachedFetch<SafetyData>({ ttl: 2 * 60 * 1000 }) // Cache de 2 minutes

  const fetchSafetyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/safety/current/`
      const data = await fetchWithCache(url, {}, 'safety-data')
      setSafetyData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur lors de la récupération des données de sécurité:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSafetyData = async (updateData: Partial<SafetyData>) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/safety/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      setSafetyData(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur lors de la mise à jour des données de sécurité:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetSafetyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/safety/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      setSafetyData(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur lors de la réinitialisation des données de sécurité:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSafetyData()
  }, [])

  return {
    safetyData,
    loading,
    error,
    fetchSafetyData,
    updateSafetyData,
    resetSafetyData,
  }
}
