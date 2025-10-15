"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  question: {
    id: number
    text: string
    is_required: boolean
    validation_rules?: Record<string, any>
  }
  value?: { start_date: string; end_date: string }
  onChange: (value: { start_date: string; end_date: string }) => void
  error?: string
}

export function DateRangePicker({ question, value = { start_date: "", end_date: "" }, onChange, error }: DateRangePickerProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)

  // Validation de la plage de dates
  const validateDateRange = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return false
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Vérifie que les dates sont valides et que la fin est après le début
    return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime())
  }

  // Validation en temps réel
  const handleDateChange = (field: 'start_date' | 'end_date', dateValue: string) => {
    const newValue = { ...value, [field]: dateValue }
    onChange(newValue)
    
    // Validation
    if (newValue.start_date && newValue.end_date) {
      setIsValid(validateDateRange(newValue.start_date, newValue.end_date))
    } else {
      setIsValid(null)
    }
  }

  const getValidationIcon = () => {
    if (!value.start_date || !value.end_date) return null
    
    if (isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getInputStyles = (field: 'start_date' | 'end_date') => {
    if (!value.start_date || !value.end_date) return ""
    
    if (isValid) {
      return "border-green-300 focus:border-green-500 focus:ring-green-500/20"
    } else {
      return "border-red-300 focus:border-red-500 focus:ring-red-500/20"
    }
  }

  return (
    <div className="space-y-4">
      {/* Sélection des dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date de début */}
        <div className="space-y-2">
          <Label htmlFor={`start-date-${question.id}`} className="text-sm font-medium text-gray-700">
            Date de début
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id={`start-date-${question.id}`}
              type="date"
              value={value.start_date}
              onChange={(e) => handleDateChange('start_date', e.target.value)}
              className={cn(
                "pl-10 h-12 text-base transition-all duration-200",
                getInputStyles('start_date')
              )}
            />
          </div>
        </div>

        {/* Date de fin */}
        <div className="space-y-2">
          <Label htmlFor={`end-date-${question.id}`} className="text-sm font-medium text-gray-700">
            Date de fin
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id={`end-date-${question.id}`}
              type="date"
              value={value.end_date}
              onChange={(e) => handleDateChange('end_date', e.target.value)}
              className={cn(
                "pl-10 h-12 text-base transition-all duration-200",
                getInputStyles('end_date')
              )}
            />
          </div>
        </div>
      </div>

      {/* Affichage de la plage sélectionnée */}
      {value.start_date && value.end_date && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>
              Du {new Date(value.start_date).toLocaleDateString('fr-FR')} au {new Date(value.end_date).toLocaleDateString('fr-FR')}
            </span>
            {getValidationIcon()}
          </div>
        </div>
      )}

      {/* Messages de validation */}
      <div className="space-y-2">
        {value.start_date && value.end_date && !isValid && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            La date de fin doit être postérieure à la date de début
          </p>
        )}
        
        {value.start_date && value.end_date && isValid && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Plage de dates valide
          </p>
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


























