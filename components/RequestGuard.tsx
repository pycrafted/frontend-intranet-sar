"use client"

import { useEffect, useRef, useState } from 'react'

interface RequestGuardProps {
  children: React.ReactNode
  maxRequestsPerMinute?: number
  onRateLimitExceeded?: () => void
}

export function RequestGuard({ 
  children, 
  maxRequestsPerMinute = 30,
  onRateLimitExceeded 
}: RequestGuardProps) {
  const requestCount = useRef(0)
  const lastReset = useRef(Date.now())
  const [isRateLimited, setIsRateLimited] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeDiff = now - lastReset.current
      
      // Reset le compteur chaque minute
      if (timeDiff >= 60000) {
        requestCount.current = 0
        lastReset.current = now
        setIsRateLimited(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Intercepter les requêtes fetch
  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const now = Date.now()
      const timeDiff = now - lastReset.current
      
      // Reset le compteur si plus d'une minute s'est écoulée
      if (timeDiff >= 60000) {
        requestCount.current = 0
        lastReset.current = now
        setIsRateLimited(false)
      }

      // Vérifier la limite de taux
      if (requestCount.current >= maxRequestsPerMinute) {
        console.warn(`🚫 [REQUEST_GUARD] Limite de taux dépassée: ${requestCount.current}/${maxRequestsPerMinute} requêtes/minute`)
        setIsRateLimited(true)
        
        if (onRateLimitExceeded) {
          onRateLimitExceeded()
        }
        
        // Retourner une erreur 429
        return Promise.reject(new Error('Rate limit exceeded'))
      }

      requestCount.current++
      console.log(`📊 [REQUEST_GUARD] Requête ${requestCount.current}/${maxRequestsPerMinute}`)
      
      try {
        return await originalFetch(...args)
      } catch (error) {
        console.error('❌ [REQUEST_GUARD] Erreur de requête:', error)
        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [maxRequestsPerMinute, onRateLimitExceeded])

  if (isRateLimited) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Trop de requêtes</h2>
          <p className="text-gray-600 mb-4">
            Veuillez patienter avant de recharger la page
          </p>
          <div className="text-sm text-gray-500">
            Limite: {maxRequestsPerMinute} requêtes/minute
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
