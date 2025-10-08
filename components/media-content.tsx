"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Image as ImageIcon, 
  Video, 
  Images, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaContentProps {
  type: 'image' | 'gallery' | 'video' | 'checklist'
  images?: string[]
  videoUrl?: string
  videoPoster?: string
  checklistItems?: Array<{
    id: string
    text: string
    checked: boolean
  }>
  className?: string
}

export function MediaContent({ 
  type, 
  images = [], 
  videoUrl, 
  videoPoster,
  checklistItems = [],
  className 
}: MediaContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const renderImageImages = () => {
    if (images.length === 0) return null

    if (images.length === 1) {
      // Log de débogage pour les images
      console.log('🖼️ [MEDIA_CONTENT] Chargement image:', {
        src: images[0],
        isLocalhost: images[0]?.includes('localhost'),
        isHttp: images[0]?.startsWith('http://'),
        isHttps: images[0]?.startsWith('https://')
      });

      return (
        <div className="relative group">
          <img
            src={images[0]}
            alt="Publication image"
            className="w-full h-96 object-cover rounded-lg"
            onLoad={() => console.log('✅ [MEDIA_CONTENT] Image chargée avec succès:', images[0])}
            onError={(e) => {
              console.error('❌ [MEDIA_CONTENT] Erreur de chargement image:', {
                src: images[0],
                error: e,
                target: e.target
              });
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
            <Button 
              size="sm" 
              variant="secondary" 
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              onClick={() => setIsFullscreen(true)}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Images className="w-5 h-5 text-purple-600" />
          </div>
          <span>Galerie ({images.length} images)</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {images.slice(0, 4).map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Images image ${index + 1}`}
                className="w-full h-72 object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => {
                  setCurrentImageIndex(index)
                  setIsFullscreen(true)
                }}
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    +{images.length - 4}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-2">
                  <Images className="w-4 h-4 text-gray-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {images.length > 4 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
              <Images className="w-4 h-4" />
              <span>Voir toutes les {images.length} images</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderVideo = () => {
    if (!videoUrl) return null

    return (
      <div className="space-y-4 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="p-2 bg-red-100 rounded-lg">
            <Video className="w-5 h-5 text-red-600" />
          </div>
          <span>Vidéo</span>
        </div>
        
        <div className="relative group">
          <video
            src={videoUrl}
            className="w-full h-96 object-cover rounded-lg"
            poster={videoPoster}
            controls
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
            <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-gray-800 ml-1" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderChecklist = () => {
    if (checklistItems.length === 0) return null

    const checkedCount = checklistItems.filter(item => item.checked).length

    return (
      <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckSquare className="w-5 h-5 text-green-600" />
          </div>
          <span>Checklist ({checkedCount}/{checklistItems.length})</span>
        </div>
        <div className="space-y-3">
          {checklistItems.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200",
                item.checked 
                  ? "bg-green-500 border-green-500 shadow-sm" 
                  : "border-gray-300 hover:border-green-400"
              )}>
                {item.checked && <CheckSquare className="w-3 h-3 text-white" />}
              </div>
              <span className={cn(
                "text-base font-medium flex-1",
                item.checked ? "line-through text-gray-500" : "text-gray-800"
              )}>
                {item.text}
              </span>
              {item.checked && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
          ))}
          
          {checklistItems.length > 5 && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
                <span>+{checklistItems.length - 5} autres éléments</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFullscreenImages = () => {
    if (!isFullscreen || images.length === 0) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-full">
          <img
            src={images[currentImageIndex]}
            alt={`Images image ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={() => setCurrentImageIndex((prev) => 
                  prev === 0 ? images.length - 1 : prev - 1
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={() => setCurrentImageIndex((prev) => 
                  prev === images.length - 1 ? 0 : prev + 1
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn("w-full", className)}>
        {type === 'gallery' && renderImageImages()}
        {type === 'video' && renderVideo()}
        {type === 'checklist' && renderChecklist()}
        {type === 'image' && images.length > 0 && (
          <div className="relative group">
            <img
              src={images[0]}
              alt="Publication image"
              className="w-full h-96 object-cover rounded-lg"
              onLoad={() => console.log('✅ [MEDIA_CONTENT] Image chargée avec succès:', images[0])}
              onError={(e) => {
                console.error('❌ [MEDIA_CONTENT] Erreur de chargement image:', {
                  src: images[0],
                  error: e,
                  target: e.target
                });
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
              <Button 
                size="sm" 
                variant="secondary" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={() => setIsFullscreen(true)}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {renderFullscreenImages()}
    </>
  )
}
