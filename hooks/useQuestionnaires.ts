import { useState, useCallback } from 'react'

interface Question {
  id: number
  text: string
  type: string
  type_display: string
  is_required: boolean
  order: number
  options: string[]
  scale_min?: number
  scale_max?: number
  scale_labels?: Record<string, string>
  // Phase 1 - Nouveaux champs
  rating_max?: number
  rating_labels?: string[]
  satisfaction_options?: string[]
  validation_rules?: Record<string, any>
  checkbox_text?: string
  // Phase 2 - Nouveaux champs
  ranking_items?: string[]
  top_selection_limit?: number
  matrix_questions?: string[]
  matrix_options?: string[]
  likert_scale?: string[]
}

interface Questionnaire {
  id: number
  title: string
  description: string
  type: string
  type_display: string
  status: string
  status_display: string
  is_anonymous: boolean
  allow_multiple_responses: boolean
  show_results_after_submission: boolean
  target_audience_type: string
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

interface QuestionnaireResponse {
  questionnaire: number
  question_responses: {
    question: number
    answer_data: any
  }[]
}

export function useQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les questionnaires actifs
  const fetchActiveQuestionnaires = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/active/`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des questionnaires')
      }
      
      const data = await response.json()
      setQuestionnaires(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la récupération des questionnaires:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Soumettre une réponse à un questionnaire
  const submitQuestionnaireResponse = useCallback(async (responseData: QuestionnaireResponse) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/${responseData.questionnaire}/responses/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la soumission de la réponse')
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
      setError(errorMessage)
      console.error('Erreur lors de la soumission:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    questionnaires,
    loading,
    error,
    fetchActiveQuestionnaires,
    submitQuestionnaireResponse
  }
}

