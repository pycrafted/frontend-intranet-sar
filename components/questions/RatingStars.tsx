"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
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

export function RatingStars({ question, value = 0, onChange, error }: RatingStarsProps) {
  const maxStars = question.rating_max || 5
  const labels = question.rating_labels || []
  
  const [hoveredStar, setHoveredStar] = useState(0)

  const handleStarClick = (starValue: number) => {
    onChange(starValue)
  }

  const handleStarHover = (starValue: number) => {
    setHoveredStar(starValue)
  }

  const handleMouseLeave = () => {
    setHoveredStar(0)
  }

  return (
    <div className="space-y-4">
      {/* Affichage des étoiles */}
      <div 
        className="flex items-center gap-2 justify-center"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1
          const isActive = starValue <= (hoveredStar || value)
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              className={cn(
                "transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-full p-1",
                isActive 
                  ? "text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-300"
              )}
              aria-label={`Noter ${starValue} étoile${starValue > 1 ? 's' : ''}`}
            >
              <Star 
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  isActive && "drop-shadow-lg"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
            </button>
          )
        })}
      </div>

      {/* Affichage de la valeur et du label */}
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-cyan-600">
          {value > 0 ? `${value}/${maxStars}` : 'Non noté'}
        </div>
        
        {labels[value - 1] && (
          <div className="text-sm text-gray-600 font-medium">
            {labels[value - 1]}
          </div>
        )}
        
        {value === 0 && question.is_required && (
          <div className="text-sm text-gray-500">
            Cliquez sur une étoile pour noter
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
























