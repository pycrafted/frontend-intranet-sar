/**
 * Utilitaires pour harmoniser les tailles de police cross-browser
 */

export interface FontSizeConfig {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
}

export const FONT_SIZES: FontSizeConfig = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem'
}

export const LINE_HEIGHTS: FontSizeConfig = {
  xs: '1rem',
  sm: '1.25rem',
  base: '1.5rem',
  lg: '1.75rem',
  xl: '1.75rem',
  '2xl': '2rem',
  '3xl': '2.25rem',
  '4xl': '2.5rem',
  '5xl': '1',
  '6xl': '1'
}

export function getFontSize(size: keyof FontSizeConfig): string {
  return FONT_SIZES[size]
}

export function getLineHeight(size: keyof FontSizeConfig): string {
  return LINE_HEIGHTS[size]
}

export function getFontSizeWithLineHeight(size: keyof FontSizeConfig): string {
  return `${FONT_SIZES[size]} / ${LINE_HEIGHTS[size]}`
}

/**
 * Génère des styles CSS inline pour forcer les tailles de police
 */
export function getForcedFontStyles(size: keyof FontSizeConfig): React.CSSProperties {
  return {
    fontSize: FONT_SIZES[size],
    lineHeight: LINE_HEIGHTS[size],
    fontFamily: 'inherit'
  }
}

/**
 * Classes CSS pour forcer les tailles de police sur Edge
 */
export const FORCED_FONT_CLASSES = {
  xs: 'forced-text-xs',
  sm: 'forced-text-sm',
  base: 'forced-text-base',
  lg: 'forced-text-lg',
  xl: 'forced-text-xl',
  '2xl': 'forced-text-2xl',
  '3xl': 'forced-text-3xl',
  '4xl': 'forced-text-4xl',
  '5xl': 'forced-text-5xl',
  '6xl': 'forced-text-6xl'
}

/**
 * Détecte si le navigateur est Edge
 */
export function isEdge(): boolean {
  if (typeof window === 'undefined') return false
  return /Edg\//.test(window.navigator.userAgent)
}

/**
 * Applique les styles de police appropriés selon le navigateur
 */
export function getResponsiveFontClass(
  baseSize: keyof FontSizeConfig,
  smSize?: keyof FontSizeConfig,
  lgSize?: keyof FontSizeConfig
): string {
  const baseClass = `text-${baseSize}`
  const smClass = smSize ? `sm:text-${smSize}` : ''
  const lgClass = lgSize ? `lg:text-${lgSize}` : ''
  
  return `${baseClass} ${smClass} ${lgClass}`.trim()
}





