"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Star, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Target,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Questionnaire {
  id: number
  title: string
  description: string
  type: string
  type_display: string
  status: string
  target_audience_type: string
  start_date: string
  end_date: string
  is_anonymous: boolean
  show_results_after_submission: boolean
  questions_count: number
  responses_count: number
  created_at: string
}

interface QuestionnaireSelectorProps {
  questionnaires: Questionnaire[]
  onSelectQuestionnaire: (questionnaire: Questionnaire) => void
  onClose: () => void
}

export function QuestionnaireSelector({ 
  questionnaires, 
  onSelectQuestionnaire, 
  onClose 
}: QuestionnaireSelectorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'survey':
        return <BarChart3 className="h-4 w-4 text-blue-500" />
      case 'evaluation':
        return <Star className="h-4 w-4 text-purple-500" />
      case 'poll':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'quiz':
        return <BookOpen className="h-4 w-4 text-orange-500" />
      case 'feedback':
        return <Target className="h-4 w-4 text-cyan-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'survey':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'evaluation':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'poll':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'quiz':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'feedback':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Tri simple par date de création (plus récent en premier)
  const sortedQuestionnaires = [...questionnaires].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-6">
      {/* En-tête simplifié */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez une Enquête</h2>
        <p className="text-gray-600">{questionnaires.length} enquêtes disponibles</p>
      </div>

      {/* Liste des enquêtes compacte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {sortedQuestionnaires.map((questionnaire) => {
          const isSelected = selectedId === questionnaire.id
          
          return (
            <Card
              key={questionnaire.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                isSelected 
                  ? "border-cyan-500 bg-cyan-50 shadow-md scale-105" 
                  : "border-gray-200 hover:border-cyan-300"
              )}
              onClick={() => setSelectedId(questionnaire.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  {getTypeIcon(questionnaire.type)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {questionnaire.title}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs mt-1", getTypeColor(questionnaire.type))}
                    >
                      {questionnaire.type_display}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {questionnaire.description}
                </p>
                
                {/* Indicateur de sélection compact */}
                {isSelected && (
                  <div className="flex items-center gap-1 mt-2 text-cyan-600">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs font-medium">Sélectionné</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions simplifiées */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Annuler
        </Button>
        
        <Button
          onClick={() => {
            const selected = questionnaires.find(q => q.id === selectedId)
            if (selected) {
              onSelectQuestionnaire(selected)
            }
          }}
          disabled={!selectedId}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            Participer
            <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  )
}
