"use client"

import { useState, useEffect } from "react"

export function VideoWidget() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // ID de la vidéo institutionnelle SAR
  const videoId = "3f0c7ea611f5f970f280df7cf5c8587b"

  if (!isClient) {
    return (
      <div className="w-full h-[20rem] sm:h-[24rem] lg:h-[28rem] bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white/50 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-2"></div>
          <p className="text-sm">Chargement de la vidéo...</p>
        </div>
      </div>
    )
  }

  // URL de la vidéo Cloudflare avec autoplay et boucle
  const cloudflarePlayerUrl = `https://customer-eas3f2kom74sgnh6.cloudflarestream.com/${videoId}/iframe?autoplay=true&loop=true&muted=true&controls=true&preload=auto`

  return (
    <div className="w-full h-[20rem] sm:h-[24rem] lg:h-[28rem] rounded-lg overflow-hidden">
      <iframe
        src={cloudflarePlayerUrl}
        title="Vidéo Institutionnelle SAR"
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="eager"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    </div>
  )
}
