"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { useState, useEffect } from "react"

interface RecrutementPageProps {
  isMainSidebarCollapsed?: boolean
}

function RecrutementPageContent({ isMainSidebarCollapsed = false }: RecrutementPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Calculer la largeur du sidebar : 64px (rétracté) ou 256px (développé)
  const sidebarWidth = isMainSidebarCollapsed ? 64 : 256

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <>
      {/* Conteneur principal - collé au navbar, sans bordure, comme reseau-social */}
      <div 
        className="fixed m-0 p-0 flex flex-col bg-white"
        style={{
          top: '64px', // h-16 du navbar (4rem = 64px)
          bottom: '37px', // Hauteur du footer
          left: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : '0px',
          right: '0px',
          transition: 'left 0.3s ease-in-out'
        }}
      >
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
          src="https://sar-sirh-feature-sar-recipe-28977020.dev.odoo.com/fr/jobs"
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          title="Site de Recrutement SAR"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          loading="lazy"
        />
      </div>
    </>
  )
}

export default function RecrutementPage() {
  return (
    <LayoutWrapper>
      <RecrutementPageContent />
    </LayoutWrapper>
  )
}
