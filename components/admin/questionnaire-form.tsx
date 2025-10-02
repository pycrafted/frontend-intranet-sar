"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Settings,
  Users,
  Calendar,
  Shield,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Questionnaire, Question } from '@/hooks/useQuestionnaireManagement'
import { QuestionManager } from './question-manager'

interface QuestionnaireFormProps {
  questionnaire?: Questionnaire | null
  onClose: () => void
  onSave: (questionnaire: Questionnaire) => void
}

export function QuestionnaireForm({ questionnaire, onClose, onSave }: QuestionnaireFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'survey' as 'survey' | 'quiz' | 'evaluation' | 'feedback' | 'poll',
    status: 'draft' as 'draft' | 'active' | 'paused' | 'closed' | 'archived',
    is_anonymous: false,
    allow_multiple_responses: false,
    show_results_after_submission: true,
    target_audience_type: 'all' as 'all' | 'department' | 'role' | 'custom',
    target_departments: [] as string[],
    target_roles: [] as string[],
    start_date: '',
    end_date: ''
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!questionnaire

  useEffect(() => {
    if (questionnaire) {
      setFormData({
        title: questionnaire.title,
        description: questionnaire.description,
        type: questionnaire.type,
        status: questionnaire.status,
        is_anonymous: questionnaire.is_anonymous,
        allow_multiple_responses: questionnaire.allow_multiple_responses,
        show_results_after_submission: questionnaire.show_results_after_submission,
        target_audience_type: questionnaire.target_audience_type,
        target_departments: questionnaire.target_departments,
        target_roles: questionnaire.target_roles,
        start_date: questionnaire.start_date ? questionnaire.start_date.split('T')[0] : '',
        end_date: questionnaire.end_date ? questionnaire.end_date.split('T')[0] : ''
      })
      setQuestions(questionnaire.questions || [])
    }
  }, [questionnaire])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }


  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }

    if (questions.length === 0) {
      newErrors.questions = 'Au moins une question est requise'
    }

    if (formData.target_audience_type === 'department' && formData.target_departments.length === 0) {
      newErrors.target_departments = 'Au moins un département doit être sélectionné'
    }

    if (formData.target_audience_type === 'role' && formData.target_roles.length === 0) {
      newErrors.target_roles = 'Au moins un rôle doit être sélectionné'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    const questionnaireData: Questionnaire = {
      id: questionnaire?.id || 0,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      type_display: getTypeDisplay(formData.type),
      status: formData.status,
      status_display: getStatusDisplay(formData.status),
      is_anonymous: formData.is_anonymous,
      allow_multiple_responses: formData.allow_multiple_responses,
      show_results_after_submission: formData.show_results_after_submission,
      target_audience_type: formData.target_audience_type,
      target_audience_type_display: getTargetAudienceDisplay(formData.target_audience_type),
      target_departments: formData.target_departments,
      target_roles: formData.target_roles,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      created_at: questionnaire?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: questionnaire?.created_by || null,
      created_by_name: questionnaire?.created_by_name || 'Utilisateur actuel',
      is_active: formData.status === 'active',
      total_responses: questionnaire?.total_responses || 0,
      response_rate: questionnaire?.response_rate || 0,
      questions: questions
    }

    onSave(questionnaireData)
  }

  const getTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'survey': 'Sondage',
      'quiz': 'Quiz',
      'evaluation': 'Évaluation',
      'feedback': 'Retour d\'expérience',
      'poll': 'Sondage rapide'
    }
    return types[type] || type
  }

  const getStatusDisplay = (status: string) => {
    const statuses: Record<string, string> = {
      'draft': 'Brouillon',
      'active': 'Actif',
      'paused': 'En pause',
      'closed': 'Fermé',
      'archived': 'Archivé'
    }
    return statuses[status] || status
  }

  const getTargetAudienceDisplay = (type: string) => {
    const types: Record<string, string> = {
      'all': 'Tous les employés',
      'department': 'Département spécifique',
      'role': 'Rôle spécifique',
      'custom': 'Audience personnalisée'
    }
    return types[type] || type
  }

  const steps = [
    { id: 1, title: 'Informations générales', icon: Settings },
    { id: 2, title: 'Configuration', icon: Shield },
    { id: 3, title: 'Audience', icon: Users },
    { id: 4, title: 'Questions', icon: BarChart3 },
    { id: 5, title: 'Aperçu', icon: Eye }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'enquête *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Enquête de satisfaction 2024"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez l'objectif de cette enquête..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'enquête
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="survey">Sondage</option>
                <option value="quiz">Quiz</option>
                <option value="evaluation">Évaluation</option>
                <option value="feedback">Retour d'expérience</option>
                <option value="poll">Sondage rapide</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Paramètres de confidentialité</h3>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Enquête anonyme</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.allow_multiple_responses}
                    onChange={(e) => handleInputChange('allow_multiple_responses', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Autoriser les réponses multiples</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.show_results_after_submission}
                    onChange={(e) => handleInputChange('show_results_after_submission', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Afficher les résultats après soumission</span>
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Dates</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audience cible
              </label>
              <select
                value={formData.target_audience_type}
                onChange={(e) => handleInputChange('target_audience_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tous les employés</option>
                <option value="department">Département spécifique</option>
                <option value="role">Rôle spécifique</option>
                <option value="custom">Audience personnalisée</option>
              </select>
            </div>

            {formData.target_audience_type === 'department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Départements *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Production', 'Maintenance', 'Qualité', 'Sécurité', 'RH', 'IT', 'Finance', 'Direction'].map(dept => (
                    <label key={dept} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.target_departments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('target_departments', [...formData.target_departments, dept])
                          } else {
                            handleInputChange('target_departments', formData.target_departments.filter(d => d !== dept))
                          }
                        }}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{dept}</span>
                    </label>
                  ))}
                </div>
                {errors.target_departments && <p className="text-red-500 text-sm mt-1">{errors.target_departments}</p>}
              </div>
            )}

            {formData.target_audience_type === 'role' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôles *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Employé', 'Superviseur', 'Manager', 'Directeur', 'Administrateur'].map(role => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.target_roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('target_roles', [...formData.target_roles, role])
                          } else {
                            handleInputChange('target_roles', formData.target_roles.filter(r => r !== role))
                          }
                        }}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
                {errors.target_roles && <p className="text-red-500 text-sm mt-1">{errors.target_roles}</p>}
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {errors.questions && <p className="text-red-500 text-sm">{errors.questions}</p>}
            <QuestionManager
              questions={questions}
              onQuestionsChange={setQuestions}
            />
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aperçu de l'enquête
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{formData.title}</h3>
                  <p className="text-gray-600 mt-2">{formData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span> {getTypeDisplay(formData.type)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Statut:</span> {getStatusDisplay(formData.status)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Anonyme:</span> {formData.is_anonymous ? 'Oui' : 'Non'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Audience:</span> {getTargetAudienceDisplay(formData.target_audience_type)}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Questions ({questions.length})</h4>
                  <div className="space-y-2">
                    {questions.map((question, index) => (
                      <div key={question.id || index} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                        <span className="text-gray-700">{question.text}</span>
                        <Badge variant="outline" className="text-xs">{question.type_display}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
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
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier l\'enquête' : 'Nouvelle enquête'}
            </h2>
            <p className="text-gray-600">
              {isEditing ? 'Modifiez les détails de votre enquête' : 'Créez une nouvelle enquête pour collecter des retours'}
            </p>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 5 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Mettre à jour' : 'Créer l\'enquête'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
