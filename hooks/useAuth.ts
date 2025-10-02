import { useAuth as useAuthContext } from '@/contexts/AuthContext'

/**
 * Hook principal pour l'authentification
 * Fournit toutes les fonctions et états d'authentification
 */
export const useAuth = useAuthContext

/**
 * Hook pour la connexion avec gestion d'état
 */
export const useLogin = () => {
  const { login, isLoading } = useAuthContext()

  return {
    login,
    isLoading,
  }
}

/**
 * Hook pour la déconnexion
 */
export const useLogout = () => {
  const { logout } = useAuthContext()

  return {
    logout,
  }
}

/**
 * Hook pour l'inscription
 */
export const useRegister = () => {
  const { register, isLoading } = useAuthContext()

  return {
    register,
    isLoading,
  }
}

/**
 * Hook pour la gestion du profil utilisateur
 */
export const useProfile = () => {
  const { user, updateProfile, changePassword, refreshUser, isLoading } = useAuthContext()

  return {
    user,
    updateProfile,
    changePassword,
    refreshUser,
    isLoading,
  }
}

/**
 * Hook pour vérifier les permissions (version simplifiée)
 */
export const usePermissions = () => {
  const { user } = useAuthContext()

  // Pour la version simplifiée, tous les utilisateurs connectés ont les mêmes permissions de base
  // Les permissions avancées peuvent être gérées via is_staff et is_superuser
  const isManager = user?.is_staff || false
  const isAdmin = user?.is_superuser || false
  const isSuperAdmin = user?.is_superuser || false

  return {
    isManager,
    isAdmin,
    isSuperAdmin,
  }
}


