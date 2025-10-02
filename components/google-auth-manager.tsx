"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api-client'

interface GoogleAuthManagerProps {
  onGoogleAuthComplete?: (success: boolean) => void
}

export function GoogleAuthManager({ onGoogleAuthComplete }: GoogleAuthManagerProps) {
  const { user, isAuthenticated } = useAuth()
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(false)
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null)

  useEffect(() => {
    const checkAndSetupGoogleAuth = async () => {
      console.log('🔍 [GOOGLE_AUTH_MANAGER] Vérification de l\'authentification Google')
      console.log('🔍 [GOOGLE_AUTH_MANAGER] isAuthenticated:', isAuthenticated)
      console.log('🔍 [GOOGLE_AUTH_MANAGER] user:', user)
      
      if (!isAuthenticated || !user) {
        console.log('❌ [GOOGLE_AUTH_MANAGER] Utilisateur non authentifié ou manquant')
        return
      }

      // Vérifier si l'utilisateur est déjà connecté à Google
      console.log('🔍 [GOOGLE_AUTH_MANAGER] is_google_connected:', user.is_google_connected)
      console.log('🔍 [GOOGLE_AUTH_MANAGER] google_email:', user.google_email)
      console.log('🔍 [GOOGLE_AUTH_MANAGER] google_id:', user.google_id)
      
      if (user.is_google_connected) {
        console.log('✅ [GOOGLE_AUTH_MANAGER] Utilisateur déjà connecté à Google')
        onGoogleAuthComplete?.(true)
        return
      }

      // Récupérer l'URL d'authentification Google
      try {
        console.log('🔍 [GOOGLE_AUTH_MANAGER] Récupération de l\'URL d\'authentification Google...')
        setIsCheckingGoogle(true)
        const response = await api.get('/auth/google/get-auth-url/', { requireAuth: true })
        
        console.log('🔍 [GOOGLE_AUTH_MANAGER] Réponse API:', response.status, response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 [GOOGLE_AUTH_MANAGER] Données reçues:', data)
          
          if (data.auth_url) {
            setGoogleAuthUrl(data.auth_url)
            console.log('🔗 [GOOGLE_AUTH_MANAGER] URL d\'authentification Google récupérée:', data.auth_url)
            
            // Optionnel : ouvrir automatiquement l'authentification Google
            // window.open(data.auth_url, '_blank', 'width=500,height=600')
          } else {
            console.error('❌ [GOOGLE_AUTH_MANAGER] Aucune URL d\'authentification dans la réponse')
          }
        } else {
          const errorData = await response.json()
          console.error('❌ [GOOGLE_AUTH_MANAGER] Erreur lors de la récupération de l\'URL Google:', errorData)
          onGoogleAuthComplete?.(false)
        }
      } catch (error) {
        console.error('❌ [GOOGLE_AUTH_MANAGER] Erreur lors de la vérification Google:', error)
        onGoogleAuthComplete?.(false)
      } finally {
        setIsCheckingGoogle(false)
      }
    }

    checkAndSetupGoogleAuth()
  }, [isAuthenticated, user, onGoogleAuthComplete])

  // Fonction pour ouvrir l'authentification Google
  const openGoogleAuth = () => {
    if (googleAuthUrl) {
      window.open(googleAuthUrl, '_blank', 'width=500,height=600')
    }
  }

  // Ne rien afficher si l'utilisateur n'est pas connecté ou est déjà connecté à Google
  if (!isAuthenticated || !user || user.is_google_connected) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Connecter Google
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Connectez votre compte Google pour accéder à Gmail, Drive et Calendar
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={openGoogleAuth}
                disabled={!googleAuthUrl || isCheckingGoogle}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingGoogle ? 'Chargement...' : 'Connecter Google'}
              </button>
              
              <button
                onClick={() => onGoogleAuthComplete?.(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
