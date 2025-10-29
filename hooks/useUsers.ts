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
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 [USE_USERS] Données reçues:', data)
      
      // S'assurer que data est un tableau
      let usersArray: User[] = []
      
      if (Array.isArray(data)) {
        usersArray = data
      } else if (data && typeof data === 'object') {
        // Si la réponse est un objet, chercher un tableau dedans
        if (Array.isArray(data.results)) {
          usersArray = data.results
        } else if (Array.isArray(data.users)) {
          usersArray = data.users
        } else if (Array.isArray(data.data)) {
          usersArray = data.data
        } else {
          console.warn('⚠️ [USE_USERS] Format de réponse inattendu:', data)
          usersArray = []
        }
      }
      
      setUsers(usersArray)
      console.log('✅ [USE_USERS] Utilisateurs récupérés:', usersArray.length)
    } catch (err: any) {
      console.error('❌ [USE_USERS] Erreur:', err)
      setError(`Erreur lors de la récupération des utilisateurs: ${err.response?.data?.detail || err.message}`)
      setUsers([]) // S'assurer que users est toujours un tableau
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
