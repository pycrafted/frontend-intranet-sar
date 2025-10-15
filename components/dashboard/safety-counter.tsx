"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Building2, Users, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { useSafetyData } from "@/hooks/useSafetyData"
import Image from "next/image"

// Hook pour détecter la taille du widget
function useWidgetSize() {
  const [size, setSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium')
  
  useEffect(() => {
    // Détecter la taille basée sur la largeur du conteneur parent
    const updateSize = () => {
      const element = document.querySelector('[data-widget-id="safety"]')
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

export function SafetyCounter() {
  const { safetyData, loading, error } = useSafetyData()
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)
  const widgetSize = useWidgetSize()

  useEffect(() => {
    // Marquer comme côté client
    setIsClient(true)
    setCurrentTime(new Date())
    
    // Animation du compteur au chargement
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Mise à jour de l'heure chaque seconde
  useEffect(() => {
    if (!isClient) return
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [isClient])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Configuration responsive basée sur la taille du widget et l'écran
  const getResponsiveConfig = () => {
    const baseConfig = {
      small: {
        cardHeight: 'h-[20rem] sm:h-[22rem]',
        headerPadding: 'pb-2 sm:pb-3',
        contentPadding: 'p-2 sm:p-3',
        titleSize: 'text-base sm:text-xl', // Même taille que "Accès Rapide" sur desktop
        subtitleSize: 'text-xs sm:text-sm', // Même taille que "Applications & Services" sur mobile
        counterSize: 'text-2xl sm:text-3xl',
        labelSize: 'text-xs sm:text-sm',
        smallLabelSize: 'text-xs',
        iconSize: 'h-4 w-4 sm:h-5 sm:w-5',
        gridCols: 'grid-cols-2', // Toujours 2 colonnes même sur mobile
        counterPadding: 'p-1.5 sm:p-2',
        spaceY: 'space-y-1'
      },
      medium: {
        cardHeight: 'h-[22rem] sm:h-[24rem] lg:h-[28rem]',
        headerPadding: 'pb-2 sm:pb-3 lg:pb-4',
        contentPadding: 'p-2 sm:p-3 lg:p-4',
        titleSize: 'text-lg sm:text-xl', // Même taille que "Accès Rapide" sur desktop
        subtitleSize: 'text-sm', // Même taille que "Applications & Services"
        counterSize: 'text-3xl sm:text-4xl lg:text-5xl',
        labelSize: 'text-sm sm:text-base lg:text-lg',
        smallLabelSize: 'text-xs sm:text-sm',
        iconSize: 'h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6',
        gridCols: 'grid-cols-2', // Toujours 2 colonnes
        counterPadding: 'p-2 sm:p-3 lg:p-4',
        spaceY: 'space-y-1 sm:space-y-2'
      },
      large: {
        cardHeight: 'h-[22rem] sm:h-[24rem] lg:h-[28rem]',
        headerPadding: 'pb-3 sm:pb-4 lg:pb-6',
        contentPadding: 'p-3 sm:p-4 lg:p-6',
        titleSize: 'text-xl', // Même taille que "Accès Rapide" sur desktop
        subtitleSize: 'text-sm', // Même taille que "Applications & Services"
        counterSize: 'text-4xl sm:text-5xl lg:text-6xl',
        labelSize: 'text-base sm:text-lg lg:text-xl',
        smallLabelSize: 'text-sm sm:text-base',
        iconSize: 'h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8',
        gridCols: 'grid-cols-2', // Toujours 2 colonnes
        counterPadding: 'p-3 sm:p-4 lg:p-6',
        spaceY: 'space-y-2 sm:space-y-3'
      },
      full: {
        cardHeight: 'h-[24rem] sm:h-[28rem] lg:h-[32rem]',
        headerPadding: 'pb-4 sm:pb-6 lg:pb-8',
        contentPadding: 'p-3 sm:p-4 lg:p-6 xl:p-8',
        titleSize: 'text-xl', // Même taille que "Accès Rapide" sur desktop
        subtitleSize: 'text-sm', // Même taille que "Applications & Services"
        counterSize: 'text-5xl sm:text-6xl lg:text-7xl',
        labelSize: 'text-lg sm:text-xl lg:text-2xl',
        smallLabelSize: 'text-sm sm:text-base lg:text-lg',
        iconSize: 'h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10',
        gridCols: 'grid-cols-2', // Toujours 2 colonnes
        counterPadding: 'p-4 sm:p-6 lg:p-8',
        spaceY: 'space-y-3 sm:space-y-4 lg:space-y-6'
      }
    }
    
    return baseConfig[widgetSize] || baseConfig.medium
  }

  const config = getResponsiveConfig()

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <Card className={`${config.cardHeight} flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0`}>
        <CardHeader className={`relative ${config.headerPadding} flex-shrink-0 z-10`}>
          <div className="flex items-center gap-3">
            <div className={`${config.counterPadding} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg`}>
              <Shield className={`${config.iconSize} text-white`} />
            </div>
            <div>
              <CardTitle className={`${config.titleSize} font-bold text-white`}>
                🛡️ Sécurité du Travail
              </CardTitle>
              <p className={`${config.subtitleSize} text-blue-200/80 font-medium`}>
                Chargement...
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`relative flex-1 flex flex-col justify-center ${config.contentPadding} z-10`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Chargement des données de sécurité...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${config.cardHeight} flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0`}>
        <CardHeader className={`relative ${config.headerPadding} flex-shrink-0 z-10`}>
          <div className="flex items-center gap-3">
            <div className={`${config.counterPadding} bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg`}>
              <AlertTriangle className={`${config.iconSize} text-white`} />
            </div>
            <div>
              <CardTitle className={`${config.titleSize} font-bold text-white`}>
                🛡️ Sécurité du Travail
              </CardTitle>
              <p className={`${config.subtitleSize} text-red-200/80 font-medium`}>
                Erreur de chargement
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`relative flex-1 flex flex-col justify-center ${config.contentPadding} z-10`}>
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-white/80 mb-2">Erreur lors du chargement des données</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!safetyData) {
    return (
      <Card className={`${config.cardHeight} flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0`}>
        <CardHeader className={`relative ${config.headerPadding} flex-shrink-0 z-10`}>
          <div className="flex items-center gap-3">
            <div className={`${config.counterPadding} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg`}>
              <Shield className={`${config.iconSize} text-white`} />
            </div>
            <div>
              <CardTitle className={`${config.titleSize} font-bold text-white`}>
                🛡️ Sécurité du Travail
              </CardTitle>
              <p className={`${config.subtitleSize} text-blue-200/80 font-medium`}>
                Aucune donnée disponible
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`relative flex-1 flex flex-col justify-center ${config.contentPadding} z-10`}>
          <div className="text-center">
            <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <p className="text-white/80">Aucune donnée de sécurité disponible</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${config.cardHeight} flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0 hover:shadow-2xl transition-all duration-500 group safety-widget-mobile`} data-widget-id="safety">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0">
        <Image
          src="/industrial-safety-equipment.png"
          alt="Équipements de sécurité industrielle"
          fill
          className="object-cover opacity-90 group-hover:opacity-95 transition-opacity duration-500"
          priority
        />
        {/* Overlay minimal pour laisser voir l'image au maximum */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/15 via-blue-900/10 to-indigo-900/15" />
        {/* Motifs décoratifs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full translate-y-12 -translate-x-12" />
      </div>

      <CardHeader className={`relative ${config.headerPadding} flex-shrink-0 z-10 p-3 sm:p-4 lg:p-6 safety-header`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`${config.counterPadding} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-blue-200/50 group-hover:scale-105 transition-all duration-300`}>
              <Shield className={`${config.iconSize} text-white`} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className={`${config.titleSize} font-bold text-white group-hover:text-blue-200 transition-colors duration-300 leading-tight safety-title widget-title safety-widget-title`}>
                Sécurité du Travail
              </CardTitle>
              <p className={`${config.subtitleSize} text-blue-200/80 font-medium leading-tight mt-1 safety-subtitle widget-subtitle safety-widget-subtitle`}>
                Compteurs de jours sans accident
              </p>
            </div>
          </div>
          
          {/* Numéro vert SAR - Responsive */}
          {widgetSize !== 'small' && (
            <div className="text-center sm:text-right flex-shrink-0">
              <div className={`${config.labelSize} font-bold text-green-800 drop-shadow-lg bg-green-100/90 px-2 sm:px-3 py-1 rounded-lg inline-block safety-phone`}>
                📞 800 00 34 34
              </div>
              <div className={`${config.smallLabelSize} text-green-700 font-semibold mt-1 safety-phone-label`}>
                Numéro vert SAR
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`relative flex-1 flex flex-col justify-center ${config.contentPadding} z-10`}>
        {/* Les deux compteurs côte à côte */}
        <div className={`grid ${config.gridCols} gap-2 sm:gap-3 lg:gap-4 h-full safety-counter`}>
          {/* Compteur SAR */}
          <div className={`flex flex-col justify-center items-center ${config.spaceY} bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl sm:rounded-2xl ${config.counterPadding} border border-blue-400/30 backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-blue-600/40 transition-all duration-500`}>
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Building2 className={`${config.iconSize} text-blue-300`} />
              <span className={`${config.smallLabelSize} font-semibold text-blue-200 uppercase tracking-wide`}>
                SAR
              </span>
            </div>
            
            <div className={`${config.counterSize} font-black text-white mb-1 sm:mb-2 transition-all duration-1000 drop-shadow-2xl safety-counter-number ${
              isAnimating ? 'scale-110' : 'scale-100'
            }`}>
              {safetyData.daysWithoutIncidentSAR}
            </div>
            
            <div className="text-center space-y-0.5 sm:space-y-1">
              <div className={`${config.labelSize} font-bold text-blue-100 safety-counter-label`}>
                {safetyData.daysWithoutIncidentSAR === 1 ? 'Jour' : 'Jours'}
              </div>
              <div className={`${config.smallLabelSize} text-blue-200/80 safety-counter-subtitle`}>
                sans accident
              </div>
              <div className={`${config.smallLabelSize} text-blue-300/70 safety-counter-subtitle`}>
                interne
              </div>
            </div>
            
            {/* Indicateur de performance */}
            <div className="flex items-center gap-1 mt-1 sm:mt-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
              <span className={`${config.smallLabelSize} text-green-300 font-medium`}>
                {safetyData.appreciation_sar}
              </span>
            </div>
          </div>

          {/* Compteur EE */}
          <div className={`flex flex-col justify-center items-center ${config.spaceY} bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl sm:rounded-2xl ${config.counterPadding} border border-emerald-400/30 backdrop-blur-sm group-hover:from-emerald-500/30 group-hover:to-emerald-600/40 transition-all duration-500`}>
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Users className={`${config.iconSize} text-emerald-300`} />
              <span className={`${config.smallLabelSize} font-semibold text-emerald-200 uppercase tracking-wide`}>
                EE
              </span>
            </div>
            
            <div className={`${config.counterSize} font-black text-white mb-1 sm:mb-2 transition-all duration-1000 drop-shadow-2xl safety-counter-number ${
              isAnimating ? 'scale-110' : 'scale-100'
            }`}>
              {safetyData.daysWithoutIncidentEE}
            </div>
            
            <div className="text-center space-y-0.5 sm:space-y-1">
              <div className={`${config.labelSize} font-bold text-emerald-100 safety-counter-label`}>
                {safetyData.daysWithoutIncidentEE === 1 ? 'Jour' : 'Jours'}
              </div>
              <div className={`${config.smallLabelSize} text-emerald-200/80 safety-counter-subtitle`}>
                sans accident
              </div>
              <div className={`${config.smallLabelSize} text-emerald-300/70 safety-counter-subtitle`}>
                externe
              </div>
            </div>
            
            {/* Indicateur de performance */}
            <div className="flex items-center gap-1 mt-1 sm:mt-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
              <span className={`${config.smallLabelSize} text-green-300 font-medium`}>
                {safetyData.appreciation_ee}
              </span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
