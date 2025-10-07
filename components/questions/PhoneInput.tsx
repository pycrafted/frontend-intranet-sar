"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Phone, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  question: {
    id: number
    text: string
    is_required: boolean
    validation_rules?: Record<string, any>
  }
  value?: string
  onChange: (value: string) => void
  error?: string
}

export function PhoneInput({ question, value = "", onChange, error }: PhoneInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Validation téléphone (format international simplifié)
  const validatePhone = (phone: string): boolean => {
    // Supprime tous les espaces, tirets et parenthèses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    
    // Vérifie que c'est un numéro valide (au moins 8 chiffres, max 15)
    const phoneRegex = /^[\+]?[0-9]{8,15}$/
    return phoneRegex.test(cleanPhone)
  }

  // Formatage du numéro pendant la saisie
  const formatPhoneNumber = (input: string): string => {
    // Supprime tout sauf les chiffres et le +
    const cleaned = input.replace(/[^\d\+]/g, '')
    
    // Si commence par +, garde le +
    if (cleaned.startsWith('+')) {
      return '+' + cleaned.slice(1).replace(/\D/g, '')
    }
    
    // Sinon, garde seulement les chiffres
    return cleaned.replace(/\D/g, '')
  }

  // Validation en temps réel
  useEffect(() => {
    if (value.length > 0) {
      setIsValid(validatePhone(value))
    } else {
      setIsValid(null)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    onChange(formattedValue)
  }

  const getValidationIcon = () => {
    if (value.length === 0) return null
    
    if (isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getInputStyles = () => {
    if (value.length === 0) return ""
    
    if (isValid) {
      return "border-green-300 focus:border-green-500 focus:ring-green-500/20"
    } else {
      return "border-red-300 focus:border-red-500 focus:ring-red-500/20"
    }
  }

  return (
    <div className="space-y-3">
      {/* Input avec validation visuelle */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          type="tel"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="+221 77 123 45 67"
          className={cn(
            "pl-10 pr-10 h-12 text-base transition-all duration-200",
            getInputStyles()
          )}
          aria-describedby={`phone-help-${question.id}`}
        />
        
        {/* Icône de validation */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {getValidationIcon()}
        </div>
      </div>

      {/* Messages d'aide et de validation */}
      <div id={`phone-help-${question.id}`} className="space-y-2">
        {value.length === 0 && !isFocused && (
          <p className="text-sm text-gray-500">
            Entrez un numéro de téléphone (ex: +221 77 123 45 67)
          </p>
        )}
        
        {value.length > 0 && isValid && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Numéro valide
          </p>
        )}
        
        {value.length > 0 && !isValid && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Format de numéro invalide
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
























