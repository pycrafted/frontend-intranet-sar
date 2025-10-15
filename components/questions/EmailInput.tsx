"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailInputProps {
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

export function EmailInput({ question, value = "", onChange, error }: EmailInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Validation email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validation en temps réel
  useEffect(() => {
    if (value.length > 0) {
      setIsValid(validateEmail(value))
    } else {
      setIsValid(null)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value
    onChange(emailValue)
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
          <Mail className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          type="email"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="exemple@entreprise.com"
          className={cn(
            "pl-10 pr-10 h-12 text-base transition-all duration-200",
            getInputStyles()
          )}
          aria-describedby={`email-help-${question.id}`}
        />
        
        {/* Icône de validation */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {getValidationIcon()}
        </div>
      </div>

      {/* Messages d'aide et de validation */}
      <div id={`email-help-${question.id}`} className="space-y-2">
        {value.length === 0 && !isFocused && (
          <p className="text-sm text-gray-500">
            Entrez une adresse email valide
          </p>
        )}
        
        {value.length > 0 && isValid && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Email valide
          </p>
        )}
        
        {value.length > 0 && !isValid && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Format d'email invalide
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


























