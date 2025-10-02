"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { X, Star, CheckCircle, FileText } from "lucide-react"

interface Questionnaire {
  id: string
  title: string
  description: string
  questions: {
    id: string
    question: string
    type: 'single' | 'multiple' | 'text' | 'rating'
    options?: string[]
    required: boolean
  }[]
  endDate: string
  createdAt: string
  createdBy: {
    name: string
    department: string
    avatar?: string
  }
  targetAudience: {
    type: 'all' | 'department' | 'specific'
    departments?: string[]
    specificUsers?: string[]
    label: string
  }
  totalResponses: number
  totalTargeted: number
  isActive: boolean
  hasUserResponded: boolean
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
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedQuestionnaires, setSubmittedQuestionnaires] = useState<Set<string>>(new Set())
  const { success, error } = useToast()

  const currentQuestionnaire = questionnaires[currentQuestionnaireIndex]

  useEffect(() => {
    if (isOpen) {
      setResponses({})
      setIsSubmitted(false)
    }
  }, [isOpen, currentQuestionnaireIndex])

  const formatEndDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysRemaining = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleSubmit = async () => {
    // Vérifier que toutes les questions obligatoires sont répondues
    const requiredQuestions = currentQuestionnaire.questions.filter(q => q.required)
    const missingRequired = requiredQuestions.filter(q => !responses[q.id] || 
      (Array.isArray(responses[q.id]) && responses[q.id].length === 0) ||
      (typeof responses[q.id] === 'string' && responses[q.id].trim() === '')
    )

    if (missingRequired.length > 0) {
      error("Erreur", "Veuillez répondre à toutes les questions obligatoires")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simuler l'envoi des réponses
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Marquer ce questionnaire comme soumis
      setSubmittedQuestionnaires(prev => new Set([...prev, currentQuestionnaire.id]))
      
      // Passer au questionnaire suivant ou fermer le modal
      const nextIndex = currentQuestionnaireIndex + 1
      if (nextIndex < questionnaires.length) {
        onQuestionnaireChange(nextIndex)
        setResponses({})
        setIsSubmitted(false)
      } else {
        setIsSubmitted(true)
        success("Succès", "Votre questionnaire a été soumis avec succès !")
      }
    } catch (err) {
      error("Erreur", "Une erreur est survenue lors de l'envoi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setResponses({})
    setIsSubmitted(false)
    onClose()
  }

  const handleNextQuestionnaire = () => {
    if (currentQuestionnaireIndex < questionnaires.length - 1) {
      onQuestionnaireChange(currentQuestionnaireIndex + 1)
      setResponses({})
      setIsSubmitted(false)
    }
  }

  const handlePrevQuestionnaire = () => {
    if (currentQuestionnaireIndex > 0) {
      onQuestionnaireChange(currentQuestionnaireIndex - 1)
      setResponses({})
      setIsSubmitted(false)
    }
  }

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'single':
        return (
          <RadioGroup
            value={responses[question.id] || ""}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} disabled={isSubmitting} className="text-green-600" />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'multiple':
        return (
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={responses[question.id]?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = responses[question.id] || []
                    if (checked) {
                      handleResponseChange(question.id, [...currentValues, option])
                    } else {
                      handleResponseChange(question.id, currentValues.filter((v: string) => v !== option))
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-green-600"
                />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'text':
        return (
          <Textarea
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Tapez votre réponse ici..."
            rows={4}
            disabled={isSubmitting}
            className="w-full border-gray-200 focus:border-green-400 focus:ring-green-400"
          />
        )

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating)}
                disabled={isSubmitting}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  responses[question.id] >= rating
                    ? 'text-yellow-500 bg-yellow-50'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
            {responses[question.id] && (
              <span className="ml-3 text-sm text-gray-600">
                {responses[question.id]}/5
              </span>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const daysRemaining = getDaysRemaining(currentQuestionnaire.endDate)
  const responseRate = Math.round((currentQuestionnaire.totalResponses / currentQuestionnaire.totalTargeted) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Questionnaire
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation entre questionnaires */}
          {questionnaires.length > 1 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <Button 
                onClick={handlePrevQuestionnaire} 
                disabled={currentQuestionnaireIndex === 0 || isSubmitting}
                variant="outline"
                size="sm"
              >
                ← Précédent
              </Button>
              <div className="flex items-center space-x-2">
                {questionnaires.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full ${
                      index === currentQuestionnaireIndex 
                        ? 'bg-green-600' 
                        : submittedQuestionnaires.has(questionnaires[index].id) 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <Button 
                onClick={handleNextQuestionnaire} 
                disabled={currentQuestionnaireIndex === questionnaires.length - 1 || isSubmitting}
                variant="outline"
                size="sm"
              >
                Suivant →
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isSubmitted ? (
            // Écran de confirmation
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Questionnaire soumis !</h3>
              <p className="text-gray-600 mb-6">
                Merci pour votre participation. Vos réponses ont été enregistrées.
              </p>
              <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
                Fermer
              </Button>
            </div>
          ) : (
            // Formulaire du questionnaire
            <div className="space-y-6">
              {/* Informations du créateur */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {currentQuestionnaire.createdBy.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{currentQuestionnaire.createdBy.name}</p>
                    <p className="text-xs text-gray-600">{currentQuestionnaire.createdBy.department}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <span>🎯 {currentQuestionnaire.targetAudience.label}</span>
                </div>
              </div>

              {/* Titre et description du questionnaire */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{currentQuestionnaire.title}</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{currentQuestionnaire.description}</p>
                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{currentQuestionnaire.totalResponses}</p>
                    <p className="text-xs text-gray-500">Réponses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{daysRemaining}</p>
                    <p className="text-xs text-gray-500">Jours restants</p>
                  </div>
                </div>
              </div>

              {/* Questions du questionnaire */}
              <div className="space-y-6">
                {currentQuestionnaire.questions.map((question, index) => (
                  <div key={question.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      {question.question}
                      {question.required && <span className="text-red-500">*</span>}
                    </h4>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                    Annuler
                  </Button>
                  {questionnaires.length > 1 && (
                    <Button variant="outline" onClick={handleNextQuestionnaire} disabled={currentQuestionnaireIndex === questionnaires.length - 1 || isSubmitting}>
                      Passer
                    </Button>
                  )}
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ✍️ Soumettre mes réponses
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
