import { useState, useEffect, useCallback } from 'react'
import { API_CONFIG } from "@/lib/config"

export interface Project {
  id: number
  titre: string
  name?: string  // Alias pour compatibilité frontend
  objective: string
  description?: string
  status: 'en_cours' | 'termine' | 'planifie' | 'en_projet'
  date_debut?: string
  date_fin?: string
  partners?: string
  chef_projet?: string
  chefProjet?: string  // Alias pour compatibilité frontend
  dateDebut?: string  // Alias pour compatibilité frontend
  dateFin?: string  // Alias pour compatibilité frontend
  image?: string
  duration_days?: number
  duration_formatted?: string
  created_at?: string
  updated_at?: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_CONFIG.ACCUEIL}/projects/active/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Normaliser les données pour correspondre à l'interface frontend
      const normalizedProjects: Project[] = Array.isArray(data) ? data.map((project: any) => ({
        id: project.id,
        titre: project.titre || project.name || '',
        name: project.titre || project.name || '',  // Alias pour compatibilité
        objective: project.objective || '',
        description: project.description || '',
        status: project.status || 'planifie',
        date_debut: project.date_debut || project.dateDebut,
        date_fin: project.date_fin || project.dateFin,
        dateDebut: project.date_debut || project.dateDebut,  // Alias
        dateFin: project.date_fin || project.dateFin,  // Alias
        partners: project.partners || '',
        chef_projet: project.chef_projet || project.chefProjet,
        chefProjet: project.chef_projet || project.chefProjet,  // Alias
        image: project.image || '',
        duration_days: project.duration_days,
        duration_formatted: project.duration_formatted,
        created_at: project.created_at,
        updated_at: project.updated_at,
      })) : []
      
      setProjects(normalizedProjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur lors de la récupération des projets:', err)
      setProjects([])  // En cas d'erreur, utiliser un tableau vide
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    fetchProjects,
  }
}

