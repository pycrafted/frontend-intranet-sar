"use client"

import { useState, useCallback } from 'react'
import { API_CONFIG } from '@/lib/config'

export interface AdminUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  is_superuser: boolean
  groups_names: string[]
  department?: { id: number; name: string } | null
  position?: string
  matricule?: string
}

function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  return document.cookie.split('; ').find(c => c.startsWith('csrftoken='))?.split('=')[1] ?? ''
}

async function adminFetch(path: string, options?: RequestInit): Promise<Response> {
  const isWrite = options?.method && !['GET', 'HEAD'].includes(options.method)
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> ?? {}),
    ...(isWrite ? { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() } : {}),
  }
  return fetch(`${API_CONFIG.AUTH}/${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let allUsers: AdminUser[] = []
      let url: string | null = `${API_CONFIG.AUTH}/admin/users/?page_size=200`
      while (url) {
        const currentUrl: string = url
        const res: Response = await fetch(currentUrl, { credentials: 'include' })
        if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs')
        const data = await res.json() as AdminUser[] | { results: AdminUser[]; next: string | null }
        if (Array.isArray(data)) {
          allUsers = data
          url = null
        } else {
          allUsers = [...allUsers, ...(data.results ?? [])]
          url = data.next ?? null
        }
      }
      setUsers(allUsers)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleActive = useCallback(async (userId: number, isActive: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: isActive } : u))
    try {
      const res = await adminFetch(`admin/users/${userId}/toggle-active/`, {
        method: 'POST',
        body: JSON.stringify({ is_active: isActive }),
      })
      if (!res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u))
        throw new Error('Erreur lors de la mise à jour')
      }
      const data = await res.json() as { id: number; is_active: boolean }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u))
    } catch (e) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u))
      throw e
    }
  }, [])

  const toggleSuperuser = useCallback(async (userId: number, isSuperuser: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_superuser: isSuperuser } : u))
    try {
      const res = await adminFetch(`admin/users/${userId}/toggle-superuser/`, {
        method: 'POST',
        body: JSON.stringify({ is_superuser: isSuperuser }),
      })
      if (!res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_superuser: !isSuperuser } : u))
        throw new Error('Erreur lors de la mise à jour')
      }
      const data = await res.json() as { id: number; is_superuser: boolean }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_superuser: data.is_superuser } : u))
    } catch (e) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_superuser: !isSuperuser } : u))
      throw e
    }
  }, [])

  return { users, loading, error, fetchUsers, toggleActive, toggleSuperuser }
}
