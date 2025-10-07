"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RequiredCheckboxProps {
  question: {
    id: number
    text: string
    is_required: boolean
    checkbox_text?: string
  }
  value?: boolean
  onChange: (value: boolean) => void
  error?: string
}

export function RequiredCheckbox({ question, value = false, onChange, error }: RequiredCheckboxProps) {
  const checkboxText = question.checkbox_text || "J'accepte les conditions"
  
  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked)
  }

  return (
    <div className="space-y-3">
      {/* Case à cocher avec validation visuelle */}
      <div className={cn(
        "flex items-start space-x-3 p-4 rounded-xl border-2 transition-all duration-200",
        value 
          ? "bg-green-50 border-green-200" 
          : error 
          ? "bg-red-50 border-red-200" 
          : "bg-gray-50 border-gray-200 hover:border-cyan-300"
      )}>
        <Checkbox
          id={`checkbox-${question.id}`}
          checked={value}
          onCheckedChange={handleCheckboxChange}
          className={cn(
            "mt-1 transition-all duration-200",
            value && "border-green-500 bg-green-500"
          )}
        />
        
        <div className="flex-1 space-y-2">
          <Label 
            htmlFor={`checkbox-${question.id}`}
            className={cn(
              "text-sm font-medium cursor-pointer transition-colors duration-200",
              value ? "text-green-800" : error ? "text-red-800" : "text-gray-700"
            )}
          >
            {checkboxText}
          </Label>
          
          {/* Icône de validation */}
          <div className="flex items-center gap-2">
            {value ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Accepté</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <XCircle className="h-4 w-4" />
                <span>Requis</span>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Cochez pour continuer
              </div>
            )}
          </div>
        </div>
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
























