"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Send, ChevronLeft, ChevronRight, CheckCircle, Clock, Users, Target } from "lucide-react"
import { useQuestionnaires } from "@/hooks/useQuestionnaires"
import { QuestionFactory } from "@/components/questions/QuestionFactory"

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

interface QuestionnaireModalProps {
  isOpen: boolean
  onClose: () => void
  questionnaires: Questionnaire[]
  currentQuestionnaireIndex: number
  onQuestionnaireChange: (index: number) => void
}

export function QuestionnaireModal({ 
  isOpen, 
  onClose, 
  questionnaires, 
  currentQuestionnaireIndex, 
  onQuestionnaireChange 
}: QuestionnaireModalProps) {
  const { submitQuestionnaireResponse } = useQuestionnaires()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const currentQuestionnaire = questionnaires[currentQuestionnaireIndex]

  // Réinitialiser le formulaire quand le modal s'ouvre ou change de questionnaire
  useEffect(() => {
    if (isOpen) {
      setAnswers({})
      setErrors({})
      setIsSubmitted(false)
      setCurrentQuestionIndex(0)
    }
  }, [isOpen, currentQuestionnaireIndex])

  // Calculer la progression
  const totalQuestions = currentQuestionnaire?.questions.length || 0
  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const validateAnswers = (): boolean => {
    const newErrors: Record<number, string> = {}
    
    currentQuestionnaire.questions.forEach(question => {
      if (question.is_required && !answers[question.id]) {
        newErrors[question.id] = 'Cette question est obligatoire'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAnswers()) return
    
    setIsSubmitting(true)
    
    try {
      const responseData = {
        questionnaire: currentQuestionnaire.id,
        question_responses: Object.entries(answers).map(([questionId, answer]) => ({
          question: parseInt(questionId),
          answer_data: answer
        }))
      }
      
      const result = await submitQuestionnaireResponse(responseData)
      
      if (result.success) {
        setIsSubmitted(true)
        setAnswers({})
        setErrors({})
      } else {
        console.error('Erreur lors de la soumission:', result.error)
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setErrors({})
    setIsSubmitted(false)
    setCurrentQuestionIndex(0)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleNextQuestionnaire = () => {
    if (currentQuestionnaireIndex < questionnaires.length - 1) {
      onQuestionnaireChange(currentQuestionnaireIndex + 1)
      handleReset()
    }
  }

  const handlePrevQuestionnaire = () => {
    if (currentQuestionnaireIndex > 0) {
      onQuestionnaireChange(currentQuestionnaireIndex - 1)
      handleReset()
    }
  }

  const formatEndDate = (dateString: string | null) => {
    if (!dateString) return 'Pas de date de fin'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getTargetAudienceLabel = (questionnaire: Questionnaire) => {
    if (!questionnaire || !questionnaire.target_audience_type) {
      return 'Audience non définie'
    }
    
    switch (questionnaire.target_audience_type) {
      case 'all':
        return 'Tous les employés'
      case 'department':
        return `Départements: ${questionnaire.target_departments?.join(', ') || 'Non spécifié'}`
      case 'role':
        return `Rôles: ${questionnaire.target_roles?.join(', ') || 'Non spécifié'}`
      default:
        return 'Audience personnalisée'
    }
  }

  // Déterminer la largeur du modal selon le type de question
  const getModalWidth = () => {
    if (!currentQuestionnaire?.questions[currentQuestionIndex]) {
      return "max-w-2xl"
    }
    
    const currentQuestion = currentQuestionnaire.questions[currentQuestionIndex]
    
    // Pour les questions de type matrix, utiliser une largeur plus grande
    if (currentQuestion.type === 'matrix') {
      const optionsCount = currentQuestion.matrix_options?.length || 5
      const questionsCount = currentQuestion.matrix_questions?.length || 3
      
      // Calculer la largeur nécessaire basée sur le nombre d'options et de questions
      const baseWidth = 400 // Largeur de base
      const optionWidth = 120 // Largeur par option
      const questionWidth = 200 // Largeur par question
      const padding = 100 // Padding et marges
      
      const calculatedWidth = baseWidth + (optionsCount * optionWidth) + (questionsCount * questionWidth) + padding
      
      // Limiter la largeur maximale et minimale
      if (calculatedWidth > 1200) {
        return "max-w-7xl"
      } else if (calculatedWidth > 800) {
        return "max-w-6xl"
      } else if (calculatedWidth > 600) {
        return "max-w-4xl"
      } else {
        return "max-w-3xl"
      }
    }
    
    // Pour les autres types de questions, utiliser la largeur normale
    return "max-w-2xl"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`${getModalWidth()} max-h-[90vh] overflow-y-auto transition-all duration-300`}
        aria-describedby="questionnaire-description"
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            📊 Enquêtes
          </DialogTitle>
          <div id="questionnaire-description" className="sr-only">
            Questionnaire d'évaluation avec {totalQuestions} questions pour collecter vos retours
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              🔒 Anonyme
            </div>
            <p className="text-sm text-gray-600">
              {currentQuestionnaire?.title || 'Questionnaire'}
            </p>
          </div>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              🎉 Réponse soumise avec succès !
            </h3>
            <p className="text-gray-600 mb-6">
              Votre participation à l'enquête a été enregistrée.
            </p>
            <div className="flex gap-3 justify-center">
              {questionnaires.length > 1 && currentQuestionnaireIndex < questionnaires.length - 1 && (
                <Button
                  onClick={handleNextQuestionnaire}
                  variant="outline"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  📊 Questionnaire suivant
                </Button>
              )}
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informations du questionnaire */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{currentQuestionnaire?.title}</h3>
              {currentQuestionnaire?.description && (
                <p className="text-gray-700 mb-3 text-sm">{currentQuestionnaire.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {currentQuestionnaire?.created_by_name}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {getTargetAudienceLabel(currentQuestionnaire)}
                </span>
                {currentQuestionnaire?.end_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Fin: {formatEndDate(currentQuestionnaire.end_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Progression: {answeredQuestions}/{totalQuestions} questions
                </span>
                <span className="text-gray-500">
                  {Math.round(progressPercentage)}% complété
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Navigation des questions */}
            {totalQuestions > 1 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Navigation des questions</h4>
                <div className="flex flex-wrap gap-2">
                  {currentQuestionnaire?.questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionClick(index)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500 text-white shadow-md'
                          : answers[question.id]
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {index + 1}
                      {answers[question.id] && (
                        <CheckCircle className="inline-block h-3 w-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation entre questionnaires */}
            {questionnaires.length > 1 && (
              <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-200">
                <Button 
                  onClick={handlePrevQuestionnaire} 
                  disabled={currentQuestionnaireIndex === 0}
                  variant="outline"
                  size="sm"
                  className="border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <div className="flex items-center space-x-2">
                  {questionnaires.map((_, index) => (
                    <div 
                      key={index} 
                      className={`w-3 h-3 rounded-full ${
                        index === currentQuestionnaireIndex 
                          ? 'bg-cyan-600' 
                          : 'bg-cyan-200'
                      }`} 
                    />
                  ))}
                </div>
                <Button 
                  onClick={handleNextQuestionnaire} 
                  disabled={currentQuestionnaireIndex === questionnaires.length - 1}
                  variant="outline"
                  size="sm"
                  className="border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Question actuelle */}
            {currentQuestionnaire?.questions[currentQuestionIndex] && (
              <div className="bg-white rounded-xl p-6 border border-cyan-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    ❓ Question {currentQuestionIndex + 1} sur {totalQuestions}
                    {currentQuestionnaire.questions[currentQuestionIndex].is_required && (
                      <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                    )}
                  </Label>
                  <div className="text-xs text-gray-500">
                    {currentQuestionnaire.questions[currentQuestionIndex].type_display}
                  </div>
                </div>
                
                <p className="text-gray-900 mb-6 text-lg leading-relaxed">
                  {currentQuestionnaire.questions[currentQuestionIndex].text}
                </p>
                
                {/* Rendu de la question selon son type */}
                <QuestionFactory
                  question={currentQuestionnaire.questions[currentQuestionIndex]}
                  value={answers[currentQuestionnaire.questions[currentQuestionIndex].id]}
                  onChange={(value) => handleAnswerChange(currentQuestionnaire.questions[currentQuestionIndex].id, value)}
                  error={errors[currentQuestionnaire.questions[currentQuestionIndex].id]}
                />
                
                {errors[currentQuestionnaire.questions[currentQuestionIndex].id] && (
                  <p className="text-xs text-red-500 mt-4 flex items-center gap-1">
                    ⚠️ {errors[currentQuestionnaire.questions[currentQuestionIndex].id]}
                  </p>
                )}

                {/* Navigation des questions */}
                {totalQuestions > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {currentQuestionIndex + 1} / {totalQuestions}
                      </span>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Boutons d'action finaux */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  🎯 Prêt à soumettre votre évaluation ?
                </h4>
                <p className="text-sm text-gray-600">
                  Vous avez répondu à {answeredQuestions} sur {totalQuestions} questions
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 bg-white border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300"
                >
                  <span className="flex items-center gap-2">
                    🔄 Recommencer
                  </span>
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredQuestions === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      🚀 Soumettre l'évaluation
                    </span>
                  )}
                </Button>
              </div>
              
              {answeredQuestions < totalQuestions && (
                <p className="text-xs text-amber-600 mt-3 text-center">
                  ⚠️ Vous pouvez soumettre même si toutes les questions ne sont pas répondues
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

