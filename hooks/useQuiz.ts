import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'

export interface QuizOption {
  id: number
  text: string
  is_correct: boolean
  order: number
}

export interface QuizQuestion {
  id: number
  question: string
  source: string
  explanation: string
  order: number
  is_active: boolean
  options: QuizOption[]
}

export type QuizOptionInput = Omit<QuizOption, 'id'>
export type QuizQuestionInput = Omit<QuizQuestion, 'id' | 'options'> & { options: QuizOptionInput[] }

export function useQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/security/quiz/', { requireAuth: false })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setQuestions(Array.isArray(data) ? data : (data?.results ?? []))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const createQuestion = async (data: QuizQuestionInput): Promise<QuizQuestion> => {
    const res = await api.post('/security/quiz/', data, { requireAuth: true })
    if (!res.ok) throw new Error(`Erreur ${res.status}`)
    const created: QuizQuestion = await res.json()
    setQuestions(prev => [...prev, created])
    return created
  }

  const updateQuestion = async (id: number, data: Partial<QuizQuestionInput>): Promise<QuizQuestion> => {
    const res = await api.patch(`/security/quiz/${id}/`, data, { requireAuth: true })
    if (!res.ok) throw new Error(`Erreur ${res.status}`)
    const updated: QuizQuestion = await res.json()
    setQuestions(prev => prev.map(q => q.id === id ? updated : q))
    return updated
  }

  const deleteQuestion = async (id: number): Promise<void> => {
    const res = await api.delete(`/security/quiz/${id}/`, { requireAuth: true })
    if (!res.ok) throw new Error(`Erreur ${res.status}`)
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  return { questions, loading, error, fetchQuestions, createQuestion, updateQuestion, deleteQuestion }
}
