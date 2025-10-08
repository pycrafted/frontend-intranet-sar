"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Composant de protection d'authentification
 * Redirige vers login si l'utilisateur n'est pas authentifié
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Rediriger vers login avec l'URL de retour
        const currentPath = window.location.pathname
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      } else {
        setIsChecking(false)
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Éviter les re-renders inutiles en mémorisant l'état
  const shouldShowFallback = isLoading || isChecking
  const shouldShowContent = !isLoading && !isChecking && isAuthenticated

  // Afficher le fallback pendant la vérification
  if (shouldShowFallback) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
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