"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LikertScaleProps {
  question: {
    id: number
    text: string
    is_required: boolean
    likert_scale?: string[]
  }
  value?: string
  onChange: (value: string) => void
  error?: string
}

export function LikertScale({ question, value = "", onChange, error }: LikertScaleProps) {
  const [selectedValue, setSelectedValue] = useState(value)

  // Échelle de Likert par défaut si non fournie
  const defaultLikertScale = [
    "Pas du tout d'accord",
    "Plutôt pas d'accord", 
    "Neutre",
    "Plutôt d'accord",
    "Tout à fait d'accord"
  ]

  const likertOptions = question.likert_scale && question.likert_scale.length > 0 
    ? question.likert_scale 
    : defaultLikertScale

  // Mettre à jour la valeur quand elle change
  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onChange(newValue)
  }

  const getLikertColor = (option: string, index: number) => {
    if (selectedValue === option) {
      // Couleur basée sur l'index (du rouge au vert)
      const colors = [
        "bg-red-500", // Pas du tout d'accord
        "bg-orange-500", // Plutôt pas d'accord
        "bg-yellow-500", // Neutre
        "bg-blue-500", // Plutôt d'accord
        "bg-green-500" // Tout à fait d'accord
      ]
      return colors[index] || "bg-gray-500"
    }
    return "bg-gray-200"
  }

  const getLikertIcon = (index: number) => {
    const icons = ["😞", "😐", "😑", "😊", "😍"]
    return icons[index] || "😐"
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-indigo-600 rounded text-white text-xs flex items-center justify-center font-bold">L</div>
          <span className="font-medium text-indigo-800">Instructions :</span>
        </div>
        <p>Sélectionnez le niveau d'accord qui correspond le mieux à votre opinion.</p>
      </div>

      {/* Échelle de Likert */}
      <div className="space-y-3">
        {likertOptions.map((option, index) => {
          const isSelected = selectedValue === option
          const totalOptions = likertOptions.length
          const percentage = ((index + 1) / totalOptions) * 100

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                "hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2",
                isSelected
                  ? "bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-400 shadow-md"
                  : "bg-white border-gray-200 hover:border-indigo-300"
              )}
            >
              {/* Radio button */}
              <RadioGroup
                value={selectedValue}
                onValueChange={handleValueChange}
                className="flex items-center"
              >
                <RadioGroupItem 
                  value={option} 
                  id={`${question.id}-likert-${index}`}
                  className="text-indigo-600"
                />
              </RadioGroup>

              {/* Emoji */}
              <div className="text-2xl">
                {getLikertIcon(index)}
              </div>

              {/* Texte de l'option */}
              <Label 
                htmlFor={`${question.id}-likert-${index}`}
                className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
              >
                {option}
              </Label>

              {/* Barre de progression visuelle */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      isSelected ? getLikertColor(option, index) : "bg-gray-300"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {index + 1}/{totalOptions}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Affichage de la sélection */}
      {selectedValue && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getLikertIcon(likertOptions.indexOf(selectedValue))}
            </div>
            <div>
              <h4 className="font-medium text-indigo-800">Votre réponse :</h4>
              <p className="text-indigo-700 font-medium">{selectedValue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}























