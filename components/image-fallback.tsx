"use client"

import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageFallbackProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: (error: any) => void
  fallbackComponent?: React.ReactNode
}

export function ImageFallback({
  src,
  alt,
  className,
  onLoad,
  onError,
  fallbackComponent
}: ImageFallbackProps) {

  // Si pas d'URL d'image, afficher directement le fallback
  if (!src || src.trim() === '') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-gray-100 rounded-lg",
        className
      )}>
        {fallbackComponent || (
          <div className="text-center p-4">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">Aucune image</p>
          </div>
        )}
      </div>
    )
  }

  // Afficher directement l'image sans état de chargement
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  )
}

