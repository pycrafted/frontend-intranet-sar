import { useState, useEffect, useCallback } from 'react'
import { API_CONFIG } from '@/lib/config'

export interface OdooJob {
  id: number
  odoo_id: number
  name: string
  department_name: string | null
  job_description: string | null
  description: string | null
  no_of_recruitment: number
  address: string | null
  publication_start_date: string | null
  publication_end_date: string | null
  is_internal: boolean
  synced_at: string
}

export function useJobs() {
  const [jobs, setJobs] = useState<OdooJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_CONFIG.RECRUTEMENT}/jobs/`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return { jobs, loading, error, refetch: fetchJobs }
}
