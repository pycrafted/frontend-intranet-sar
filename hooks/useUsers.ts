import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { User } from '@/contexts/AuthContext'
import { useAuth } from '@/contexts/AuthContext'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchUsers = async () => {
    // Ne pas faire la requête si l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
      console.log('🔒 [USE_USERS] Utilisateur non authentifié, requête annulée')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('👥 [USE_USERS] Récupération des utilisateurs...')
      const response = await api.get('/auth/users/')
      const data = await response.json()
      
      if (data) {
        setUsers(data)
        console.log('✅ [USE_USERS] Utilisateurs récupérés:', data.length)
      }
    } catch (err: any) {
      console.error('❌ [USE_USERS] Erreur:', err)
      setError(`Erreur lors de la récupération des utilisateurs: ${err.response?.data?.detail || err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers
  }
}
