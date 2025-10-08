"use client"

import { Calendar, Clock, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Question {
  id: number
  text: string
  type: string
  type_display: string
  is_required: boolean
  order: number
  options: string[]
  validation_rules?: Record<string, any>
}

interface DateInputProps {
  question: Question
  value?: string
  onChange: (value: string) => void
  error?: string
}

export function DateInput({ question, value, onChange, error }: DateInputProps) {
  const getDateIcon = () => {
    if (question.text.toLowerCase().includes('formation') || question.text.toLowerCase().includes('training')) {
      return <CalendarDays className="h-4 w-4 text-blue-500" />
    } else if (question.text.toLowerCase().includes('naissance') || question.text.toLowerCase().includes('birth')) {
      return <Calendar className="h-4 w-4 text-green-500" />
    } else if (question.text.toLowerCase().includes('début') || question.text.toLowerCase().includes('start')) {
      return <Clock className="h-4 w-4 text-orange-500" />
    } else {
      return <Calendar className="h-4 w-4 text-cyan-500" />
    }
  }

  const getPlaceholder = () => {
    if (question.text.toLowerCase().includes('formation')) {
      return "Sélectionnez la date de votre dernière formation"
    } else if (question.text.toLowerCase().includes('naissance')) {
      return "Sélectionnez votre date de naissance"
    } else if (question.text.toLowerCase().includes('début')) {
      return "Sélectionnez la date de début"
    } else {
      return "Sélectionnez une date"
    }
  }

  const getMinDate = () => {
    // Règles de validation pour les dates
    if (question.validation_rules?.min_date) {
      return question.validation_rules.min_date
    }
    
    // Dates par défaut selon le contexte
    if (question.text.toLowerCase().includes('naissance')) {
      // Date de naissance : pas plus de 100 ans dans le passé
      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() - 100)
      return maxDate.toISOString().split('T')[0]
    } else if (question.text.toLowerCase().includes('formation')) {
      // Formation : pas plus de 50 ans dans le passé
      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() - 50)
      return maxDate.toISOString().split('T')[0]
    }
    
    return undefined
  }

  const getMaxDate = () => {
    if (question.validation_rules?.max_date) {
      return question.validation_rules.max_date
    }
    
    // Par défaut, pas de date future pour la plupart des cas
    if (question.text.toLowerCase().includes('naissance') || question.text.toLowerCase().includes('formation')) {
      return new Date().toISOString().split('T')[0]
    }
    
    return undefined
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ""
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-cyan-50 p-3 rounded-lg border border-cyan-200">
        <div className="flex items-center gap-2 mb-2">
          {getDateIcon()}
          <span className="font-medium text-cyan-800">Instructions :</span>
        </div>
        <p>Cliquez sur le champ de date pour ouvrir le sélecteur et choisir votre date.</p>
      </div>

      {/* Sélecteur de date */}
      <div className="space-y-2">
        <Label htmlFor={`question-${question.id}-date`} className="text-sm font-medium text-gray-700">
          Date
        </Label>
        <div className="relative">
          <Input
            id={`question-${question.id}-date`}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            placeholder={getPlaceholder()}
            className={`
              w-full p-3 border-2 rounded-lg transition-all duration-200
              ${error 
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200' 
                : 'border-cyan-200 bg-white focus:border-cyan-400 focus:ring-cyan-200'
              }
              hover:border-cyan-300 focus:outline-none focus:ring-2
            `}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {getDateIcon()}
          </div>
        </div>
      </div>

      {/* Aperçu de la date sélectionnée */}
      {value && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-800">Date sélectionnée :</span>
          </div>
          <p className="text-cyan-700 font-medium mt-1">
            {formatDisplayDate(value)}
          </p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="text-red-500">⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}

























