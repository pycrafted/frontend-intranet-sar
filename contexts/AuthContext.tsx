"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api-client'

// Types pour l'authentification
export interface ManagerInfo {
  id: number
  first_name: string
  last_name: string
  full_name: string
  position?: string
  department?: string
}

export interface Manager {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  matricule?: string
  position?: string
}

export interface Department {
  id: number
  name: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar?: string
  avatar_url?: string
  phone_number?: string
  office_phone?: string
  position?: string
  department?: string | Department | null
  department_id?: number | null
  matricule?: string
  manager?: number | Manager | null
  manager_id?: number | null
  manager_info?: ManagerInfo | null
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  groups_names?: string[]
  is_admin_group?: boolean
  is_communication_group?: boolean
  last_login?: string
  created_at: string
  updated_at: string
  // Champs OAuth Google
  google_id?: string
  google_email?: string
  google_avatar_url?: string
  is_google_connected?: boolean
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  office_phone?: string
  position?: string
  department?: string
  matricule?: string
  manager?: number | null
  password: string
  password_confirm: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode
}

// Clés pour le stockage local
const USER_CACHE_KEY = 'sar_user_cache'
const AUTH_TIMESTAMP_KEY = 'sar_auth_timestamp'

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialiser avec le cache localStorage pour éviter le flash "Connexion"
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem(USER_CACHE_KEY)
        const authTimestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY)
        
        // Si on a un cache et qu'il n'est pas trop vieux (moins de 5 minutes)
        if (cachedUser && authTimestamp) {
          const timestamp = parseInt(authTimestamp, 10)
          const now = Date.now()
          const fiveMinutes = 5 * 60 * 1000
          
          // Si le cache est récent, l'utiliser pour éviter le flash
          if (now - timestamp < fiveMinutes) {
            console.log('📦 [AUTH] Utilisation du cache utilisateur pour éviter le flash')
            return JSON.parse(cachedUser)
          } else {
            // Cache trop vieux, le supprimer
            localStorage.removeItem(USER_CACHE_KEY)
            localStorage.removeItem(AUTH_TIMESTAMP_KEY)
          }
        }
      } catch (error) {
        console.error('❌ [AUTH] Erreur lors de la lecture du cache:', error)
        // En cas d'erreur, nettoyer le cache
        localStorage.removeItem(USER_CACHE_KEY)
        localStorage.removeItem(AUTH_TIMESTAMP_KEY)
      }
    }
    return null
  })
  
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier si l'utilisateur est connecté
  // Si on charge et qu'on a un user (même en cache), on est considéré comme authentifié
  // Cela évite le flash "Connexion" pendant la vérification
  const isAuthenticated = !!user

  // Fonction pour récupérer le token CSRF
  const getCSRFToken = async (): Promise<string | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const url = `${baseUrl}/auth/csrf/`
      console.log('🔑 [AUTH] Récupération du token CSRF:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      })
      
      console.log('🔑 [AUTH] Réponse CSRF:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔑 [AUTH] Token CSRF reçu:', data.csrfToken ? 'Oui' : 'Non')
        return data.csrfToken
      }
      return null
    } catch (error) {
      console.error('❌ [AUTH] Erreur lors de la récupération du token CSRF:', error)
      return null
    }
  }

  // Fonction pour récupérer l'utilisateur actuel
  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      console.log('👤 [AUTH] === fetchCurrentUser DÉBUT ===')
      console.log('👤 [AUTH] Cookies avant fetchCurrentUser:', {
        allCookies: document.cookie,
        hasSessionId: document.cookie.includes('sessionid'),
        hasCSRFToken: document.cookie.includes('csrftoken')
      })
      
      const response = await api.get('/auth/current-user/', { requireAuth: false })
      
      console.log('👤 [AUTH] Réponse utilisateur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: {
          'set-cookie': response.headers.get('Set-Cookie'),
          'content-type': response.headers.get('Content-Type')
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        console.log('✅ [AUTH] Données utilisateur reçues:', {
          id: userData?.id,
          email: userData?.email,
          username: userData?.username,
          hasManager: !!userData?.manager,
          hasDepartment: !!userData?.department
        })
        // Vérifier que les données utilisateur sont valides
        if (userData && userData.id && userData.email) {
          console.log('✅ [AUTH] Utilisateur valide retourné')
          return userData
        } else {
          console.log('⚠️ [AUTH] Données utilisateur incomplètes:', userData)
        }
      } else if (response.status === 401 || response.status === 403) {
        // Non authentifié - session expirée ou invalide
        console.log('❌ [AUTH] Utilisateur non authentifié (401/403)')
        console.log('🍪 [AUTH] Cookies après erreur 401/403:', document.cookie)
        
        // Essayons de comprendre pourquoi
        try {
          const errorData = await response.json()
          console.log('📋 [AUTH] Détails de l\'erreur:', errorData)
        } catch (e) {
          console.log('⚠️ [AUTH] Impossible de lire le corps de l\'erreur')
        }
        return null
      } else {
        console.log('⚠️ [AUTH] Réponse inattendue:', response.status)
      }
      return null
    } catch (error) {
      console.error('❌ [AUTH] Erreur lors de la récupération de l\'utilisateur:', error)
      console.log('🍪 [AUTH] Cookies lors de l\'erreur:', document.cookie)
      return null
    } finally {
      console.log('👤 [AUTH] === fetchCurrentUser FIN ===')
    }
  }

  // Fonction pour recharger les données utilisateur
  const refreshUser = async (): Promise<void> => {
    const updatedUser = await fetchCurrentUser()
    if (updatedUser) {
      setUser(updatedUser)
      // Mettre à jour le cache
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updatedUser))
          localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
        } catch (error) {
          console.error('❌ [AUTH] Erreur lors de la mise à jour du cache:', error)
        }
      }
    }
  }

  // Fonction de connexion
  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 [AUTH] Tentative de connexion:', { email: data.email })
      setIsLoading(true)

      const response = await api.post('/auth/login/', data, { requireAuth: false })
      
      console.log('🔐 [AUTH] Réponse de connexion:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })

      if (response.ok) {
        const result = await response.json()
        console.log('🔐 [AUTH] Résultat de connexion:', result)
        setUser(result.user)
        
        // Mettre à jour le cache immédiatement
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(result.user))
            localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
            console.log('💾 [AUTH] Cache utilisateur mis à jour après connexion')
          } catch (error) {
            console.error('❌ [AUTH] Erreur lors de la sauvegarde du cache:', error)
          }
        }
        
        // Recharger les données utilisateur pour s'assurer que l'avatar est à jour
        setTimeout(() => {
          refreshUser()
        }, 100)
        
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail || 'Erreur de connexion' }
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      // Appeler l'endpoint de déconnexion côté serveur
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      await fetch(`${baseUrl}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
      })
    } catch (error) {
      // Erreur silencieuse - on déconnecte quand même côté client
    } finally {
      // Vider l'état côté client
      setUser(null)
      setIsLoading(false)
      
      // Redirection après déconnexion
      if (typeof window !== 'undefined') {
        // Nettoyer le cache d'authentification spécifiquement
        localStorage.removeItem(USER_CACHE_KEY)
        localStorage.removeItem(AUTH_TIMESTAMP_KEY)
        
        // Nettoyer le localStorage et sessionStorage si nécessaire
        // (on garde seulement les données non liées à l'auth)
        
        // Rediriger vers la page d'accueil
        window.location.href = '/'
      }
    }
  }

  // Fonction d'inscription
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${baseUrl}/auth/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result.user)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail || 'Erreur d\'inscription' }
      }
    } catch (error) {
      return { success: false, error: 'Erreur d\'inscription' }
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de mise à jour du profil
  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${baseUrl}/auth/current-user/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result)
        // Mettre à jour le cache
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(result))
            localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
          } catch (error) {
            console.error('❌ [AUTH] Erreur lors de la mise à jour du cache:', error)
          }
        }
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail || 'Erreur de mise à jour' }
      }
    } catch (error) {
      return { success: false, error: 'Erreur de mise à jour' }
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de changement de mot de passe
  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${baseUrl}/auth/change-password/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: newPassword,
        }),
      })

      if (response.ok) {
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail || 'Erreur de changement de mot de passe' }
      }
    } catch (error) {
      return { success: false, error: 'Erreur de changement de mot de passe' }
    } finally {
      setIsLoading(false)
    }
  }


  // Vérifier l'utilisateur actuel au chargement
  useEffect(() => {
    const checkUser = async () => {
      console.log('🚀 [AUTH] === DÉMARRAGE AUTHCONTEXT ===')
      console.log('🚀 [AUTH] Vérification de l\'utilisateur au chargement...')
      console.log('🍪 [AUTH] Cookies au démarrage:', {
        allCookies: document.cookie,
        sessionCookie: document.cookie.match(/sessionid=([^;]+)/)?.[1] || 'Non trouvé',
        csrfCookie: document.cookie.match(/csrftoken=([^;]+)/)?.[1] || 'Non trouvé',
        cookieCount: document.cookie.split(';').filter(c => c.trim()).length
      })
      
      setIsLoading(true)
      const currentUser = await fetchCurrentUser()
      
      console.log('✅ [AUTH] Résultat de fetchCurrentUser:', {
        hasUser: !!currentUser,
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        isAuthenticated: !!currentUser
      })
      
      if (currentUser) {
        console.log('✅ [AUTH] Utilisateur trouvé, mise à jour de l\'état')
        setUser(currentUser)
        // Mettre à jour le cache
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentUser))
            localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
            console.log('💾 [AUTH] Cache utilisateur mis à jour')
          } catch (error) {
            console.error('❌ [AUTH] Erreur lors de la sauvegarde du cache:', error)
          }
        }
      } else {
        console.log('⚠️ [AUTH] Aucun utilisateur trouvé - déconnecté')
        setUser(null)
        // Nettoyer le cache
        if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_CACHE_KEY)
          localStorage.removeItem(AUTH_TIMESTAMP_KEY)
          console.log('🗑️ [AUTH] Cache utilisateur nettoyé')
        }
      }
      setIsLoading(false)
      console.log('🏁 [AUTH] === FIN INITIALISATION AUTHCONTEXT ===')
    }
    
    checkUser()
  }, []) // Dépendances vides pour s'exécuter une seule fois au montage

  // Valeur du contexte
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
