"use client"

import { useState, useEffect } from 'react'
import { useSafetyData } from '@/hooks/useSafetyData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Save,
  RotateCcw,
  Info,
  Target,
  Award
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SafetyDataFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function SafetyDataForm({ onSuccess, onError }: SafetyDataFormProps) {
  const { safetyData, loading, error, updateSafetyData, resetSafetyData } = useSafetyData()
  
  // États locaux pour les formulaires
  const [sarDays, setSarDays] = useState<number>(0)
  const [eeDays, setEeDays] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Synchroniser les données locales avec les données du hook
  useEffect(() => {
    if (safetyData) {
      setSarDays(safetyData.days_without_incident_sar || 0)
      setEeDays(safetyData.days_without_incident_ee || 0)
    }
  }, [safetyData])

  // Fonction pour obtenir l'appréciation basée sur le nombre de jours
  const getAppreciation = (days: number) => {
    if (days >= 365) return { text: "Excellent", color: "bg-green-100 text-green-800", icon: Award }
    if (days >= 180) return { text: "Très bien", color: "bg-blue-100 text-blue-800", icon: CheckCircle }
    if (days >= 90) return { text: "Bien", color: "bg-yellow-100 text-yellow-800", icon: TrendingUp }
    if (days >= 30) return { text: "Correct", color: "bg-orange-100 text-orange-800", icon: Target }
    if (days >= 7) return { text: "À améliorer", color: "bg-red-100 text-red-800", icon: AlertTriangle }
    return { text: "Attention", color: "bg-red-100 text-red-800", icon: AlertTriangle }
  }

  // Fonction pour obtenir la couleur de l'indicateur
  const getIndicatorColor = (days: number) => {
    if (days >= 365) return "bg-green-500"
    if (days >= 180) return "bg-blue-500"
    if (days >= 90) return "bg-yellow-500"
    if (days >= 30) return "bg-orange-500"
    return "bg-red-500"
  }

  // Validation des données
  const validateData = () => {
    if (sarDays < 0) {
      setLocalError("Le nombre de jours sans accident SAR ne peut pas être négatif.")
      return false
    }
    if (eeDays < 0) {
      setLocalError("Le nombre de jours sans accident EE ne peut pas être négatif.")
      return false
    }
    return true
  }

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateData()) return

    setIsSubmitting(true)
    setLocalError(null)
    setSuccessMessage(null)

    try {
      await updateSafetyData({
        days_without_incident_sar: sarDays,
        days_without_incident_ee: eeDays
      })
      
      setSuccessMessage("Données de sécurité mises à jour avec succès !")
      onSuccess?.()
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setLocalError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gestion de la réinitialisation
  const handleReset = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser les données de sécurité ? Cette action remettra les compteurs à zéro.")) {
      return
    }

    setIsResetting(true)
    setLocalError(null)
    setSuccessMessage(null)

    try {
      await resetSafetyData()
      setSarDays(0)
      setEeDays(0)
      setSuccessMessage("Données de sécurité réinitialisées avec succès !")
      onSuccess?.()
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation'
      setLocalError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsResetting(false)
    }
  }

  // Affichage de chargement
  if (loading && !safetyData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Chargement des données de sécurité...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Affichage d'erreur
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des données de sécurité : {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const sarAppreciation = getAppreciation(sarDays)
  const eeAppreciation = getAppreciation(eeDays)

  return (
    <div className="space-y-6">
      {/* Formulaire simplifié */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Mise à jour des données de sécurité</CardTitle>
          {safetyData?.updated_at && (
            <p className="text-sm text-gray-600">
              Dernière mise à jour : {format(new Date(safetyData.updated_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champs de saisie avec appréciations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sar-days" className="text-sm font-medium">
                  Jours sans accident SAR (Interne)
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="sar-days"
                    type="number"
                    min="0"
                    value={sarDays}
                    onChange={(e) => setSarDays(parseInt(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <Badge className={sarAppreciation.color}>
                    {sarAppreciation.text}
                  </Badge>
                </div>
              </div>
              <div>
                <Label htmlFor="ee-days" className="text-sm font-medium">
                  Jours sans accident EE (Externe)
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="ee-days"
                    type="number"
                    min="0"
                    value={eeDays}
                    onChange={(e) => setEeDays(parseInt(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <Badge className={eeAppreciation.color}>
                    {eeAppreciation.text}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages d'erreur et de succès */}
            {localError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{localError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isResetting}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {isResetting ? 'Réinitialisation...' : 'Réinitialiser'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
