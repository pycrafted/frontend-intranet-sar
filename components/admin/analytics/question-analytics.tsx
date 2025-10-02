"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionAnalyticsProps {
  question: {
    question_id: number
    question_text: string
    question_type: string
    question_type_display?: string
    total_responses: number
    option_counts?: Record<string, number>
    option_percentages?: Record<string, number>
    average?: number
    min?: number
    max?: number
    text_responses?: string[]
    average_length?: number
    word_count?: number
  }
  index: number
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

export function QuestionAnalytics({ question, index }: QuestionAnalyticsProps) {
  const getChartData = () => {
    if (question.option_counts && Object.keys(question.option_counts).length > 0) {
      return Object.entries(question.option_counts).map(([option, count], idx) => ({
        name: option,
        value: count,
        percentage: question.option_percentages?.[option] || 0,
        color: COLORS[idx % COLORS.length]
      }))
    }
    return []
  }

  const getPieData = () => {
    return getChartData().map((item, idx) => ({
      ...item,
      fill: COLORS[idx % COLORS.length]
    }))
  }

  const renderChart = () => {
    const data = getChartData()
    
    // Gestion des questions de type échelle/rating
    if ((question.question_type === 'scale' || question.question_type === 'rating_numeric') && question.average !== undefined) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Moyenne</p>
              <p className="text-2xl font-bold text-blue-900">{question.average}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Minimum</p>
              <p className="text-2xl font-bold text-green-900">{question.min}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600">Maximum</p>
              <p className="text-2xl font-bold text-orange-900">{question.max}</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [value, 'Réponses']}
                  labelFormatter={(label) => `Option: ${label}`}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    }

    // Gestion des questions de type texte
    if (question.question_type === 'text' && question.text_responses) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Longueur moyenne</p>
              <p className="text-2xl font-bold text-blue-900">{question.average_length || 0} caractères</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Mots totaux</p>
              <p className="text-2xl font-bold text-green-900">{question.word_count || 0}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Réponses reçues</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {question.text_responses.map((response: string, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{response}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="h-32 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Aucune réponse reçue</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip 
              formatter={(value: any) => [`${value} réponses`, 'Réponses']}
              labelFormatter={(label) => `Option: ${label}`}
            />
            <Bar 
              dataKey="value" 
              fill="#3B82F6" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'single_choice': return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'multiple_choice': return <Target className="h-4 w-4 text-green-600" />
      case 'scale': return <TrendingUp className="h-4 w-4 text-purple-600" />
      case 'rating_numeric': return <TrendingUp className="h-4 w-4 text-purple-600" />
      case 'text': return <Info className="h-4 w-4 text-gray-600" />
      case 'top_selection': return <Target className="h-4 w-4 text-orange-600" />
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'single_choice': return 'bg-blue-100 text-blue-800'
      case 'multiple_choice': return 'bg-green-100 text-green-800'
      case 'scale': return 'bg-purple-100 text-purple-800'
      case 'rating_numeric': return 'bg-purple-100 text-purple-800'
      case 'text': return 'bg-gray-100 text-gray-800'
      case 'top_selection': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn("text-xs", getQuestionTypeColor(question.question_type))}>
                {getQuestionTypeIcon(question.question_type)}
                <span className="ml-1">
                  {question.question_type_display || 
                    (question.question_type === 'single_choice' && 'Choix unique') ||
                    (question.question_type === 'multiple_choice' && 'Choix multiple') ||
                    (question.question_type === 'scale' && 'Échelle') ||
                    (question.question_type === 'rating_numeric' && 'Note sur 10') ||
                    (question.question_type === 'text' && 'Texte libre') ||
                    (question.question_type === 'top_selection' && 'Top 3') ||
                    question.question_type
                  }
                </span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.total_responses} réponses
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
              Q{index + 1}: {question.question_text}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}

