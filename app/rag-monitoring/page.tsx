'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, TrendingUp, Clock, CheckCircle, XCircle, Activity } from 'lucide-react'

interface MonitoringData {
  success: boolean
  period_hours: number
  performance: {
    total_searches: number
    success_rate: number
    avg_response_time: number
    method_breakdown: {
      vectorial: {
        total_searches: number
        successful_searches: number
        avg_response_time: number
        avg_results: number
      }
      heuristic: {
        total_searches: number
        successful_searches: number
        avg_response_time: number
        avg_results: number
      }
      hybrid: {
        total_searches: number
        successful_searches: number
        avg_response_time: number
        avg_results: number
      }
    }
  }
  vector_stats: {
    total_searches: number
    successful_searches: number
    failed_searches: number
    success_rate: number
    avg_response_time_ms: number
    avg_results_per_search: number
  }
  timestamp: string
}

export default function RAGMonitoringPage() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('24')

  const fetchMonitoringData = async (hours: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/rag/ab-test?hours=${hours}`)
      const data = await response.json()
      
      if (data.success) {
        setMonitoringData(data)
      } else {
        setError(data.error || 'Erreur lors de la récupération des données')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur monitoring:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitoringData(selectedPeriod)
  }, [selectedPeriod])

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceColor = (time: number) => {
    if (time < 100) return 'text-green-600'
    if (time < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des métriques...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Erreur de Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => fetchMonitoringData(selectedPeriod)}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!monitoringData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Aucune donnée de monitoring disponible</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { performance, vector_stats } = monitoringData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitoring RAG MAÏ</h1>
          <p className="text-gray-600">
            Surveillance des performances du système hybride vectoriel + heuristique
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1">Dernière heure</option>
            <option value="24">Dernières 24h</option>
            <option value="168">Dernière semaine</option>
          </select>
          <Button onClick={() => fetchMonitoringData(selectedPeriod)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recherches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.total_searches}</div>
            <p className="text-xs text-muted-foreground">
              sur {monitoringData.period_hours}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSuccessRateColor(performance.success_rate)}`}>
              {performance.success_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recherches réussies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(performance.avg_response_time)}`}>
              {formatTime(performance.avg_response_time)}
            </div>
            <p className="text-xs text-muted-foreground">
              Temps de réponse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière Mise à Jour</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(monitoringData.timestamp).toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(monitoringData.timestamp).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détails par méthode */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="vectorial">Vectoriel</TabsTrigger>
          <TabsTrigger value="heuristic">Heuristique</TabsTrigger>
          <TabsTrigger value="hybrid">Hybride</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(performance.method_breakdown).map(([method, stats]) => (
              <Card key={method}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{method}</span>
                    <Badge variant={stats.successful_searches > 0 ? "default" : "secondary"}>
                      {stats.successful_searches > 0 ? "Actif" : "Inactif"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recherches:</span>
                    <span className="font-medium">{stats.total_searches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Succès:</span>
                    <span className="font-medium">{stats.successful_searches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Temps moyen:</span>
                    <span className={`font-medium ${getPerformanceColor(stats.avg_response_time)}`}>
                      {formatTime(stats.avg_response_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Résultats moyens:</span>
                    <span className="font-medium">{stats.avg_results.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vectorial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Vectorielles</CardTitle>
              <CardDescription>
                Performances du système de recherche vectorielle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{vector_stats.total_searches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Succès</p>
                  <p className="text-2xl font-bold text-green-600">{vector_stats.successful_searches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Échecs</p>
                  <p className="text-2xl font-bold text-red-600">{vector_stats.failed_searches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux de succès</p>
                  <p className={`text-2xl font-bold ${getSuccessRateColor(vector_stats.success_rate)}`}>
                    {vector_stats.success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heuristic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Système Heuristique</CardTitle>
              <CardDescription>
                Performances du système de recherche heuristique (fallback)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Le système heuristique est utilisé comme fallback lorsque la recherche vectorielle échoue.
                Consultez les métriques globales pour voir son utilisation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hybrid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Système Hybride</CardTitle>
              <CardDescription>
                Combinaison intelligente des deux systèmes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Le système hybride utilise la recherche vectorielle en priorité et bascule automatiquement
                vers le système heuristique en cas d'échec.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
