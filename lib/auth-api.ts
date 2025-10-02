// Configuration de l'API d'authentification
const AUTH_API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth`

// Types pour l'API (version simplifiée)
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar?: string
  avatar_url?: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

export interface Department {
  id: string
  name: string
  icon: string
}

export interface Role {
  id: string
  name: string
  icon: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Fonction utilitaire pour les requêtes API
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${AUTH_API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Inclure les cookies de session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        data,
        message: data.message,
      }
    } else {
      return {
        success: false,
        error: data.detail || data.error || 'Erreur API',
      }
    }
  } catch (error) {
    console.error('Erreur API:', error)
    return {
      success: false,
      error: 'Erreur de connexion',
    }
  }
}

// Services d'authentification
export const authApi = {
  // Connexion
  async login(data: LoginData): Promise<ApiResponse<{ user: User; message: string }>> {
    return apiRequest('/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Déconnexion
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiRequest('/logout/', {
      method: 'POST',
    })
  },

  // Inscription
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; message: string }>> {
    return apiRequest('/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiRequest('/current-user/')
  },

  // Mettre à jour le profil
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiRequest('/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Changer le mot de passe
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest('/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword,
      }),
    })
  },

  // Récupérer les départements
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    return apiRequest('/departments/')
  },

  // Récupérer les rôles
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return apiRequest('/roles/')
  },

  // Upload d'avatar
  async uploadAvatar(file: File): Promise<ApiResponse<{ message: string; avatar_url: string }>> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await fetch(`${AUTH_API_BASE_URL}/upload-avatar/`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message,
        }
      } else {
        return {
          success: false,
          error: data.error || 'Erreur lors de l\'upload de l\'avatar',
        }
      }
    } catch (error) {
      console.error('Erreur upload avatar:', error)
      return {
        success: false,
        error: 'Erreur de connexion',
      }
    }
  },

  // Récupérer la liste des utilisateurs (admin)
  async getUsers(params?: {
    department?: string
    role?: string
    is_active?: boolean
    search?: string
    page?: number
    page_size?: number
  }): Promise<ApiResponse<{ results: User[]; count: number; next: string | null; previous: string | null }>> {
    const queryParams = new URLSearchParams()
    
    if (params?.department) queryParams.append('department', params.department)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/users/?${queryString}` : '/users/'
    
    return apiRequest(endpoint)
  },

  // Récupérer un utilisateur spécifique (admin)
  async getUser(id: number): Promise<ApiResponse<User>> {
    return apiRequest(`/users/${id}/`)
  },

  // Mettre à jour un utilisateur (admin)
  async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    return apiRequest(`/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Supprimer un utilisateur (admin)
  async deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/users/${id}/`, {
      method: 'DELETE',
    })
  },

  // Activer/Désactiver un utilisateur (admin)
  async toggleUserStatus(id: number): Promise<ApiResponse<{ user: User; message: string }>> {
    return apiRequest(`/users/${id}/toggle-status/`, {
      method: 'POST',
    })
  },
}

// Fonctions utilitaires
export const authUtils = {
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (user: User | null): boolean => {
    return !!user && user.is_active
  },

  // Vérifier les permissions (version simplifiée)
  hasRole: (user: User | null, roles: string | string[]): boolean => {
    if (!user) return false
    // Pour la version simplifiée, on utilise is_staff et is_superuser
    return user.is_staff || user.is_superuser
  },

  // Vérifier si l'utilisateur est manager ou plus
  isManager: (user: User | null): boolean => {
    if (!user) return false
    return user.is_staff || user.is_superuser
  },

  // Vérifier si l'utilisateur est admin ou plus
  isAdmin: (user: User | null): boolean => {
    if (!user) return false
    return user.is_superuser
  },

  // Vérifier si l'utilisateur est super admin
  isSuperAdmin: (user: User | null): boolean => {
    if (!user) return false
    return user.is_superuser
  },

  // Obtenir l'initiale du nom
  getInitials: (user: User | null): string => {
    if (!user) return '??'
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  },

  // Formater le nom complet
  getFullName: (user: User | null): string => {
    if (!user) return 'Utilisateur'
    return user.full_name || `${user.first_name} ${user.last_name}`
  },
}


