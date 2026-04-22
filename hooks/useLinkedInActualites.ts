import { useState, useEffect } from 'react'
import { getApiUrl } from '@/lib/config'

export interface LinkedInActualite {
  id: number
  title: string
  content: string
  date: string
  date_display: string
  image_url: string | null
  linkedin_url: string | null
  is_from_linkedin: boolean
  is_active: boolean
}

export function useLinkedInActualites() {
  const [items, setItems] = useState<LinkedInActualite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = getApiUrl()
    fetch(`${apiUrl}/actualites/linkedin/`, { credentials: 'omit' })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`)
        return res.json()
      })
      .then((data: LinkedInActualite[]) => setItems(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { items, loading, error }
}
