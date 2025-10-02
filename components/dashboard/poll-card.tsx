"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QuestionnaireModal } from "@/components/questionnaire-modal"
import { QuestionnaireSelector } from "@/components/questionnaire-selector"
import { BarChart3, Loader2, Users, Clock } from "lucide-react"

interface Question {
  id: number
  text: string
  type: string
  type_display: string
  is_required: boolean
  order: number
  options: string[]
  scale_min?: number
  scale_max?: number
  scale_labels?: Record<string, string>
  // Phase 1 - Nouveaux champs
  rating_max?: number
  rating_labels?: string[]
  satisfaction_options?: string[]
  validation_rules?: Record<string, any>
  checkbox_text?: string
  // Phase 2 - Nouveaux champs
  ranking_items?: string[]
  top_selection_limit?: number
  matrix_questions?: string[]
  matrix_options?: string[]
  likert_scale?: string[]
}

interface Questionnaire {
  id: number
  title: string
  description: string
  type: string
  type_display: string
  status: string
  status_display: string
  is_anonymous: boolean
  allow_multiple_responses: boolean
  show_results_after_submission: boolean
  target_audience_type: string
  target_audience_type_display: string
  target_departments: string[]
  target_roles: string[]
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  created_by_name: string
  is_active: boolean
  total_responses: number
  response_rate: number
  questions: Question[]
}

// Fonction pour récupérer les questionnaires actifs depuis l'API
const fetchActiveQuestionnaires = async (): Promise<Questionnaire[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accueil/questionnaires/active/`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des questionnaires')
    }
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des questionnaires:', error)
    return []
  }
}

export function PollCard() {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPollIndex, setCurrentPollIndex] = useState(0)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les questionnaires actifs au montage du composant
  useEffect(() => {
    const loadQuestionnaires = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchActiveQuestionnaires()
        setQuestionnaires(data)
      } catch (err) {
        setError('Erreur lors du chargement des questionnaires')
        console.error('Erreur:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestionnaires()
  }, [])

  const handleSelectQuestionnaire = (questionnaire: Questionnaire) => {
    const index = questionnaires.findIndex(q => q.id === questionnaire.id)
    if (index !== -1) {
      setCurrentPollIndex(index)
      setIsSelectorOpen(false)
      setIsModalOpen(true)
    }
  }

  // Si en cours de chargement, afficher un loader
  if (isLoading) {
    return (
      <Card className="h-[28rem] bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 border-0 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
          <span className="text-gray-600">Chargement des enquêtes...</span>
        </div>
      </Card>
    )
  }

  // Si erreur, afficher un message d'erreur
  if (error) {
    return (
      <Card className="h-[28rem] bg-gradient-to-br from-red-100 via-red-50 to-pink-100 border-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Erreur de chargement</h3>
          <p className="text-red-600">Impossible de charger les enquêtes</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-[28rem] bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
        {/* Effet de brillance en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/20 via-transparent to-blue-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Icônes décoratives de graphique et sondage */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <BarChart3 className="h-10 w-10 text-white" />
        </div>
        {/* Icône de sondage en bas à gauche */}
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </div>
        
        {/* Header avec design amélioré */}
        <CardHeader className="pb-4 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-200 group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              📊 Enquêtes
            </CardTitle>
            <div className="text-right mr-24">
              <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                🔒 Anonyme
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
          <div className="space-y-8">
            {/* Icône de graphique scintillante */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 animate-pulse">
                <BarChart3 className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
              {/* Effet de scintillement */}
              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-400 rounded-full mx-auto opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
            </div>
            
            {/* Texte principal */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                {questionnaires.length === 0 
                  ? 'Aucune enquête disponible' 
                  : questionnaires.length === 1 
                    ? 'Une enquête disponible' 
                    : `${questionnaires.length} enquêtes disponibles`
                }
              </h3>
              
              {/* Statistiques rapides */}
              {questionnaires.length > 1 && (
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{questionnaires.length} enquêtes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>Réponse anonyme</span>
                  </div>
                </div>
              )}
              
              {/* Message quand il n'y a pas d'enquêtes */}
              {questionnaires.length === 0 && (
                <div className="text-center space-y-2">
                  <p className="text-gray-600 text-sm">
                    Aucune enquête n'est actuellement disponible.
                  </p>
                  <p className="text-gray-500 text-xs">
                    Revenez plus tard pour participer aux prochaines enquêtes.
                  </p>
                </div>
              )}
              
              {/* Bouton cliquable */}
              {questionnaires.length > 0 && (
                <Button
                  onClick={() => {
                    if (questionnaires.length === 1) {
                      setCurrentPollIndex(0)
                      setIsModalOpen(true)
                    } else {
                      setIsSelectorOpen(true)
                    }
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
                >
                  <span className="flex items-center gap-3">
                    → {questionnaires.length === 1 ? 'Participez à l\'enquête' : 'Choisir une enquête'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sélecteur d'enquêtes - seulement si il y a des questionnaires */}
      {questionnaires.length > 0 && (
        <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <QuestionnaireSelector
              questionnaires={questionnaires}
              onSelectQuestionnaire={handleSelectQuestionnaire}
              onClose={() => setIsSelectorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal du questionnaire - seulement si il y a des questionnaires */}
      {questionnaires.length > 0 && (
        <QuestionnaireModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          questionnaires={questionnaires}
          currentQuestionnaireIndex={currentPollIndex}
          onQuestionnaireChange={setCurrentPollIndex}
        />
      )}
    </>
  )
}