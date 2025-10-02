import { useState, useCallback } from 'react'

// Fonction pour récupérer le token CSRF
const getCSRFToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.csrfToken
    }
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error)
    return null
  }
}

export interface Questionnaire {
  id: number
  title: string
  description: string
  type: 'survey' | 'quiz' | 'evaluation' | 'feedback' | 'poll'
  type_display: string
  status: 'draft' | 'active' | 'paused' | 'closed' | 'archived'
  status_display: string
  is_anonymous: boolean
  allow_multiple_responses: boolean
  show_results_after_submission: boolean
  target_audience_type: 'all' | 'department' | 'role' | 'custom'
  target_audience_type_display: string
  target_departments: string[]
  target_roles: string[]
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  created_by_name: string
  is_active: boolean
  total_responses: number
  response_rate: number
  questions: Question[]
}

export interface Question {
  id: number
  text: string
  type: 'text' | 'single_choice' | 'multiple_choice' | 'scale' | 'date' | 'file' | 'rating' | 'rating_stars' | 'rating_numeric' | 'satisfaction_scale' | 'email' | 'phone' | 'required_checkbox' | 'date_range' | 'ranking' | 'top_selection' | 'matrix' | 'likert'
  type_display: string
  is_required: boolean
  order: number
  options: string[]
  scale_min?: number
  scale_max?: number
  scale_labels?: Record<string, string>
  rating_max?: number
  rating_labels?: string[]
  satisfaction_options?: string[]
  validation_rules?: Record<string, any>
  checkbox_text?: string
  ranking_items?: string[]
  top_selection_limit?: number
  matrix_questions?: string[]
  matrix_options?: string[]
  likert_scale?: string[]
  depends_on_question?: number
  show_condition?: Record<string, any>
}

export interface QuestionnaireStats {
  total_questionnaires: number
  active_questionnaires: number
  total_responses: number
  average_response_rate: number
  questionnaires_by_status: Record<string, number>
  questionnaires_by_type: Record<string, number>
  recent_questionnaires: Questionnaire[]
  top_questionnaires: Questionnaire[]
}

export interface QuestionnaireFilters {
  status?: string
  type?: string
  search?: string
  date_from?: string
  date_to?: string
}

export function useQuestionnaireManagement() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [stats, setStats] = useState<QuestionnaireStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer toutes les enquêtes avec filtres
  const fetchQuestionnaires = useCallback(async (filters: QuestionnaireFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken })
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des questionnaires')
      }
      
      const data = await response.json()
      const questionnairesData = data.results || data
      // Filtrer les éléments valides
      const validQuestionnaires = Array.isArray(questionnairesData) 
        ? questionnairesData.filter(q => q && q.title && q.description)
        : []
      setQuestionnaires(validQuestionnaires)
      return validQuestionnaires
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la récupération des questionnaires:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Récupérer les statistiques globales
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/statistics/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken })
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques')
      }
      
      const data = await response.json()
      setStats(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la récupération des statistiques:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Récupérer les détails d'une enquête
  const fetchQuestionnaire = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du questionnaire')
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la récupération du questionnaire:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Récupérer les statistiques d'une enquête
  const fetchQuestionnaireStats = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/stats/`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques du questionnaire')
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la récupération des statistiques:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Récupérer les analytics avancés d'une enquête
  const fetchQuestionnaireAnalytics = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/analytics/`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des analytics du questionnaire')
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la récupération des analytics:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Exporter les données d'une enquête
  const exportQuestionnaire = useCallback(async (id: number, format: 'json' | 'csv' = 'json') => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/export/?format=${format}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export du questionnaire')
      }
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `questionnaire_${id}_export.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return { success: true }
      } else {
        const data = await response.json()
        return { success: true, data }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de l\'export:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Changer le statut d'une enquête
  const updateQuestionnaireStatus = useCallback(async (id: number, status: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut')
      }
      
      const data = await response.json()
      
      // Mettre à jour la liste locale
      setQuestionnaires(prev => 
        prev.map(q => q.id === id ? { ...q, status, status_display: data.questionnaire.status_display } : q)
      )
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la mise à jour du statut:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Supprimer une enquête
  const deleteQuestionnaire = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/delete/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du questionnaire')
      }
      
      // Retirer de la liste locale
      setQuestionnaires(prev => prev.filter(q => q.id !== id))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la suppression:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Dupliquer une enquête
  const duplicateQuestionnaire = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/duplicate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la duplication du questionnaire')
      }
      
      const data = await response.json()
      
      // Ajouter la copie à la liste locale
      if (data.questionnaire) {
        setQuestionnaires(prev => [data.questionnaire, ...prev])
      }
      
      return data.questionnaire
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la duplication:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Créer une nouvelle enquête
  const createQuestionnaire = useCallback(async (questionnaireData: Partial<Questionnaire>) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📤 Données envoyées:', questionnaireData)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify(questionnaireData)
      })
      
      console.log('📥 Réponse reçue:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erreur détaillée:', errorData)
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la création du questionnaire')
      }
      
      const data = await response.json()
      console.log('✅ Données créées:', data)
      
      // Ajouter à la liste locale
      if (data.questionnaire) {
        setQuestionnaires(prev => [data.questionnaire, ...prev])
      }
      
      return data.questionnaire
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la création:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Mettre à jour une enquête
  const updateQuestionnaire = useCallback(async (id: number, questionnaireData: Partial<Questionnaire>) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionnaireData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du questionnaire')
      }
      
      const data = await response.json()
      
      // Mettre à jour la liste locale
      setQuestionnaires(prev => 
        prev.map(q => q.id === id ? data.questionnaire : q)
      )
      
      return data.questionnaire
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la mise à jour:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])


  return {
    questionnaires,
    stats,
    loading,
    error,
    fetchQuestionnaires,
    fetchStats,
    fetchQuestionnaire,
    fetchQuestionnaireStats,
    fetchQuestionnaireAnalytics,
    exportQuestionnaire,
    updateQuestionnaireStatus,
    deleteQuestionnaire,
    duplicateQuestionnaire,
    createQuestionnaire,
    updateQuestionnaire
  }
}
