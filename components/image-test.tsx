"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ImageTestProps {
  imageUrl: string
  alt?: string
}

export function ImageTest({ imageUrl, alt = "Test image" }: ImageTestProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorDetails, setErrorDetails] = useState<string>('')

  const handleImageLoad = () => {
    console.log('✅ [IMAGE_TEST] Image chargée avec succès:', imageUrl)
    setImageStatus('success')
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    console.error('❌ [IMAGE_TEST] Erreur de chargement image:', {
      src: imageUrl,
      error: e,
      target: target
    })
    setImageStatus('error')
    setErrorDetails(`Erreur de chargement: ${target.src}`)
  }

  const testImageUrl = async () => {
    console.log('🔍 [IMAGE_TEST] Test de l\'URL:', imageUrl)
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      console.log('🔍 [IMAGE_TEST] Réponse HEAD:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      console.error('❌ [IMAGE_TEST] Erreur fetch:', error)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Test d'image</h3>
        <Button size="sm" onClick={testImageUrl}>
          Tester URL
        </Button>
      </div>
      
      <div className="text-sm text-gray-600">
        <p><strong>URL:</strong> {imageUrl}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            imageStatus === 'loading' ? 'bg-yellow-100 text-yellow-800' :
            imageStatus === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {imageStatus === 'loading' ? 'Chargement...' :
             imageStatus === 'success' ? 'Succès' : 'Erreur'}
          </span>
        </p>
        {errorDetails && (
          <p className="text-red-600 text-xs mt-1">{errorDetails}</p>
        )}
      </div>

      <div className="relative">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-48 object-cover rounded border"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {imageStatus === 'loading' && (
          <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-gray-500">Chargement...</div>
          </div>
        )}
        {imageStatus === 'error' && (
          <div className="absolute inset-0 bg-red-50 rounded flex items-center justify-center">
            <div className="text-red-500 text-center">
              <div>❌ Erreur de chargement</div>
              <div className="text-xs mt-1">Vérifiez la console pour plus de détails</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

