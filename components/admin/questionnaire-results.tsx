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
  Download,
  Eye,
  Calendar,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { Questionnaire } from '@/hooks/useQuestionnaireManagement'

interface QuestionnaireResultsProps {
  questionnaire: Questionnaire
  onClose: () => void
}

interface QuestionResult {
  question_id: number
  question_text: string
  question_type: string
  total_responses: number
  responses: any[]
  statistics: {
    mean?: number
    median?: number
    mode?: any
    distribution?: Record<string, number>
  }
}

export function QuestionnaireResults({ questionnaire, onClose }: QuestionnaireResultsProps) {
  const [results, setResults] = useState<QuestionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResults()
  }, [questionnaire.id])

  const fetchResults = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simuler des données de résultats pour la démonstration
      const mockResults: QuestionResult[] = questionnaire.questions.map((question, index) => ({
        question_id: question.id,
        question_text: question.text,
        question_type: question.type,
        total_responses: Math.floor(Math.random() * 50) + 10,
        responses: [],
        statistics: {
          mean: question.type === 'scale' ? Math.random() * 5 + 1 : undefined,
          median: question.type === 'scale' ? Math.random() * 5 + 1 : undefined,
          distribution: question.options?.reduce((acc, option) => {
            acc[option] = Math.floor(Math.random() * 20) + 1
            return acc
          }, {} as Record<string, number>)
        }
      }))
      
      setResults(mockResults)
    } catch (err) {
      setError('Erreur lors du chargement des résultats')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderQuestionResult = (result: QuestionResult) => {
    switch (result.question_type) {
      case 'choice':
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{result.question_text}</h4>
            <div className="space-y-2">
              {result.statistics.distribution && Object.entries(result.statistics.distribution).map(([option, count]) => {
                const percentage = (count / result.total_responses) * 100
                return (
                  <div key={option} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{option}</span>
                      <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{result.question_text}</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.statistics.mean?.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Moyenne</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.statistics.median?.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Médiane</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.total_responses}
                </div>
                <div className="text-sm text-gray-500">Réponses</div>
              </div>
            </div>
          </div>
        )

      case 'rating':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{result.question_text}</h4>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {result.statistics.mean?.toFixed(1)}/5
              </div>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 mx-1 ${
                      i < Math.floor(result.statistics.mean || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {result.total_responses} réponses
              </div>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{result.question_text}</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {result.total_responses} réponses textuelles
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Les réponses textuelles ne sont pas affichées pour des raisons de confidentialité
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{result.question_text}</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {result.total_responses} réponses
              </div>
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-red-600" />
          <span className="text-gray-600">Chargement des résultats...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Résultats de l'enquête</h2>
            <p className="text-gray-600">{questionnaire.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchResults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {questionnaire.total_responses}
                </div>
                <div className="text-sm text-gray-500">Total réponses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {questionnaire.response_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Taux de participation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {questionnaire.questions.length}
                </div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {questionnaire.status_display}
                </div>
                <div className="text-sm text-gray-500">Statut</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résultats par question */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Résultats par question</h3>
        {results.map((result, index) => (
          <Card key={result.question_id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  Question {index + 1}
                </Badge>
                <Badge variant="outline">
                  {result.question_type}
                </Badge>
              </div>
              {renderQuestionResult(result)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <Eye className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
