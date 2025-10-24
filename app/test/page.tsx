"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

export default function TestPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <LayoutWrapper>
      {/* Conteneur principal */}
      <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        <Card className={`${isFullscreen ? 'h-screen border-0 rounded-none' : 'h-[90vh]'} overflow-hidden`}>
            
            <CardContent className="p-0 relative">
              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du site SAR...</p>
                  </div>
                </div>
              )}

                  {/* intégration iframe pour sar.sn */}
              <iframe
                id="sar-iframe"
                src="https://www.sar.sn/Recrutement/"
                className="w-full h-full border-0"
                style={{ 
                  height: isFullscreen ? 'calc(100vh - 4rem)' : '90vh',
                  minHeight: '400px'
                }}
                onLoad={handleIframeLoad}
                title="Site de Recrutement SAR"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                loading="lazy"
              />
            </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
