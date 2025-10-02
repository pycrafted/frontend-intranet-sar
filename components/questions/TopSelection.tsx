"use client"

import { useState, useEffect } from "react"
import { Check, X, Trophy, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopSelectionProps {
  question: {
    id: number
    text: string
    is_required: boolean
    options: string[]
    top_selection_limit?: number
  }
  value?: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function TopSelection({ question, value = [], onChange, error }: TopSelectionProps) {
  const limit = question.top_selection_limit || 3

  const handleItemToggle = (item: string) => {
    let newSelection: string[]
    
    if (value.includes(item)) {
      // Désélectionner l'élément
      newSelection = value.filter(selected => selected !== item)
    } else {
      // Vérifier la limite
      if (value.length >= limit) {
        return // Ne pas ajouter si la limite est atteinte
      }
      // Ajouter l'élément
      newSelection = [...value, item]
    }
    
    onChange(newSelection)
  }

  const getItemStatus = (item: string) => {
    if (value.includes(item)) {
      return 'selected'
    } else if (value.length >= limit) {
      return 'disabled'
    } else {
      return 'available'
    }
  }

  const getItemIcon = (item: string) => {
    const status = getItemStatus(item)
    const index = value.indexOf(item)
    
    if (status === 'selected') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">{index + 1}</span>
          </div>
          <Trophy className="h-4 w-4 text-yellow-600" />
        </div>
      )
    } else if (status === 'disabled') {
      return <X className="h-4 w-4 text-gray-300" />
    } else {
      return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-yellow-600" />
          <span className="font-medium text-yellow-800">Instructions :</span>
        </div>
        <p>Sélectionnez vos <strong>{limit} meilleures options</strong> en cliquant dessus. L'ordre de sélection détermine votre classement.</p>
      </div>

      {/* Compteur de sélection */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          Sélectionnées : {value.length}/{limit}
        </span>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Liste des options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, optionIndex) => {
          const status = getItemStatus(option)
          const isSelected = value.includes(option)
          const position = value.indexOf(option) + 1

          return (
            <button
              key={optionIndex}
              type="button"
              onClick={() => handleItemToggle(option)}
              disabled={status === 'disabled'}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 text-left",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isSelected
                  ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400 shadow-md"
                  : status === 'disabled'
                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                {getItemIcon(option)}
                <span className={cn(
                  "font-medium",
                  isSelected ? "text-yellow-800" : status === 'disabled' ? "text-gray-400" : "text-gray-700"
                )}>
                  {option}
                </span>
              </div>

              {isSelected && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Check className="h-4 w-4" />
                  <span className="text-xs font-bold">#{position}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Résumé de la sélection */}
      {value.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Votre Top {value.length} :
          </h4>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{index + 1}</span>
                </div>
                <span className="text-yellow-800 font-medium">{item}</span>
              </div>
            ))}
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
