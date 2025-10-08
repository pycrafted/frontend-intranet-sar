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
  // TEMPORAIREMENT : Désactiver complètement l'authentification
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: 'demo',
    email: 'demo@sar.sn',
    first_name: 'Utilisateur',
    last_name: 'Démo',
    full_name: 'Utilisateur Démo',
    avatar: '/placeholder-user.jpg',
    avatar_url: '/placeholder-user.jpg',
    phone_number: '+221 33 123 45 67',
    office_phone: '+221 33 123 45 68',
    position: 'Employé',
    department: 'IT',
    matricule: 'SAR001',
    manager: null,
    manager_info: null,
    is_active: true,
    is_staff: true,
    is_superuser: true,
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    google_id: null,
    google_email: null,
    google_avatar_url: null,
    is_google_connected: false
  })
  const [isLoading, setIsLoading] = useState(false)

  // TEMPORAIREMENT : Toujours authentifié
  const isAuthenticated = true

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

  // TEMPORAIREMENT : Fonction de connexion désactivée
  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 [AUTH] Connexion désactivée - Mode démo activé')
    return { success: true }
  }

  // TEMPORAIREMENT : Fonction de déconnexion désactivée
  const logout = async (): Promise<void> => {
    console.log('🔐 [AUTH] Déconnexion désactivée - Mode démo activé')
    // Ne rien faire en mode démo
  }

  // TEMPORAIREMENT : Fonction d'inscription désactivée
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 [AUTH] Inscription désactivée - Mode démo activé')
    return { success: true }
  }

  // TEMPORAIREMENT : Fonction de mise à jour du profil désactivée
  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 [AUTH] Mise à jour profil désactivée - Mode démo activé')
    return { success: true }
  }

  // TEMPORAIREMENT : Fonction de changement de mot de passe désactivée
  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 [AUTH] Changement mot de passe désactivé - Mode démo activé')
    return { success: true }
  }

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
