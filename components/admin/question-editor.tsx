"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  X, 
  Settings,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy
} from 'lucide-react'
import { Question } from '@/hooks/useQuestionnaireManagement'

interface QuestionEditorProps {
  question: Question
  onSave: (question: Question) => void
  onCancel: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export function QuestionEditor({
  question,
  onSave,
  onCancel,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false
}: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question>({ ...question })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setEditedQuestion(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddOption = () => {
    setEditedQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }))
  }

  const handleRemoveOption = (index: number) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: (prev.options || []).map((opt, i) => i === index ? value : opt)
    }))
  }

  const validateQuestion = () => {
    const newErrors: Record<string, string> = {}

    if (!editedQuestion.text.trim()) {
      newErrors.text = 'Le texte de la question est requis'
    }

    if (['choice', 'multiple_choice'].includes(editedQuestion.type)) {
      if (!editedQuestion.options || editedQuestion.options.length === 0) {
        newErrors.options = 'Au moins une option est requise'
      } else if (editedQuestion.options.some(opt => !opt.trim())) {
        newErrors.options = 'Toutes les options doivent être remplies'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateQuestion()) {
      onSave(editedQuestion)
    }
  }

  const renderQuestionConfig = () => {
    switch (editedQuestion.type) {
      case 'choice':
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options de réponse
              </label>
              <div className="space-y-2">
                {(editedQuestion.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
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
                <Button onClick={handleAddOption} variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
              {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
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
                  value={editedQuestion.scale_min || 1}
                  onChange={(e) => handleInputChange('scale_min', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur maximale
                </label>
                <Input
                  type="number"
                  value={editedQuestion.scale_max || 5}
                  onChange={(e) => handleInputChange('scale_max', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )

      case 'rating':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'étoiles maximum
              </label>
              <Input
                type="number"
                value={editedQuestion.rating_max || 5}
                onChange={(e) => handleInputChange('rating_max', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="border-2 border-red-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Question {question.order}
            </Badge>
            <Badge variant="outline">
              {editedQuestion.type_display}
            </Badge>
            {editedQuestion.is_required && (
              <Badge className="bg-red-100 text-red-800">
                Obligatoire
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onMoveUp && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDuplicate}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Texte de la question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte de la question *
          </label>
          <Textarea
            value={editedQuestion.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="Posez votre question ici..."
            rows={3}
            className={errors.text ? 'border-red-500' : ''}
          />
          {errors.text && <p className="text-red-500 text-sm mt-1">{errors.text}</p>}
        </div>

        {/* Configuration spécifique au type */}
        {renderQuestionConfig()}

        {/* Options générales */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Options</h3>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={editedQuestion.is_required}
              onChange={(e) => handleInputChange('is_required', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Question obligatoire</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
