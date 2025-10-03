"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SatisfactionScaleProps {
  question: {
    id: number
    text: string
    is_required: boolean
    satisfaction_options?: string[]
  }
  value?: string
  onChange: (value: string) => void
  error?: string
}

export function SatisfactionScale({ question, value = "", onChange, error }: SatisfactionScaleProps) {
  // Options par défaut si non fournies
  const defaultOptions = [
    "Très insatisfait",
    "Insatisfait", 
    "Neutre",
    "Satisfait",
    "Très satisfait"
  ]
  
  const options = question.satisfaction_options && question.satisfaction_options.length > 0 
    ? question.satisfaction_options 
    : defaultOptions

  const emojis = ["😞", "😐", "😑", "😊", "😍"]
  
  const handleOptionClick = (option: string) => {
    onChange(option)
  }

  return (
    <div className="space-y-4">
      {/* Affichage des options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {options.map((option, index) => {
          const isSelected = value === option
          const emoji = emojis[index] || "😐"
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 text-center",
                isSelected 
                  ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white border-cyan-500 shadow-lg" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-cyan-300 hover:bg-cyan-50"
              )}
              aria-label={`Sélectionner: ${option}`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-sm font-medium leading-tight">
                {option}
              </div>
            </button>
          )
        })}
      </div>

      {/* Affichage de la sélection */}
      {value && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
            <span>Votre choix:</span>
            <span className="font-bold">{value}</span>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}























