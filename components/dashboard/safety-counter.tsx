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

  // Configuration responsive basée sur la taille du widget
  const getResponsiveConfig = () => {
    switch (widgetSize) {
      case 'small':
        return {
          cardHeight: 'h-[20rem]',
          headerPadding: 'pb-2',
          contentPadding: 'p-3',
          titleSize: 'text-lg',
          subtitleSize: 'text-xs',
          counterSize: 'text-4xl',
          labelSize: 'text-sm',
          smallLabelSize: 'text-xs',
          iconSize: 'h-4 w-4',
          gridCols: 'grid-cols-1',
          counterPadding: 'p-3',
          spaceY: 'space-y-2'
        }
      case 'medium':
        return {
          cardHeight: 'h-[28rem]',
          headerPadding: 'pb-3',
          contentPadding: 'p-4',
          titleSize: 'text-xl',
          subtitleSize: 'text-sm',
          counterSize: 'text-5xl',
          labelSize: 'text-base',
          smallLabelSize: 'text-sm',
          iconSize: 'h-5 w-5',
          gridCols: 'grid-cols-2',
          counterPadding: 'p-4',
          spaceY: 'space-y-3'
        }
      case 'large':
        return {
          cardHeight: 'h-[28rem]',
          headerPadding: 'pb-4',
          contentPadding: 'p-6',
          titleSize: 'text-2xl',
          subtitleSize: 'text-base',
          counterSize: 'text-6xl',
          labelSize: 'text-lg',
          smallLabelSize: 'text-sm',
          iconSize: 'h-6 w-6',
          gridCols: 'grid-cols-2',
          counterPadding: 'p-6',
          spaceY: 'space-y-4'
        }
      case 'full':
        return {
          cardHeight: 'h-[32rem]',
          headerPadding: 'pb-6',
          contentPadding: 'p-8',
          titleSize: 'text-3xl',
          subtitleSize: 'text-lg',
          counterSize: 'text-7xl',
          labelSize: 'text-xl',
          smallLabelSize: 'text-base',
          iconSize: 'h-8 w-8',
          gridCols: 'grid-cols-2',
          counterPadding: 'p-8',
          spaceY: 'space-y-6'
        }
      default:
        return {
          cardHeight: 'h-[28rem]',
          headerPadding: 'pb-3',
          contentPadding: 'p-4',
          titleSize: 'text-xl',
          subtitleSize: 'text-sm',
          counterSize: 'text-5xl',
          labelSize: 'text-base',
          smallLabelSize: 'text-sm',
          iconSize: 'h-5 w-5',
          gridCols: 'grid-cols-2',
          counterPadding: 'p-4',
          spaceY: 'space-y-3'
        }
    }
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
    <Card className={`${config.cardHeight} flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0 hover:shadow-2xl transition-all duration-500 group`} data-widget-id="safety">
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

      <CardHeader className={`relative ${config.headerPadding} flex-shrink-0 z-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${config.counterPadding} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-200/50 group-hover:scale-105 transition-all duration-300`}>
              <Shield className={`${config.iconSize} text-white`} />
            </div>
            <div>
              <CardTitle className={`${config.titleSize} font-bold text-white group-hover:text-blue-200 transition-colors duration-300`}>
                🛡️ Sécurité du Travail
              </CardTitle>
              <p className={`${config.subtitleSize} text-blue-200/80 font-medium`}>
                Compteurs de jours sans accident
              </p>
            </div>
          </div>
          
          {/* Numéro vert SAR - masqué sur petit écran */}
          {widgetSize !== 'small' && (
            <div className="text-right">
              <div className={`${config.labelSize} font-bold text-green-800 drop-shadow-lg bg-green-100/90 px-3 py-1 rounded-lg`}>
                📞 800 00 34 34
              </div>
              <div className={`${config.smallLabelSize} text-green-700 font-semibold mt-1`}>
                Numéro vert SAR
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`relative flex-1 flex flex-col justify-center ${config.contentPadding} z-10`}>
        {/* Les deux compteurs côte à côte */}
        <div className={`grid ${config.gridCols} gap-4 h-full`}>
          {/* Compteur SAR */}
          <div className={`flex flex-col justify-center items-center ${config.spaceY} bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl ${config.counterPadding} border border-blue-400/30 backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-blue-600/40 transition-all duration-500`}>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className={`${config.iconSize} text-blue-300`} />
              <span className={`${config.smallLabelSize} font-semibold text-blue-200 uppercase tracking-wide`}>
                SAR
              </span>
            </div>
            
            <div className={`${config.counterSize} font-black text-white mb-2 transition-all duration-1000 drop-shadow-2xl ${
              isAnimating ? 'scale-110' : 'scale-100'
            }`}>
              {safetyData.daysWithoutIncidentSAR}
            </div>
            
            <div className="text-center space-y-1">
              <div className={`${config.labelSize} font-bold text-blue-100`}>
                {safetyData.daysWithoutIncidentSAR === 1 ? 'Jour' : 'Jours'}
              </div>
              <div className={`${config.smallLabelSize} text-blue-200/80`}>
                sans accident
              </div>
              <div className={`${config.smallLabelSize} text-blue-300/70`}>
                interne
              </div>
            </div>
            
            {/* Indicateur de performance */}
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className={`${config.smallLabelSize} text-green-300 font-medium`}>
                {safetyData.appreciation_sar}
              </span>
            </div>
          </div>

          {/* Compteur EE */}
          <div className={`flex flex-col justify-center items-center ${config.spaceY} bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-2xl ${config.counterPadding} border border-emerald-400/30 backdrop-blur-sm group-hover:from-emerald-500/30 group-hover:to-emerald-600/40 transition-all duration-500`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className={`${config.iconSize} text-emerald-300`} />
              <span className={`${config.smallLabelSize} font-semibold text-emerald-200 uppercase tracking-wide`}>
                EE
              </span>
            </div>
            
            <div className={`${config.counterSize} font-black text-white mb-2 transition-all duration-1000 drop-shadow-2xl ${
              isAnimating ? 'scale-110' : 'scale-100'
            }`}>
              {safetyData.daysWithoutIncidentEE}
            </div>
            
            <div className="text-center space-y-1">
              <div className={`${config.labelSize} font-bold text-emerald-100`}>
                {safetyData.daysWithoutIncidentEE === 1 ? 'Jour' : 'Jours'}
              </div>
              <div className={`${config.smallLabelSize} text-emerald-200/80`}>
                sans accident
              </div>
              <div className={`${config.smallLabelSize} text-emerald-300/70`}>
                externe
              </div>
            </div>
            
            {/* Indicateur de performance */}
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
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
