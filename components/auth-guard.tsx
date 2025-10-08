"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * TEMPORAIREMENT : Composant de protection d'authentification DÉSACTIVÉ
 * Toutes les pages sont accessibles sans authentification
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  // AUTHENTIFICATION DÉSACTIVÉE - Toujours afficher le contenu
  console.log('🔓 [AUTH_GUARD] Authentification désactivée - Accès libre')
  return <>{children}</>
}

/**
 * TEMPORAIREMENT : Hook d'authentification DÉSACTIVÉ
 */
export function useAuthGuard() {
  // AUTHENTIFICATION DÉSACTIVÉE - Toujours autoriser l'accès
  console.log('🔓 [AUTH_GUARD] Hook d\'authentification désactivé - Accès libre')
  
  const requireAuth = () => {
    console.log('🔓 [AUTH_GUARD] requireAuth() - Toujours autoriser')
    return true  // Toujours autoriser
  }

  return {
    isAuthenticated: true,  // Toujours authentifié
    isLoading: false,       // Pas de chargement
    requireAuth,
  }
}