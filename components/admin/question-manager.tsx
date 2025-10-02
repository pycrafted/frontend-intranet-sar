"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Settings, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Copy,
  Eye,
  Edit
} from 'lucide-react'
import { Question } from '@/hooks/useQuestionnaireManagement'
import { QuestionBuilder } from './question-builder'
import { QuestionEditor } from './question-editor'

interface QuestionManagerProps {
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
}

export function QuestionManager({ questions, onQuestionsChange }: QuestionManagerProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)

  const handleQuestionAdd = (newQuestion: Question) => {
    const updatedQuestions = [...questions, { ...newQuestion, order: questions.length + 1 }]
    onQuestionsChange(updatedQuestions)
    setShowBuilder(false)
  }

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    )
    onQuestionsChange(updatedQuestions)
    setEditingQuestion(null)
  }

  const handleQuestionDelete = (questionId: number) => {
    const updatedQuestions = questions
      .filter(q => q.id !== questionId)
      .map((q, index) => ({ ...q, order: index + 1 }))
    onQuestionsChange(updatedQuestions)
  }

  const handleQuestionDuplicate = (question: Question) => {
    const duplicatedQuestion = {
      ...question,
      id: Date.now(), // ID temporaire
      order: questions.length + 1
    }
    const updatedQuestions = [...questions, duplicatedQuestion]
    onQuestionsChange(updatedQuestions)
  }

  const handleQuestionMove = (questionId: number, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= questions.length) return

    const updatedQuestions = [...questions]
    const [movedQuestion] = updatedQuestions.splice(currentIndex, 1)
    updatedQuestions.splice(newIndex, 0, movedQuestion)

    // Réassigner les ordres
    const reorderedQuestions = updatedQuestions.map((q, index) => ({ ...q, order: index + 1 }))
    onQuestionsChange(reorderedQuestions)
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝'
      case 'choice': return '🔘'
      case 'multiple_choice': return '☑️'
      case 'scale': return '📊'
      case 'rating': return '⭐'
      case 'satisfaction': return '👍'
      case 'number': return '🔢'
      case 'matrix': return '📋'
      case 'ranking': return '🔢'
      case 'likert': return '📈'
      default: return '❓'
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800'
      case 'choice': return 'bg-green-100 text-green-800'
      case 'multiple_choice': return 'bg-purple-100 text-purple-800'
      case 'scale': return 'bg-orange-100 text-orange-800'
      case 'rating': return 'bg-yellow-100 text-yellow-800'
      case 'satisfaction': return 'bg-pink-100 text-pink-800'
      case 'number': return 'bg-indigo-100 text-indigo-800'
      case 'matrix': return 'bg-gray-100 text-gray-800'
      case 'ranking': return 'bg-red-100 text-red-800'
      case 'likert': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (editingQuestion) {
    return (
      <QuestionEditor
        question={editingQuestion}
        onSave={handleQuestionUpdate}
        onCancel={() => setEditingQuestion(null)}
        onDelete={() => {
          handleQuestionDelete(editingQuestion.id)
          setEditingQuestion(null)
        }}
        onDuplicate={() => {
          handleQuestionDuplicate(editingQuestion)
          setEditingQuestion(null)
        }}
        onMoveUp={() => handleQuestionMove(editingQuestion.id, 'up')}
        onMoveDown={() => handleQuestionMove(editingQuestion.id, 'down')}
        canMoveUp={questions.findIndex(q => q.id === editingQuestion.id) > 0}
        canMoveDown={questions.findIndex(q => q.id === editingQuestion.id) < questions.length - 1}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Questions ({questions.length})
          </h3>
          <p className="text-sm text-gray-600">
            Gérez les questions de votre enquête
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowBuilder(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une question
          </Button>
        </div>
      </div>

      {/* Liste des questions */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Settings className="h-12 w-12 mx-auto" />
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Aucune question
              </h4>
              <p className="text-gray-500 mb-4">
                Commencez par ajouter votre première question
              </p>
              <Button
                onClick={() => setShowBuilder(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={`question-${question.id}-${index}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {question.order}
                      </Badge>
                      <Badge className={getQuestionTypeColor(question.type)}>
                        <span className="mr-1">{getQuestionTypeIcon(question.type)}</span>
                        {question.type_display}
                      </Badge>
                      {question.is_required && (
                        <Badge className="bg-red-100 text-red-800">
                          Obligatoire
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {question.text}
                    </h4>
                    {question.options && question.options.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Options:</span>{' '}
                        {question.options.slice(0, 3).join(', ')}
                        {question.options.length > 3 && ` +${question.options.length - 3} autres`}
                      </div>
                    )}
                    {question.scale_min && question.scale_max && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Échelle:</span>{' '}
                        {question.scale_min} - {question.scale_max}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuestion(question)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionDuplicate(question)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionMove(question.id, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionMove(question.id, 'down')}
                      disabled={index === questions.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionDelete(question.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Constructeur de questions */}
      {showBuilder && (
        <QuestionBuilder onQuestionAdd={handleQuestionAdd} />
      )}
    </div>
  )
}
