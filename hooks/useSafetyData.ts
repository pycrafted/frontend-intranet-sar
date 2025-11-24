import { useState, useEffect } from 'react'
import { API_CONFIG } from "@/lib/config"

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

  const fetchSafetyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_CONFIG.ACCUEIL}/safety/current/`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
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
      
      const response = await fetch(`${API_CONFIG.ACCUEIL}/safety/update/`, {
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
      
      const response = await fetch(`${API_CONFIG.ACCUEIL}/safety/reset/`, {
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
    
    // Calculer le temps jusqu'à minuit prochain (minuit local)
    const calculateTimeUntilMidnight = () => {
      const now = new Date()
      // Créer une date pour minuit du jour suivant
      const midnight = new Date(now)
      midnight.setDate(midnight.getDate() + 1) // Jour suivant
      midnight.setHours(0, 0, 0, 0) // Minuit (00:00:00.000)
      return midnight.getTime() - now.getTime()
    }
    
    // Fonction pour programmer le prochain rafraîchissement à minuit
    const scheduleNextMidnightRefresh = () => {
      const timeUntilMidnight = calculateTimeUntilMidnight()
      
      return setTimeout(() => {
        // Rafraîchir immédiatement à minuit
        fetchSafetyData()
        
        // Programmer le prochain rafraîchissement pour le minuit suivant
        scheduleNextMidnightRefresh()
      }, timeUntilMidnight)
    }
    
    // Programmer le premier rafraîchissement à minuit
    let midnightTimeout = scheduleNextMidnightRefresh()
    
    // Rafraîchir aussi toutes les minutes autour de minuit (23h55 à 00h05) pour garantir la mise à jour
    // et toutes les heures le reste du temps
    let checkInterval: NodeJS.Timeout | null = null
    
    const startCheckInterval = () => {
      checkInterval = setInterval(() => {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        
        // Si on est entre 23h55 et 00h05, rafraîchir toutes les minutes
        // Sinon, rafraîchir toutes les heures
        if ((hours === 23 && minutes >= 55) || (hours === 0 && minutes <= 5)) {
          fetchSafetyData()
        } else if (minutes === 0) {
          // Rafraîchir à chaque heure pile
          fetchSafetyData()
        }
      }, 60 * 1000) // Vérifier toutes les minutes
    }
    
    startCheckInterval()
    
    return () => {
      clearTimeout(midnightTimeout)
      if (checkInterval) clearInterval(checkInterval)
    }
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
