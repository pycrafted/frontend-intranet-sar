"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X, 
  CheckSquare, 
  Circle, 
  List, 
  BarChart3, 
  Star,
  ThumbsUp,
  Hash,
  Grid3X3,
  ArrowUpDown,
  CheckCircle,
  Calendar
} from 'lucide-react'
import { Question } from '@/hooks/useQuestionnaireManagement'

interface QuestionBuilderProps {
  onQuestionAdd: (question: Question) => void
}

export function QuestionBuilder({ onQuestionAdd }: QuestionBuilderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [questionData, setQuestionData] = useState({
    text: '',
    type: 'text',
    is_required: false,
    options: [] as string[],
    newOption: '',
    scale_min: 1,
    scale_max: 5,
    scale_labels: {} as Record<string, string>,
    rating_max: 5,
    rating_labels: [] as string[],
    satisfaction_options: [] as string[],
    ranking_items: [] as string[],
    top_selection_limit: 3,
    matrix_questions: [] as string[],
    matrix_options: [] as string[],
    likert_scale: [] as string[],
    checkbox_text: '',
    validation_rules: {} as Record<string, any>
  })

  const questionTypes = [
    // Types de base
    { 
      id: 'text', 
      label: 'Texte libre', 
      icon: CheckSquare, 
      description: 'Réponse ouverte en texte' 
    },
    { 
      id: 'single_choice', 
      label: 'Choix unique', 
      icon: Circle, 
      description: 'Sélection d\'une seule option' 
    },
    { 
      id: 'multiple_choice', 
      label: 'Choix multiples', 
      icon: CheckSquare, 
      description: 'Sélection de plusieurs options' 
    },
    { 
      id: 'scale', 
      label: 'Échelle', 
      icon: BarChart3, 
      description: 'Note sur une échelle numérique' 
    },
    { 
      id: 'date', 
      label: 'Date', 
      icon: Calendar, 
      description: 'Sélection de date' 
    },
    { 
      id: 'file', 
      label: 'Fichier', 
      icon: CheckSquare, 
      description: 'Upload de fichier' 
    },
    { 
      id: 'rating', 
      label: 'Note', 
      icon: Star, 
      description: 'Note simple' 
    },
    
    // Phase 1 - Nouveaux types
    { 
      id: 'rating_stars', 
      label: 'Étoiles', 
      icon: Star, 
      description: 'Note avec étoiles' 
    },
    { 
      id: 'rating_numeric', 
      label: 'Note sur 10', 
      icon: Hash, 
      description: 'Note numérique sur 10' 
    },
    { 
      id: 'satisfaction_scale', 
      label: 'Échelle de satisfaction', 
      icon: ThumbsUp, 
      description: 'Niveau de satisfaction' 
    },
    { 
      id: 'email', 
      label: 'Email', 
      icon: CheckSquare, 
      description: 'Adresse email' 
    },
    { 
      id: 'phone', 
      label: 'Téléphone', 
      icon: CheckSquare, 
      description: 'Numéro de téléphone' 
    },
    { 
      id: 'required_checkbox', 
      label: 'Case obligatoire', 
      icon: CheckSquare, 
      description: 'Case à cocher obligatoire' 
    },
    { 
      id: 'date_range', 
      label: 'Plage de dates', 
      icon: Calendar, 
      description: 'Période entre deux dates' 
    },
    
    // Phase 2 - Fonctionnalités avancées
    { 
      id: 'ranking', 
      label: 'Classement', 
      icon: ArrowUpDown, 
      description: 'Ordre de préférence' 
    },
    { 
      id: 'top_selection', 
      label: 'Top 3', 
      icon: ArrowUpDown, 
      description: 'Sélection des meilleurs éléments' 
    },
    { 
      id: 'matrix', 
      label: 'Matrice de choix', 
      icon: Grid3X3, 
      description: 'Questions en grille' 
    },
    { 
      id: 'likert', 
      label: 'Échelle de Likert', 
      icon: CheckCircle, 
      description: 'Accord/Désaccord' 
    }
  ]

  const handleInputChange = (field: string, value: any) => {
    setQuestionData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddOption = () => {
    if (questionData.newOption.trim()) {
      setQuestionData(prev => ({
        ...prev,
        options: [...prev.options, prev.newOption.trim()],
        newOption: ''
      }))
    }
  }

  const handleRemoveOption = (index: number) => {
    setQuestionData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const handleAddArrayItem = (field: string) => {
    const newItem = prompt(`Ajouter un nouvel élément pour ${field}:`)
    if (newItem?.trim()) {
      setQuestionData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), newItem.trim()]
      }))
    }
  }

  const handleRemoveArrayItem = (field: string, index: number) => {
    setQuestionData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    if (!questionData.text.trim()) {
      alert('Le texte de la question est requis')
      return
    }

    const question: Question = {
      id: 0, // Sera assigné par le backend
      text: questionData.text,
      type: questionData.type as any,
      type_display: questionTypes.find(t => t.id === questionData.type)?.label || questionData.type,
      is_required: questionData.is_required,
      order: 0, // Sera réassigné par le parent
      options: questionData.options,
      scale_min: questionData.scale_min,
      scale_max: questionData.scale_max,
      scale_labels: questionData.scale_labels,
      rating_max: questionData.rating_max,
      rating_labels: questionData.rating_labels,
      satisfaction_options: questionData.satisfaction_options,
      ranking_items: questionData.ranking_items,
      top_selection_limit: questionData.top_selection_limit,
      matrix_questions: questionData.matrix_questions,
      matrix_options: questionData.matrix_options,
      likert_scale: questionData.likert_scale,
      checkbox_text: questionData.checkbox_text,
      validation_rules: questionData.validation_rules
    }

    onQuestionAdd(question)
    setIsOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setQuestionData({
      text: '',
      type: 'text',
      is_required: false,
      options: [],
      newOption: '',
      scale_min: 1,
      scale_max: 5,
      scale_labels: {},
      rating_max: 5,
      rating_labels: [],
      satisfaction_options: [],
      ranking_items: [],
      top_selection_limit: 3,
      matrix_questions: [],
      matrix_options: [],
      likert_scale: [],
      checkbox_text: '',
      validation_rules: {}
    })
  }

  const renderQuestionConfig = () => {
    switch (questionData.type) {
      case 'single_choice':
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options de réponse
              </label>
              <div className="space-y-2">
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionData.options]
                        newOptions[index] = e.target.value
                        handleInputChange('options', newOptions)
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={questionData.newOption}
                    onChange={(e) => handleInputChange('newOption', e.target.value)}
                    placeholder="Nouvelle option..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                  />
                  <Button onClick={handleAddOption} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur minimale
                </label>
                <Input
                  type="number"
                  value={questionData.scale_min}
                  onChange={(e) => handleInputChange('scale_min', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur maximale
                </label>
                <Input
                  type="number"
                  value={questionData.scale_max}
                  onChange={(e) => handleInputChange('scale_max', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )

      case 'rating':
      case 'rating_stars':
      case 'rating_numeric':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note maximum
              </label>
              <Input
                type="number"
                value={questionData.rating_max}
                onChange={(e) => handleInputChange('rating_max', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
          </div>
        )

      case 'satisfaction_scale':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options de satisfaction
              </label>
              <div className="space-y-2">
                {questionData.satisfaction_options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={option} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveArrayItem('satisfaction_options', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddArrayItem('satisfaction_options')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
            </div>
          </div>
        )

      case 'required_checkbox':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte de la case à cocher
              </label>
              <Input
                value={questionData.checkbox_text}
                onChange={(e) => handleInputChange('checkbox_text', e.target.value)}
                placeholder="J'accepte les conditions..."
              />
            </div>
          </div>
        )

      case 'ranking':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Éléments à classer
              </label>
              <div className="space-y-2">
                {questionData.ranking_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveArrayItem('ranking_items', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddArrayItem('ranking_items')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un élément
                </Button>
              </div>
            </div>
          </div>
        )

      case 'top_selection':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Éléments à sélectionner
              </label>
              <div className="space-y-2">
                {questionData.ranking_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveArrayItem('ranking_items', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddArrayItem('ranking_items')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un élément
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'éléments à sélectionner
              </label>
              <Input
                type="number"
                value={questionData.top_selection_limit}
                onChange={(e) => handleInputChange('top_selection_limit', parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>
        )

      case 'matrix':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Questions de la matrice
              </label>
              <div className="space-y-2">
                {questionData.matrix_questions.map((question, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={question} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveArrayItem('matrix_questions', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddArrayItem('matrix_questions')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une question
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options de réponse
              </label>
              <div className="space-y-2">
                {questionData.matrix_options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={option} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveArrayItem('matrix_options', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddArrayItem('matrix_options')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
            </div>
          </div>
        )

      case 'likert':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Échelle de Likert
              </label>
              <div className="space-y-2">
                {questionData.likert_scale.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveArrayItem('likert_scale', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddArrayItem('likert_scale')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
            </div>
          </div>
        )

      case 'email':
      case 'phone':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Règles de validation
              </label>
              <div className="text-sm text-gray-500">
                {questionData.type === 'email' 
                  ? 'Validation automatique du format email'
                  : 'Validation automatique du format téléphone'
                }
              </div>
            </div>
          </div>
        )

      case 'date':
      case 'date_range':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration de la date
              </label>
              <div className="text-sm text-gray-500">
                {questionData.type === 'date' 
                  ? 'Sélection d\'une date unique'
                  : 'Sélection d\'une plage de dates (début et fin)'
                }
              </div>
            </div>
          </div>
        )

      case 'file':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration du fichier
              </label>
              <div className="text-sm text-gray-500">
                Upload de fichier avec validation automatique
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="bg-red-600 hover:bg-red-700">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une question
      </Button>
    )
  }

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Nouvelle question</span>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type de question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de question
            </label>
            <div className="grid grid-cols-2 gap-3">
              {questionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleInputChange('type', type.id)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    questionData.type === type.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <type.icon className="h-4 w-4" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Texte de la question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte de la question *
            </label>
            <Textarea
              value={questionData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              placeholder="Posez votre question ici..."
              rows={3}
            />
          </div>

          {/* Configuration spécifique au type */}
          {renderQuestionConfig()}

          {/* Options générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Options</h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={questionData.is_required}
                onChange={(e) => handleInputChange('is_required', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Question obligatoire</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
              Ajouter la question
            </Button>
          </div>
        </CardContent>
      </Card>
    </Card>
  )
}
