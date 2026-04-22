import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'

export interface SecurityVideo {
  id: number
  title: string
  file: string
  file_url: string
  file_size: number
  file_size_display: string
  description: string | null
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SecurityVideoUpload {
  title: string
  file: File
  description?: string
  order?: number
}

export function useSecurityVideos() {
  const [videos, setVideos] = useState<SecurityVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await api.get('/security/videos/', { requireAuth: false })
      if (res.ok) {
        const data = await res.json()
        setVideos(data.results ?? data)
      } else {
        throw new Error(`Erreur ${res.status}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadVideo = async (data: SecurityVideoUpload) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('file', data.file)
      if (data.description) formData.append('description', data.description)
      if (data.order !== undefined) formData.append('order', String(data.order))

      const res = await api.post('/security/videos/', formData, { requireAuth: true })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (typeof json === 'object' ? Object.values(json).flat().join(' ') : '') || `Erreur ${res.status}`
        throw new Error(msg as string)
      }
      setVideos(prev => [...prev, json].sort((a, b) => a.order - b.order))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  const deleteVideo = async (id: number) => {
    try {
      const res = await api.delete(`/security/videos/${id}/`, { requireAuth: true })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      setVideos(prev => prev.filter(v => v.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  useEffect(() => { fetchVideos() }, [fetchVideos])

  return { videos, isLoading, error, fetchVideos, uploadVideo, deleteVideo }
}
