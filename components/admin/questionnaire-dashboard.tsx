"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'
import { Questionnaire, QuestionnaireStats } from '@/hooks/useQuestionnaireManagement'

interface QuestionnaireDashboardProps {
  questionnaires: Questionnaire[]
  stats: QuestionnaireStats | null
  loading: boolean
  onRefresh: () => void
  onViewQuestionnaire: (questionnaire: Questionnaire) => void
}

export function QuestionnaireDashboard({ 
  questionnaires, 
  stats, 
  loading, 
  onRefresh,
  onViewQuestionnaire 
}: QuestionnaireDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredQuestionnaires = questionnaires.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRecentQuestionnaires = () => {
    const now = new Date()
    const filterDate = new Date()
    
    switch (timeFilter) {
      case '7d':
        filterDate.setDate(now.getDate() - 7)
        break
      case '30d':
        filterDate.setDate(now.getDate() - 30)
        break
      case '90d':
        filterDate.setDate(now.getDate() - 90)
        break
      default:
        return filteredQuestionnaires
    }
    
    return filteredQuestionnaires.filter(q => 
      new Date(q.created_at) >= filterDate
    )
  }

  const recentQuestionnaires = getRecentQuestionnaires()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'satisfaction': return 'bg-blue-100 text-blue-800'
      case 'feedback': return 'bg-green-100 text-green-800'
      case 'evaluation': return 'bg-purple-100 text-purple-800'
      case 'survey': return 'bg-orange-100 text-orange-800'
      case 'poll': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord des Enquêtes</h2>
          <p className="text-gray-600">Vue d'ensemble et analyses des enquêtes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="all">Tout</option>
          </select>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total_questionnaires}</div>
                  <div className="text-sm text-gray-500">Total enquêtes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total_responses}</div>
                  <div className="text-sm text-gray-500">Total réponses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.average_response_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Taux de participation</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{recentQuestionnaires.length}</div>
                  <div className="text-sm text-gray-500">Récentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Répartition par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats && Object.entries(stats.questionnaires_by_status).map(([status, count]) => {
                const percentage = (count / stats.total_questionnaires) * 100
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(status)}>
                        {status === 'draft' && 'Brouillon'}
                        {status === 'active' && 'Actif'}
                        {status === 'paused' && 'En pause'}
                        {status === 'completed' && 'Terminé'}
                        {status === 'archived' && 'Archivé'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition par Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats && Object.entries(stats.questionnaires_by_type).map(([type, count]) => {
                const percentage = (count / stats.total_questionnaires) * 100
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(type)}>
                        {type === 'satisfaction' && 'Satisfaction'}
                        {type === 'feedback' && 'Feedback'}
                        {type === 'evaluation' && 'Évaluation'}
                        {type === 'survey' && 'Sondage'}
                        {type === 'poll' && 'Vote'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enquêtes récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Enquêtes Récentes ({recentQuestionnaires.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentQuestionnaires.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune enquête trouvée pour la période sélectionnée
              </div>
            ) : (
              recentQuestionnaires.map((questionnaire) => (
                <div key={questionnaire.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{questionnaire.title}</h4>
                      <Badge className={getStatusColor(questionnaire.status)}>
                        {questionnaire.status_display}
                      </Badge>
                      <Badge className={getTypeColor(questionnaire.type)}>
                        {questionnaire.type_display}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{questionnaire.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{questionnaire.total_responses} réponses</span>
                      <span>{questionnaire.response_rate.toFixed(1)}% participation</span>
                      <span>Créée le {new Date(questionnaire.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewQuestionnaire(questionnaire)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
