"use client"

import { useState, useEffect } from 'react'

interface TabletInfo {
  isTablet: boolean
  isSpecificTablet: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  screenSize: {
    width: number
    height: number
  }
  specificDevice?: 'ipad-mini' | 'ipad-air' | 'ipad-pro' | 'surface-pro' | 'zenbook-fold' | 'nest-hub'
}

// Définition des résolutions spécifiques des tablettes
const TABLET_RESOLUTIONS = {
  'ipad-mini': { width: 768, height: 1024 },
  'ipad-air': { width: 820, height: 1180 },
  'ipad-pro': { width: 1024, height: 1366 },
  'surface-pro': { width: 912, height: 1368 },
  'zenbook-fold': { width: 853, height: 1280 },
  'nest-hub': { width: 1024, height: 600 }
} as const

export function useTabletDetection(): TabletInfo {
  const [tabletInfo, setTabletInfo] = useState<TabletInfo>({
    isTablet: false,
    isSpecificTablet: false,
    deviceType: 'desktop',
    screenSize: { width: 0, height: 0 }
  })

  useEffect(() => {
    const detectTablet = () => {
      if (typeof window === 'undefined') return

      const width = window.innerWidth
      const height = window.innerHeight

      // Détection des tablettes spécifiques
      let specificDevice: keyof typeof TABLET_RESOLUTIONS | undefined
      let isSpecificTablet = false

      for (const [device, resolution] of Object.entries(TABLET_RESOLUTIONS)) {
        if (
          (width === resolution.width && height === resolution.height) ||
          (width === resolution.height && height === resolution.width) // Orientation portrait/paysage
        ) {
          specificDevice = device as keyof typeof TABLET_RESOLUTIONS
          isSpecificTablet = true
          break
        }
      }

      // Détection générale des tablettes
      const isTablet = isSpecificTablet || (
        width >= 768 && width <= 1024 && height >= 600 && height <= 1368
      ) || (
        height >= 768 && height <= 1024 && width >= 600 && width <= 1368
      )

      // Détermination du type d'appareil
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (width < 768) {
        deviceType = 'mobile'
      } else if (isTablet) {
        deviceType = 'tablet'
      }

      setTabletInfo({
        isTablet,
        isSpecificTablet,
        deviceType,
        screenSize: { width, height },
        specificDevice
      })
    }

    // Détection initiale
    detectTablet()

    // Écoute des changements de taille
    window.addEventListener('resize', detectTablet)
    window.addEventListener('orientationchange', detectTablet)

    return () => {
      window.removeEventListener('resize', detectTablet)
      window.removeEventListener('orientationchange', detectTablet)
    }
  }, [])

  return tabletInfo
}








