"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Download,
  FileText
} from 'lucide-react'
import { Questionnaire } from '@/hooks/useQuestionnaireManagement'
import { useQuestionnaireManagement } from '@/hooks/useQuestionnaireManagement'
import { QuestionAnalytics } from './analytics/question-analytics'
import { ResponseChart } from './analytics/response-chart'

interface QuestionnaireAnalyticsProps {
  questionnaire: Questionnaire
  onClose: () => void
}

export function QuestionnaireAnalytics({ questionnaire, onClose }: QuestionnaireAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { fetchQuestionnaireStats, fetchQuestionnaireAnalytics, exportQuestionnaire } = useQuestionnaireManagement()

  // Protection contre les données manquantes
  if (!questionnaire) {
    return (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Erreur</h3>
            <p className="text-red-500">Aucune donnée de questionnaire disponible</p>
            <Button onClick={onClose} className="mt-4">
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      try {
        const data = await fetchQuestionnaireAnalytics(questionnaire.id)
        setAnalytics(data)
      } catch (error) {
        console.error('Erreur lors du chargement des analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [questionnaire.id, fetchQuestionnaireAnalytics])

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportQuestionnaire(questionnaire.id, format)
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'paused': return <AlertCircle className="w-4 h-4" />
      case 'closed': return <AlertCircle className="w-4 h-4" />
      case 'draft': return <AlertCircle className="w-4 h-4" />
      case 'archived': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border-0">
        <CardHeader className="sticky top-0 bg-white border-b z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Analytics - {questionnaire.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(questionnaire.status)}>
                    {getStatusIcon(questionnaire.status)}
                    <span className="ml-1">{questionnaire.status_display}</span>
                  </Badge>
                  <Badge variant="outline">{questionnaire.type_display}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {questionnaire.total_responses} réponses
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('csv')}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b bg-gray-50 px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">
                  Résumé
                </TabsTrigger>
                <TabsTrigger value="questions">
                  Questions
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <TabsContent value="overview" className="space-y-6">
                {/* Métriques essentielles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Réponses</p>
                          <p className="text-2xl font-bold text-blue-900">{questionnaire.total_responses}</p>
                        </div>
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Participation</p>
                          <p className="text-2xl font-bold text-green-900">{questionnaire.response_rate}%</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Questions</p>
                          <p className="text-2xl font-bold text-purple-900">{questionnaire.questions?.length || 0}</p>
                        </div>
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphique simple */}
                {analytics && analytics.total_responses > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Réponses par Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponseChart
                        data={analytics.question_analytics?.map((q: any, idx: number) => ({
                          name: `Q${idx + 1}`,
                          value: q.total_responses || 0
                        })) || []}
                        type="bar"
                        title=""
                        description=""
                        dataKey="value"
                        xAxisKey="name"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        Aucune réponse reçue
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Les graphiques apparaîtront une fois que les employés commenceront à répondre.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Chargement...</p>
                  </div>
                ) : analytics && analytics.question_analytics ? (
                  <div className="space-y-4">
                    {analytics.question_analytics.map((question: any, index: number) => (
                      <QuestionAnalytics
                        key={question.question_id}
                        question={question}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                  </div>
                )}
              </TabsContent>

            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
