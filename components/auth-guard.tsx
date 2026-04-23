"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/loader'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string // URL de redirection si non authentifié (par défaut: /login)
}

/**
 * Composant de protection d'authentification
 * Redirige vers login (ou redirectTo) si l'utilisateur n'est pas authentifié
 */
export function AuthGuard({ children, fallback, redirectTo }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Rediriger vers la destination spécifiée ou login par défaut
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          const currentPath = window.location.pathname
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        }
      } else {
        setIsChecking(false)
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Éviter les re-renders inutiles en mémorisant l'état
  const shouldShowFallback = isLoading || isChecking
  const shouldShowContent = !isLoading && !isChecking && isAuthenticated

  // Afficher le fallback pendant la vérification
  if (shouldShowFallback) {
    return fallback || <PageLoader />
  }

  // Si pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null
  }

  // Afficher le contenu protégé seulement si toutes les conditions sont remplies
  if (shouldShowContent) {
    return <>{children}</>
  }

  // État de transition - ne rien afficher
  return null
}

/**
 * Hook pour vérifier l'authentification dans un composant
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return false
    }
    return isAuthenticated
  }

  return {
    isAuthenticated,
    isLoading,
    requireAuth,
  }
}