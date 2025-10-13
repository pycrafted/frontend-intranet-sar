"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

// Hook pour détecter la taille du widget (même que SafetyCounter)
function useWidgetSize() {
  const [size, setSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium')
  
  useEffect(() => {
    const updateSize = () => {
      const element = document.querySelector('[data-widget-id="video"]')
      if (element) {
        const width = element.clientWidth
        if (width < 300) setSize('small')
        else if (width < 500) setSize('medium')
        else if (width < 800) setSize('large')
        else setSize('full')
      }
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  return size
}

export function VideoWidget() {
  const [isClient, setIsClient] = useState(false)
  const widgetSize = useWidgetSize()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Configuration responsive basée sur la taille du widget (même que SafetyCounter)
  const getResponsiveConfig = () => {
    const baseConfig = {
      small: {
        cardHeight: 'h-[20rem] sm:h-[22rem]',
        contentPadding: 'p-0',
        videoHeight: 'h-full'
      },
      medium: {
        cardHeight: 'h-[22rem] sm:h-[24rem] lg:h-[28rem]',
        contentPadding: 'p-0',
        videoHeight: 'h-full'
      },
      large: {
        cardHeight: 'h-[22rem] sm:h-[24rem] lg:h-[28rem]',
        contentPadding: 'p-0',
        videoHeight: 'h-full'
      },
      full: {
        cardHeight: 'h-[24rem] sm:h-[28rem] lg:h-[32rem]',
        contentPadding: 'p-0',
        videoHeight: 'h-full'
      }
    }
    
    return baseConfig[widgetSize] || baseConfig.medium
  }

  const config = getResponsiveConfig()

  if (!isClient) {
    return (
      <Card className={`${config.cardHeight} flex flex-col overflow-hidden relative bg-black border-0`}>
        <CardContent className={`${config.contentPadding} flex-1 flex flex-col justify-center items-center`}>
          <div className="animate-pulse w-full h-full">
            <div className="bg-gray-700 rounded-lg w-full h-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // URL de la vidéo YouTube
  const videoUrl = "https://www.youtube.com/watch?v=QOTPxn9Wg-A&t=5s"
  const videoId = "QOTPxn9Wg-A"
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=5&autoplay=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1&controls=1&showinfo=0`

  return (
    <Card className={`${config.cardHeight} flex flex-col overflow-hidden relative bg-black border-0 hover:shadow-xl transition-all duration-500 group`}>
      <CardContent className={`${config.contentPadding} flex-1 flex flex-col`}>
        {/* Vidéo YouTube intégrée - Prend toute la carte */}
        <div className={`${config.videoHeight} w-full rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <iframe
            src={embedUrl}
            title="Vidéo SAR"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            autoPlay
            loop
            muted
          />
        </div>
      </CardContent>
    </Card>
  )
}
