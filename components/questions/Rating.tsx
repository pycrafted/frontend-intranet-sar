"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Star, ThumbsUp, Heart, CheckCircle } from "lucide-react"

interface Question {
  id: number
  text: string
  type: string
  type_display: string
  is_required: boolean
  order: number
  options: string[]
  rating_max?: number
  rating_labels?: string[]
}

interface RatingProps {
  question: Question
  value?: string
  onChange: (value: string) => void
  error?: string
}

export function Rating({ question, value, onChange, error }: RatingProps) {
  const getRatingIcon = (option: string, index: number) => {
    // Utiliser des icônes différentes selon le type d'évaluation
    if (question.text.toLowerCase().includes('satisfaction') || question.text.toLowerCase().includes('qualité')) {
      return <Star className="h-4 w-4 text-yellow-500" />
    } else if (question.text.toLowerCase().includes('recommandation') || question.text.toLowerCase().includes('recommandez')) {
      return <ThumbsUp className="h-4 w-4 text-green-500" />
    } else if (question.text.toLowerCase().includes('sécurité') || question.text.toLowerCase().includes('safety')) {
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    } else {
      // Icône par défaut basée sur l'index
      const icons = [Star, ThumbsUp, Heart, CheckCircle]
      const IconComponent = icons[index % icons.length]
      return <IconComponent className="h-4 w-4 text-cyan-500" />
    }
  }

  const getRatingColor = (option: string, index: number) => {
    // Couleurs basées sur le niveau d'évaluation
    if (option.toLowerCase().includes('excellent') || option.toLowerCase().includes('très bon')) {
      return 'from-green-400 to-green-500'
    } else if (option.toLowerCase().includes('bon') || option.toLowerCase().includes('bien')) {
      return 'from-blue-400 to-blue-500'
    } else if (option.toLowerCase().includes('moyen') || option.toLowerCase().includes('correct')) {
      return 'from-yellow-400 to-yellow-500'
    } else if (option.toLowerCase().includes('mauvais') || option.toLowerCase().includes('médiocre')) {
      return 'from-orange-400 to-orange-500'
    } else if (option.toLowerCase().includes('très mauvais') || option.toLowerCase().includes('terrible')) {
      return 'from-red-400 to-red-500'
    } else {
      // Couleur par défaut basée sur l'index
      const colors = [
        'from-red-400 to-red-500',
        'from-orange-400 to-orange-500', 
        'from-yellow-400 to-yellow-500',
        'from-blue-400 to-blue-500',
        'from-green-400 to-green-500'
      ]
      return colors[index % colors.length]
    }
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-cyan-50 p-3 rounded-lg border border-cyan-200">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 text-cyan-600" />
          <span className="font-medium text-cyan-800">Instructions :</span>
        </div>
        <p>Sélectionnez votre évaluation en cliquant sur l'option qui correspond le mieux à votre avis.</p>
      </div>

      {/* Options d'évaluation */}
      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        className="space-y-3"
      >
        {question.options.map((option, optionIndex) => {
          const isSelected = value === option
          const gradientClass = getRatingColor(option, optionIndex)
          const IconComponent = getRatingIcon(option, optionIndex)
          
          return (
            <div key={optionIndex} className="relative">
              <RadioGroupItem 
                value={option} 
                id={`question-${question.id}-rating-${optionIndex}`} 
                className="sr-only"
              />
              <Label 
                htmlFor={`question-${question.id}-rating-${optionIndex}`}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? `bg-gradient-to-r ${gradientClass} text-white border-transparent shadow-lg transform scale-105` 
                    : 'bg-white border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-md'
                  }
                `}
              >
                {/* Icône */}
                <div className={`
                  p-2 rounded-full transition-colors
                  ${isSelected 
                    ? 'bg-white/20' 
                    : 'bg-gray-100'
                  }
                `}>
                  {IconComponent}
                </div>
                
                {/* Texte de l'option */}
                <div className="flex-1">
                  <span className="font-medium text-sm">
                    {option}
                  </span>
                </div>
                
                {/* Indicateur de sélection */}
                {isSelected && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                    <span className="text-xs font-medium">Sélectionné</span>
                  </div>
                )}
              </Label>
            </div>
          )
        })}
      </RadioGroup>

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





















