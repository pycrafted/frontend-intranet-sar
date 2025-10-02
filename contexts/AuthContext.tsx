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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/csrf/`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.csrfToken
      }
      return null
    } catch (error) {
      return null
    }
  }

  // Fonction pour récupérer l'utilisateur actuel
  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/current-user/', { requireAuth: true })
      
      if (response.ok) {
        const userData = await response.json()
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
      console.log('🔍 [AUTH] Erreur lors de la récupération de l\'utilisateur:', error)
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
      setIsLoading(true)

      const response = await api.post('/auth/login/', data, { requireAuth: false })

      if (response.ok) {
        const result = await response.json()
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


  // Vérifier l'authentification au chargement et périodiquement
  useEffect(() => {
    let isInitialLoad = true
    let isChecking = false // Éviter les vérifications simultanées
    let hasRedirected = false // Éviter les redirections multiples
    
    const checkAuth = async (isPeriodicCheck = false) => {
      // Éviter les vérifications simultanées
      if (isChecking) return
      isChecking = true
      
      try {
        // Ne mettre isLoading à true que lors du chargement initial
        if (isInitialLoad) {
          setIsLoading(true)
        }
        
        const userData = await fetchCurrentUser()
        if (userData) {
          setUser(userData)
          hasRedirected = false // Reset le flag si l'utilisateur est authentifié
        } else {
          setUser(null)
          // Si pas d'utilisateur, rediriger vers login seulement si c'est un check initial ET qu'on n'a pas déjà redirigé
          if (isInitialLoad && !hasRedirected && typeof window !== 'undefined' && window.location.pathname !== '/login') {
            hasRedirected = true
            console.log('🔍 [AUTH] Redirection vers /login')
            window.location.href = '/login'
          }
        }
      } catch (error) {
        console.log('🔍 [AUTH] Erreur lors de la vérification:', error)
        setUser(null)
        // En cas d'erreur, rediriger vers login seulement si c'est un check initial ET qu'on n'a pas déjà redirigé
        if (isInitialLoad && !hasRedirected && typeof window !== 'undefined' && window.location.pathname !== '/login') {
          hasRedirected = true
          console.log('🔍 [AUTH] Redirection vers /login (erreur)')
          window.location.href = '/login'
        }
      } finally {
        if (isInitialLoad) {
          setIsLoading(false)
          isInitialLoad = false
        }
        isChecking = false
      }
    }
    
    // Vérification initiale
    checkAuth()
    
    // Vérifier l'authentification toutes les 10 minutes SEULEMENT si l'utilisateur est connecté
    const authInterval = setInterval(() => {
      // Ne vérifier que si on a un token et qu'on n'est pas sur la page de login
      const token = localStorage.getItem('token')
      if (token && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        checkAuth(true)
      }
    }, 10 * 60 * 1000)
    
    // Vérifier l'authentification quand la fenêtre reprend le focus
    // MAIS seulement si l'utilisateur était déjà authentifié (évite les fermetures de modal)
    const handleFocus = () => {
      if (typeof window !== 'undefined' && 
          window.location.pathname !== '/login') {
        // Vérifier si l'utilisateur est connecté via le token localStorage
        const token = localStorage.getItem('token')
        if (token) {
          checkAuth(true)
        }
      }
    }
    
    // Vérifier l'authentification lors du changement de visibilité de la page
    // Plus stable que l'event focus
    const handleVisibilityChange = () => {
      if (typeof window !== 'undefined' && 
          !document.hidden && 
          window.location.pathname !== '/login') {
        // Vérifier si l'utilisateur est connecté via le token localStorage
        const token = localStorage.getItem('token')
        if (token) {
          checkAuth(true)
        }
      }
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(authInterval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // SUPPRESSION de [user] - c'était la cause de la boucle infinie

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
