"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
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
  department?: string
  matricule?: string
  manager?: number | null
  manager_info?: ManagerInfo | null
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
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

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier si l'utilisateur est connecté (seulement si on a fini de charger)
  const isAuthenticated = !isLoading && !!user

  // Fonction pour récupérer le token CSRF
  const getCSRFToken = async (): Promise<string | null> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/csrf/`
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
      console.log('👤 [AUTH] Récupération de l\'utilisateur actuel...')
      console.log('👤 [AUTH] URL complète:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/current-user/`)
      const response = await api.get('/api/auth/current-user/', { requireAuth: true })
      
      console.log('👤 [AUTH] Réponse utilisateur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })
      
      if (response.ok) {
        const userData = await response.json()
        console.log('👤 [AUTH] Données utilisateur reçues:', userData)
        // Vérifier que les données utilisateur sont valides
        if (userData && userData.id && userData.email) {
          return userData
        }
      } else if (response.status === 401 || response.status === 403) {
        // Non authentifié - session expirée ou invalide
        console.log('🔍 [AUTH] Utilisateur non authentifié (401/403)')
        return null
      }
      return null
    } catch (error) {
      console.log('❌ [AUTH] Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
  }

  // Fonction pour recharger les données utilisateur
  const refreshUser = async (): Promise<void> => {
    const updatedUser = await fetchCurrentUser()
    if (updatedUser) {
      setUser(updatedUser)
    }
  }

  // Fonction de connexion
  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 [AUTH] Tentative de connexion:', { email: data.email })
      console.log('🔐 [AUTH] URL complète:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`)
      setIsLoading(true)

      const response = await api.post('/api/auth/login/', data, { requireAuth: false })
      
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
        
        // Vérifier si des tokens Google ont été générés automatiquement
        if (result.google_tokens_generated) {
          console.log('🔗 Tokens Google générés automatiquement pour l\'utilisateur')
          
          // Si une URL d'authentification Google est fournie, l'ouvrir automatiquement
          if (result.google_auth_url) {
            console.log('🚀 Ouverture automatique de l\'authentification Google')
            // Ouvrir dans une popup pour une meilleure UX
            const popup = window.open(
              result.google_auth_url, 
              'google_auth', 
              'width=500,height=600,scrollbars=yes,resizable=yes'
            )
            
            // Surveiller la fermeture de la popup
            const checkClosed = setInterval(() => {
              if (popup?.closed) {
                clearInterval(checkClosed)
                console.log('✅ Popup Google fermée, rechargement des données utilisateur')
                // Recharger les données utilisateur après fermeture de la popup
                setTimeout(() => {
                  refreshUser()
                }, 1000)
              }
            }, 1000)
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/logout/`, {
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
      
      // Forcer la redirection vers login après déconnexion
      if (typeof window !== 'undefined') {
        // Nettoyer le localStorage et sessionStorage
        localStorage.clear()
        sessionStorage.clear()
        
        // Rediriger vers login avec un paramètre pour forcer la reconnexion
        window.location.href = '/login?logout=true'
      }
    }
  }

  // Fonction d'inscription
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      // Récupérer le token CSRF
      const csrfToken = await getCSRFToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register/`, {
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/current-user/`, {
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/change-password/`, {
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


  // TEMPORAIREMENT : Simuler un utilisateur connecté sans authentification
  useEffect(() => {
    // Éviter les re-exécutions multiples
    if (user !== null) return
    
    // Simuler un utilisateur de démonstration
    const mockUser: User = {
      id: 1,
      username: 'demo',
      email: 'demo@sar.sn',
      first_name: 'Utilisateur',
      last_name: 'Démo',
      full_name: 'Utilisateur Démo',
      avatar: '',
      avatar_url: '',
      phone_number: '+221 33 123 45 67',
      office_phone: '+221 33 123 45 68',
      position: 'Employé',
      department: 'IT',
      matricule: 'SAR001',
      manager: null,
      manager_info: null,
      is_active: true,
      is_staff: false,
      is_superuser: false,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      google_id: '',
      google_email: '',
      google_avatar_url: '',
      is_google_connected: false
    }
    
    // Simuler un chargement initial
    setIsLoading(true)
    const timer = setTimeout(() => {
      setUser(mockUser)
      setIsLoading(false)
    }, 500)
    
    // Nettoyer le timer si le composant est démonté
    return () => clearTimeout(timer)
  }, []) // Dépendances vides pour s'exécuter une seule fois

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
