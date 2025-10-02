"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  Eye, 
  Play, 
  Pause, 
  Trash2,
  Copy,
  Star,
  Zap,
  MessageSquare,
  Activity
} from 'lucide-react'
import { Questionnaire } from '@/hooks/useQuestionnaireManagement'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface QuestionnaireCardProps {
  questionnaire: Questionnaire
  onStatusChange: (id: number, status: string) => void
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
  onViewAnalytics: (questionnaire: Questionnaire) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

export function QuestionnaireCard({
  questionnaire,
  onStatusChange,
  onDelete,
  onDuplicate,
  onViewAnalytics,
  getStatusColor,
  getStatusIcon
}: QuestionnaireCardProps) {


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'survey': return <BarChart3 className="w-5 h-5 text-blue-600" />
      case 'quiz': return <Zap className="w-5 h-5 text-yellow-600" />
      case 'evaluation': return <Star className="w-5 h-5 text-purple-600" />
      case 'feedback': return <MessageSquare className="w-5 h-5 text-green-600" />
      case 'poll': return <Activity className="w-5 h-5 text-orange-600" />
      default: return <BarChart3 className="w-5 h-5 text-gray-600" />
    }
  }


  const canChangeStatus = (currentStatus: string) => {
    return ['draft', 'active', 'paused'].includes(currentStatus)
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft': return 'active'
      case 'active': return 'paused'
      case 'paused': return 'active'
      default: return null
    }
  }

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft': return 'Activer'
      case 'active': return 'Pauser'
      case 'paused': return 'Reprendre'
      default: return null
    }
  }

  const getNextStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft': return <Play className="w-4 h-4" />
      case 'active': return <Pause className="w-4 h-4" />
      case 'paused': return <Play className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden relative border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 h-[320px] flex flex-col">
      {/* Effet de brillance en arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-transparent to-indigo-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Icônes décoratives en arrière-plan */}
      <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        {getTypeIcon(questionnaire.type)}
      </div>
      
      {/* Icône de statistiques en bas à gauche */}
      <div className="absolute bottom-3 left-3 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center opacity-15 group-hover:opacity-30 transition-opacity duration-300">
        <Users className="h-5 w-5 text-white" />
      </div>

      <CardHeader className="pb-2 flex-shrink-0 relative z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-200 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
              {getTypeIcon(questionnaire.type)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors duration-300">
                {questionnaire.title}
              </CardTitle>
              <p className="text-sm text-gray-600 font-medium">
                {questionnaire.type_display}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Badge className={cn("text-xs flex-shrink-0 shadow-sm", getStatusColor(questionnaire.status))}>
              {getStatusIcon(questionnaire.status)}
              <span className="ml-1 font-semibold">{questionnaire.status_display}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10 flex-1 flex flex-col justify-between">
        {/* Statistiques avec design amélioré */}
        <div className="bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Réponses</p>
                <p className="text-lg font-bold text-gray-900">{questionnaire.total_responses}</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-600 font-medium">Taux</p>
              <p className="text-lg font-bold text-blue-600">{questionnaire.response_rate}%</p>
            </div>
          </div>
        </div>

        {/* Actions avec design amélioré */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            size="sm"
            onClick={() => onViewAnalytics(questionnaire)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg font-semibold text-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          
          <div className="flex gap-2">
            {canChangeStatus(questionnaire.status) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(questionnaire.id, getNextStatus(questionnaire.status)!)}
                className="flex-1 sm:flex-none hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200 rounded-lg shadow-sm"
              >
                {getNextStatusIcon(questionnaire.status)}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDuplicate(questionnaire.id)}
              className="flex-1 sm:flex-none hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 rounded-lg shadow-sm"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(questionnaire.id)}
              className="flex-1 sm:flex-none hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 rounded-lg shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
