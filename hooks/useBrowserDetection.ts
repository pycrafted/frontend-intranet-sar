"use client"

import { useState, useEffect } from 'react'
import { detectBrowser, getBrowserCompatibleClasses, shouldUseFallbacks, type BrowserInfo } from '@/lib/browser-detection'

export function useBrowserDetection() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isEdge: false,
    isChrome: false,
    isFirefox: false,
    isSafari: false,
    isIE: false,
    supportsBackdropFilter: false,
    supportsCSSGrid: false,
    supportsFlexbox: false,
    version: '0'
  })

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setBrowserInfo(detectBrowser())
  }, [])

  const compatibleClasses = getBrowserCompatibleClasses(browserInfo)
  const useFallbacks = shouldUseFallbacks(browserInfo)

  return {
    browserInfo,
    compatibleClasses,
    useFallbacks,
    isClient
  }
}






