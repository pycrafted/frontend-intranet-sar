"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface RatingNumericProps {
  question: {
    id: number
    text: string
    is_required: boolean
    rating_max?: number
    rating_labels?: string[]
  }
  value?: number
  onChange: (value: number) => void
  error?: string
}

export function RatingNumeric({ question, value = 0, onChange, error }: RatingNumericProps) {
  const maxRating = question.rating_max || 10
  const labels = question.rating_labels || []
  
  const [hoveredValue, setHoveredValue] = useState(0)

  const handleValueClick = (ratingValue: number) => {
    onChange(ratingValue)
  }

  const handleValueHover = (ratingValue: number) => {
    setHoveredValue(ratingValue)
  }

  const handleMouseLeave = () => {
    setHoveredValue(0)
  }

  return (
    <div className="space-y-4">
      {/* Affichage des boutons de notation */}
      <div 
        className="flex items-center gap-2 justify-center flex-wrap"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const ratingValue = index + 1
          const isActive = ratingValue <= (hoveredValue || value)
          const isHovered = ratingValue <= hoveredValue && hoveredValue > 0
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleValueClick(ratingValue)}
              onMouseEnter={() => handleValueHover(ratingValue)}
              className={cn(
                "w-12 h-12 rounded-full border-2 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 font-bold text-sm",
                isActive 
                  ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white border-cyan-500 shadow-lg" 
                  : isHovered
                  ? "bg-cyan-100 text-cyan-700 border-cyan-300"
                  : "bg-white text-gray-600 border-gray-300 hover:border-cyan-300 hover:text-cyan-600"
              )}
              aria-label={`Noter ${ratingValue}/${maxRating}`}
            >
              {ratingValue}
            </button>
          )
        })}
      </div>

      {/* Affichage de la valeur et du label */}
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-cyan-600">
          {value > 0 ? `${value}/${maxRating}` : 'Non noté'}
        </div>
        
        {labels[value - 1] && (
          <div className="text-sm text-gray-600 font-medium">
            {labels[value - 1]}
          </div>
        )}
        
        {value === 0 && question.is_required && (
          <div className="text-sm text-gray-500">
            Cliquez sur un nombre pour noter
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}


























