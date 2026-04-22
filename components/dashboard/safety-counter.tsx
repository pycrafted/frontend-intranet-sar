"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, Building2, Users, AlertTriangle, Pencil, RotateCcw } from "lucide-react"
import { useSafetyData } from "@/hooks/useSafetyData"
import { useAuth } from "@/hooks/useAuth"
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
  const { safetyData, loading, error, updateSafetyData } = useSafetyData()
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const [isAnimating, setIsAnimating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const widgetSize = useWidgetSize()

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Configuration responsive basée sur la taille du widget et l'écran
  const getResponsiveConfig = () => {
    const baseConfig = {
      small: {
        cardHeight: 'h-[26rem] sm:h-[28rem]',
        headerPadding: 'pb-2 sm:pb-3',
        contentPadding: 'p-2 sm:p-3',
        // Optimisé pour mobile
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
        cardHeight: 'h-[26rem] sm:h-[28rem] lg:h-[28rem]',
        headerPadding: 'pb-2 sm:pb-3 lg:pb-4',
        contentPadding: 'p-2 sm:p-2.5 md:p-3 lg:p-4',
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
        cardHeight: 'h-[26rem] sm:h-[28rem] lg:h-[28rem]',
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
        <CardHeader className="relative pb-2 pt-4 px-5 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-white leading-tight">
                Sécurité du Travail
              </CardTitle>
              <p className="text-xs text-blue-200/80 mt-0.5">
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
        <CardHeader className="relative pb-2 pt-4 px-5 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-white leading-tight">
                Sécurité du Travail
              </CardTitle>
              <p className="text-xs text-red-200/80 mt-0.5">
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
        <CardHeader className="relative pb-2 pt-4 px-5 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-white leading-tight">
                Sécurité du Travail
              </CardTitle>
              <p className="text-xs text-blue-200/80 mt-0.5">
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
    <>
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

      <CardHeader className="relative pb-2 pt-4 px-5 flex-shrink-0 z-10 safety-header">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-200/50 group-hover:scale-105 transition-all duration-300">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-bold text-white leading-tight safety-title">
                Sécurité du Travail
              </CardTitle>
              <p className="text-xs text-blue-200/80 mt-0.5 safety-subtitle">
                Compteurs de jours sans accident
              </p>
            </div>
          </div>

          {/* Numéro vert SAR */}
          {widgetSize !== 'small' && (
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-extrabold text-green-900 drop-shadow-lg bg-green-300/95 px-3 py-1.5 rounded-lg inline-block safety-phone shadow-md tracking-wide">
                📞 800 00 34 34
              </div>
              <div className="text-xs text-white font-semibold mt-1 safety-phone-label drop-shadow">
                Numéro vert SAR
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`relative flex-1 flex flex-col justify-center ${config.contentPadding} z-10`}>
        {/* Les deux compteurs côte à côte */}
        <div className={`grid ${config.gridCols} gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 h-full safety-counter`}>
          {/* Compteur SAR */}
          <div className={`flex flex-col justify-center items-center ${config.spaceY} bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl sm:rounded-2xl ${config.counterPadding} border border-blue-400/30 backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-blue-600/40 transition-all duration-500 my-2 sm:my-3 md:my-4`}>
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
            
          </div>

          {/* Compteur EE */}
          <div className={`flex flex-col justify-center items-center ${config.spaceY} bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl sm:rounded-2xl ${config.counterPadding} border border-emerald-400/30 backdrop-blur-sm group-hover:from-emerald-500/30 group-hover:to-emerald-600/40 transition-all duration-500 my-2 sm:my-3 md:my-4`}>
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
            
          </div>
        </div>

      </CardContent>

      {/* Bouton admin — bas droite */}
      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          title="Modifier les données de sécurité"
          className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white shadow-md backdrop-blur-sm"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </Card>

    <SafetyEditModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      safetyData={safetyData}
      onSave={updateSafetyData}
    />
    </>
  )
}

// ── Modal édition sécurité ─────────────────────────────────────────────────────
interface SafetyEditModalProps {
  open: boolean
  onClose: () => void
  safetyData: NonNullable<ReturnType<typeof useSafetyData>['safetyData']>
  onSave: (data: Record<string, unknown>) => Promise<unknown>
}

function SafetyEditModal({ open, onClose, safetyData, onSave }: SafetyEditModalProps) {
  const [sarCount,   setSarCount]   = useState(0)
  const [eeCount,    setEeCount]    = useState(0)
  const [isSaving,   setIsSaving]   = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [confirmSar, setConfirmSar] = useState(false)
  const [confirmEe,  setConfirmEe]  = useState(false)

  useEffect(() => {
    if (!open) return
    setSarCount(safetyData.days_without_incident_sar)
    setEeCount(safetyData.days_without_incident_ee)
    setModalError(null)
    setConfirmSar(false)
    setConfirmEe(false)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setIsSaving(true)
    setModalError(null)
    try {
      await onSave({
        days_without_incident_sar: sarCount,
        days_without_incident_ee: eeCount,
      })
      onClose()
    } catch {
      setModalError('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async (type: 'sar' | 'ee') => {
    setIsSaving(true)
    setModalError(null)
    try {
      if (type === 'sar') {
        await onSave({ days_without_incident_sar: 0 })
        setSarCount(0)
        setConfirmSar(false)
      } else {
        await onSave({ days_without_incident_ee: 0 })
        setEeCount(0)
        setConfirmEe(false)
      }
    } catch {
      setModalError('Erreur lors de la mise à jour.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ width: '500px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Modifier les compteurs de sécurité
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* ── Section SAR ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-800">SAR — Interne</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nombre de jours sans accident SAR</Label>
                <input
                  type="number" min={0} value={sarCount}
                  onChange={e => setSarCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              {/* Remettre à 0 SAR */}
              {confirmSar ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <RotateCcw className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                  <p className="flex-1 text-xs text-orange-700">Remettre le compteur SAR à 0 (accident aujourd'hui) ?</p>
                  <button onClick={() => handleReset('sar')} disabled={isSaving}
                    className="px-2.5 py-1 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50">
                    {isSaving ? '...' : 'Confirmer'}
                  </button>
                  <button onClick={() => setConfirmSar(false)} disabled={isSaving}
                    className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmSar(true)}
                  className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-700 transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Accident aujourd'hui (SAR) — remettre à 0
                </button>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* ── Section EE ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-slate-800">EE — Externe</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nombre de jours sans accident EE</Label>
                <input
                  type="number" min={0} value={eeCount}
                  onChange={e => setEeCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              {/* Remettre à 0 EE */}
              {confirmEe ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <RotateCcw className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                  <p className="flex-1 text-xs text-orange-700">Remettre le compteur EE à 0 (accident aujourd'hui) ?</p>
                  <button onClick={() => handleReset('ee')} disabled={isSaving}
                    className="px-2.5 py-1 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50">
                    {isSaving ? '...' : 'Confirmer'}
                  </button>
                  <button onClick={() => setConfirmEe(false)} disabled={isSaving}
                    className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmEe(true)}
                  className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-700 transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Accident aujourd'hui (EE) — remettre à 0
                </button>
              )}
            </div>
          </div>

          {modalError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {modalError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Annuler</Button>
          <Button onClick={handleSave} disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
