/**
 * Détection du navigateur pour l'application de styles compatibles
 */

export interface BrowserInfo {
  isEdge: boolean
  isChrome: boolean
  isFirefox: boolean
  isSafari: boolean
  isIE: boolean
  supportsBackdropFilter: boolean
  supportsCSSGrid: boolean
  supportsFlexbox: boolean
  version: string
}

export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      isEdge: false,
      isChrome: false,
      isFirefox: false,
      isSafari: false,
      isIE: false,
      supportsBackdropFilter: false,
      supportsCSSGrid: false,
      supportsFlexbox: false,
      version: '0'
    }
  }

  const userAgent = window.navigator.userAgent
  const isEdge = /Edg\//.test(userAgent)
  const isChrome = /Chrome\//.test(userAgent) && !isEdge
  const isFirefox = /Firefox\//.test(userAgent)
  const isSafari = /Safari\//.test(userAgent) && !isChrome && !isEdge
  const isIE = /Trident\//.test(userAgent) || /MSIE/.test(userAgent)

  // Détection des fonctionnalités CSS
  const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(4px)')
  const supportsCSSGrid = CSS.supports('display', 'grid')
  const supportsFlexbox = CSS.supports('display', 'flex')

  // Extraction de la version
  let version = '0'
  if (isEdge) {
    const match = userAgent.match(/Edg\/(\d+)/)
    version = match ? match[1] : '0'
  } else if (isChrome) {
    const match = userAgent.match(/Chrome\/(\d+)/)
    version = match ? match[1] : '0'
  } else if (isFirefox) {
    const match = userAgent.match(/Firefox\/(\d+)/)
    version = match ? match[1] : '0'
  } else if (isSafari) {
    const match = userAgent.match(/Version\/(\d+)/)
    version = match ? match[1] : '0'
  }

  return {
    isEdge,
    isChrome,
    isFirefox,
    isSafari,
    isIE,
    supportsBackdropFilter,
    supportsCSSGrid,
    supportsFlexbox,
    version
  }
}

export function getBrowserCompatibleClasses(browserInfo: BrowserInfo) {
  const classes = {
    // Classes pour les gradients
    gradient: browserInfo.isEdge ? 'gradient-fallback' : '',
    
    // Classes pour backdrop-filter
    backdropBlur: browserInfo.supportsBackdropFilter ? 'backdrop-blur-xl' : 'backdrop-blur-fallback',
    
    // Classes pour les grilles
    grid: browserInfo.supportsCSSGrid ? 'grid' : 'flex flex-wrap',
    
    // Classes pour les animations
    animation: browserInfo.isEdge ? 'transition-all' : 'transition-all duration-300',
    
    // Classes pour les transforms
    transform: browserInfo.isEdge ? 'transform' : 'transform',
    
    // Classes pour les flexbox
    flex: browserInfo.supportsFlexbox ? 'flex' : 'block'
  }

  return classes
}

export function shouldUseFallbacks(browserInfo: BrowserInfo): boolean {
  return browserInfo.isEdge || browserInfo.isIE || !browserInfo.supportsBackdropFilter
}








