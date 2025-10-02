"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  PieChart
} from 'lucide-react'
import { QuestionnaireStats } from '@/hooks/useQuestionnaireManagement'

interface QuestionnaireStatsCardsProps {
  stats: QuestionnaireStats
}

export function QuestionnaireStatsCards({ stats }: QuestionnaireStatsCardsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'survey': return 'bg-blue-100 text-blue-800'
      case 'quiz': return 'bg-purple-100 text-purple-800'
      case 'evaluation': return 'bg-orange-100 text-orange-800'
      case 'feedback': return 'bg-green-100 text-green-800'
      case 'poll': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total des enquêtes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Enquêtes
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.total_questionnaires}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.active_questionnaires} actives
          </p>
        </CardContent>
      </Card>

      {/* Total des réponses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Réponses
          </CardTitle>
          <Users className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.total_responses}</div>
          <p className="text-xs text-gray-500 mt-1">
            Toutes enquêtes confondues
          </p>
        </CardContent>
      </Card>

      {/* Taux de réponse moyen */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Taux de Réponse
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {stats.average_response_rate.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Moyenne générale
          </p>
        </CardContent>
      </Card>

      {/* Enquêtes récentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Récentes
          </CardTitle>
          <Clock className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {stats.recent_questionnaires.length}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dernières 7 jours
          </p>
        </CardContent>
      </Card>

      {/* Répartition par statut */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Répartition par Statut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.questionnaires_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(status)}>
                    {status === 'draft' && 'Brouillon'}
                    {status === 'active' && 'Actif'}
                    {status === 'paused' && 'En pause'}
                    {status === 'closed' && 'Fermé'}
                    {status === 'archived' && 'Archivé'}
                  </Badge>
                </div>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Répartition par type */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Répartition par Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.questionnaires_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(type)}>
                    {type === 'survey' && 'Sondage'}
                    {type === 'quiz' && 'Quiz'}
                    {type === 'evaluation' && 'Évaluation'}
                    {type === 'feedback' && 'Retour d\'expérience'}
                    {type === 'poll' && 'Sondage rapide'}
                  </Badge>
                </div>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
