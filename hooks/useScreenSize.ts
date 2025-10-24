"use client"

import { useState, useEffect } from 'react'

export interface ScreenSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isSmallMobile: boolean
  isLargeMobile: boolean
  isSmallTablet: boolean
  isLargeTablet: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  orientation: 'portrait' | 'landscape'
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmallMobile: false,
    isLargeMobile: false,
    isSmallTablet: false,
    isLargeTablet: false,
    deviceType: 'desktop',
    orientation: 'landscape'
  })

  useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window === 'undefined') return

      const width = window.innerWidth
      const height = window.innerHeight

      // Déterminer l'orientation
      const orientation = width > height ? 'landscape' : 'portrait'

      // Déterminer le type d'appareil
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      // Sous-catégories
      const isSmallMobile = width < 480
      const isLargeMobile = width >= 480 && width < 768
      const isSmallTablet = width >= 768 && width < 900
      const isLargeTablet = width >= 900 && width < 1024

      // Type d'appareil
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (isMobile) deviceType = 'mobile'
      else if (isTablet) deviceType = 'tablet'

      setScreenSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isSmallMobile,
        isLargeMobile,
        isSmallTablet,
        isLargeTablet,
        deviceType,
        orientation
      })
    }

    // Détection initiale
    updateScreenSize()

    // Écoute des changements
    window.addEventListener('resize', updateScreenSize)
    window.addEventListener('orientationchange', updateScreenSize)

    return () => {
      window.removeEventListener('resize', updateScreenSize)
      window.removeEventListener('orientationchange', updateScreenSize)
    }
  }, [])

  return screenSize
}

