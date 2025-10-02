"use client"

import { RatingStars } from "./RatingStars"
import { RatingNumeric } from "./RatingNumeric"
import { SatisfactionScale } from "./SatisfactionScale"
import { EmailInput } from "./EmailInput"
import { PhoneInput } from "./PhoneInput"
import { RequiredCheckbox } from "./RequiredCheckbox"
import { DateRangePicker } from "./DateRangePicker"
import { DateInput } from "./DateInput"
import { FileInput } from "./FileInput"
import { RankingList } from "./RankingList"
import { TopSelection } from "./TopSelection"
import { MatrixQuestion } from "./MatrixQuestion"
import { LikertScale } from "./LikertScale"
import { Rating } from "./Rating"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Question {
  id: number
  text: string
  type: string
  type_display: string
  is_required: boolean
  order: number
  options: string[]
  scale_min?: number
  scale_max?: number
  scale_labels?: Record<string, string>
  // Phase 1 - Nouveaux champs
  rating_max?: number
  rating_labels?: string[]
  satisfaction_options?: string[]
  validation_rules?: Record<string, any>
  checkbox_text?: string
  // Phase 2 - Nouveaux champs
  ranking_items?: string[]
  top_selection_limit?: number
  matrix_questions?: string[]
  matrix_options?: string[]
  likert_scale?: string[]
}

interface QuestionFactoryProps {
  question: Question
  value?: any
  onChange: (value: any) => void
  error?: string
}

export function QuestionFactory({ question, value, onChange, error }: QuestionFactoryProps) {
  // Types existants
  if (question.type === 'single_choice') {
    return (
      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        className="space-y-3"
      >
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
            <RadioGroupItem value={option} id={`question-${question.id}-option-${optionIndex}`} className="text-cyan-600" />
            <Label htmlFor={`question-${question.id}-option-${optionIndex}`} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    )
  }

  if (question.type === 'multiple_choice') {
    return (
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
            <input
              type="checkbox"
              id={`question-${question.id}-option-${optionIndex}`}
              checked={(value || []).includes(option)}
              onChange={(e) => {
                const currentAnswers = value || []
                const newAnswers = e.target.checked
                  ? [...currentAnswers, option]
                  : currentAnswers.filter(a => a !== option)
                onChange(newAnswers)
              }}
              className="text-cyan-600"
            />
            <Label htmlFor={`question-${question.id}-option-${optionIndex}`} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>
    )
  }

  if (question.type === 'text') {
    return (
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Votre réponse..."
        rows={4}
        className="border-cyan-200 focus:border-cyan-400 bg-white rounded-lg shadow-sm"
      />
    )
  }

  if (question.type === 'scale') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{question.scale_min}</span>
          <span>{question.scale_max}</span>
        </div>
        <input
          type="range"
          min={question.scale_min}
          max={question.scale_max}
          value={value || question.scale_min}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-center">
          <span className="text-lg font-bold text-cyan-600">
            {value || question.scale_min}
          </span>
        </div>
      </div>
    )
  }

  if (question.type === 'date') {
    return (
      <DateInput 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'file') {
    return (
      <FileInput 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  // Phase 1 - Nouveaux types
  if (question.type === 'rating_stars') {
    return (
      <RatingStars 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'rating_numeric') {
    return (
      <RatingNumeric 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'satisfaction_scale') {
    return (
      <SatisfactionScale 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'email') {
    return (
      <EmailInput 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'phone') {
    return (
      <PhoneInput 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'required_checkbox') {
    return (
      <RequiredCheckbox 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'date_range') {
    return (
      <DateRangePicker 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  // Phase 2 - Nouveaux types
  if (question.type === 'ranking') {
    return (
      <RankingList 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'top_selection') {
    return (
      <TopSelection 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'matrix') {
    return (
      <MatrixQuestion 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  if (question.type === 'likert') {
    return (
      <LikertScale 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  // Type rating classique
  if (question.type === 'rating') {
    return (
      <Rating 
        question={question} 
        value={value} 
        onChange={onChange} 
        error={error} 
      />
    )
  }

  // Type non supporté
  return (
    <div className="text-center text-red-500 py-4 border border-red-200 rounded-lg bg-red-50">
      <p className="font-medium">Type de question non supporté</p>
      <p className="text-sm">Type: {question.type}</p>
    </div>
  )
}
