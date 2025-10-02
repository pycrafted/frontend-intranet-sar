"use client"

import { useState, useEffect } from 'react'
import { useSafetyData } from '@/hooks/useSafetyData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Award,
  RefreshCw,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SafetyDataTableProps {
  onRefresh?: () => void
}

export function SafetyDataTable({ onRefresh }: SafetyDataTableProps) {
  const { safetyData, loading, error, fetchSafetyData } = useSafetyData()
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Fonction de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchSafetyData()
      onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
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
      {/* Tableau simplifié */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Données de sécurité actuelles</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Jours sans accident</TableHead>
                  <TableHead>Appréciation</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">SAR (Interne)</TableCell>
                  <TableCell className="text-lg font-semibold">{stats.sarDays} jours</TableCell>
                  <TableCell>
                    <Badge className={stats.sarAppreciation.color}>
                      {stats.sarAppreciation.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(safetyData.updated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EE (Externe)</TableCell>
                  <TableCell className="text-lg font-semibold">{stats.eeDays} jours</TableCell>
                  <TableCell>
                    <Badge className={stats.eeAppreciation.color}>
                      {stats.eeAppreciation.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(safetyData.updated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
