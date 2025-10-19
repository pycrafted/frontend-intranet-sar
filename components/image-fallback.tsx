"use client"

import { useState, useEffect } from 'react'
import { ImageIcon, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageFallbackProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: (error: any) => void
  fallbackComponent?: React.ReactNode
  showRetryButton?: boolean
  maxRetries?: number
}

export function ImageFallback({
  src,
  alt,
  className,
  onLoad,
  onError,
  fallbackComponent,
  showRetryButton = true,
  maxRetries = 3
}: ImageFallbackProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleLoad = () => {
    setImageLoaded(true)
    setImageError(false)
    onLoad?.()
  }

  const handleError = (error: any) => {
    setImageError(true)
    setImageLoaded(false)
    onError?.(error)
  }

  const handleRetry = async () => {
    if (retryCount >= maxRetries) return
    
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Attendre un peu avant de réessayer
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Créer une nouvelle image pour forcer le rechargement
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      setImageLoaded(true)
      setImageError(false)
      setIsRetrying(false)
    }
    
    img.onerror = () => {
      setImageError(true)
      setImageLoaded(false)
      setIsRetrying(false)
    }
    
    // Ajouter un timestamp pour éviter le cache
    const separator = src.includes('?') ? '&' : '?'
    img.src = `${src}${separator}_retry=${Date.now()}`
  }

  // Réinitialiser l'état quand l'URL change
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
    setRetryCount(0)
  }, [src])

  if (imageLoaded) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    )
  }

  if (imageError) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-gray-100 rounded-lg",
        className
      )}>
        {fallbackComponent || (
          <div className="text-center p-4">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">Image non disponible</p>
            <p className="text-xs text-gray-400 break-all">{src}</p>
          </div>
        )}
        
        {showRetryButton && retryCount < maxRetries && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="text-xs"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Nouvelle tentative...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Réessayer ({retryCount}/{maxRetries})
                </>
              )}
            </Button>
          </div>
        )}
        
        {retryCount >= maxRetries && (
          <div className="mt-2 text-center">
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Échec après {maxRetries} tentatives
            </p>
          </div>
        )}
      </div>
    )
  }

  // État de chargement
  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-gray-100 rounded-lg animate-pulse",
      className
    )}>
      <div className="text-center p-4">
        <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
        <p className="text-sm text-gray-500">Chargement de l'image...</p>
      </div>
    </div>
  )
}
