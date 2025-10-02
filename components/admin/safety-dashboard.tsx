"use client"

import { useState, useEffect } from 'react'
import { useSafetyData } from '@/hooks/useSafetyData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Award,
  Calendar,
  Clock,
  BarChart3,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function SafetyDashboard() {
  const { safetyData, loading, error, fetchSafetyData } = useSafetyData()

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


  // Calcul des statistiques
  const getStatistics = () => {
    if (!safetyData) return null

    const sarDays = safetyData.days_without_incident_sar || 0
    const eeDays = safetyData.days_without_incident_ee || 0
    const totalDays = Math.max(sarDays, eeDays)
    
    return {
      sarDays,
      eeDays,
      totalDays,
      sarAppreciation: getAppreciation(sarDays),
      eeAppreciation: getAppreciation(eeDays),
      overallAppreciation: getAppreciation(totalDays)
    }
  }

  const stats = getStatistics()

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

  if (!safetyData || !stats) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Aucune donnée de sécurité disponible
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* En-tête simplifié - bouton actualiser supprimé */}


      {/* Message de performance */}
      {stats.totalDays >= 365 && (
        <Card className="bg-white border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Excellent !</span>
              <span>Plus d'un an sans accident. Continuez à maintenir ces excellentes performances de sécurité.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalDays < 30 && (
        <Card className="bg-white border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Attention :</span>
              <span>La performance de sécurité est en dessous de 30 jours. Il est recommandé de revoir les procédures de sécurité.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
