"use client"

import { AlertCircle } from "lucide-react"

interface MatrixQuestionProps {
  question: {
    id: number
    text: string
    is_required: boolean
    matrix_questions?: string[]
    matrix_options?: string[]
  }
  value?: Record<string, string>
  onChange: (value: Record<string, string>) => void
  error?: string
}

export function MatrixQuestion({ question, value = {}, onChange, error }: MatrixQuestionProps) {
  // Questions et options par défaut si non fournies
  const defaultQuestions = [
    "Qualité du produit",
    "Rapidité de livraison", 
    "Service client",
    "Rapport qualité/prix"
  ]
  
  const defaultOptions = [
    "Très satisfait",
    "Satisfait",
    "Neutre",
    "Insatisfait",
    "Très insatisfait"
  ]

  const matrixQuestions = question.matrix_questions && question.matrix_questions.length > 0 
    ? question.matrix_questions 
    : defaultQuestions

  const matrixOptions = question.matrix_options && question.matrix_options.length > 0 
    ? question.matrix_options 
    : defaultOptions

  const handleAnswerChange = (questionKey: string, answer: string) => {
    const newAnswers = { ...value, [questionKey]: answer }
    onChange(newAnswers)
  }

  const getCompletionPercentage = () => {
    const answeredQuestions = Object.keys(value).length
    return Math.round((answeredQuestions / matrixQuestions.length) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
          <span className="font-medium text-purple-800">Instructions :</span>
        </div>
        <p>Évaluez chaque critère en sélectionnant une option. Toutes les questions sont obligatoires.</p>
      </div>

      {/* Barre de progression */}
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
          style={{ width: `${getCompletionPercentage()}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 text-center">
        {Object.keys(value).length}/{matrixQuestions.length} questions répondues ({getCompletionPercentage()}%)
      </div>

      {/* Tableau de la matrice */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700 min-w-[200px] sticky left-0 bg-white z-10">
                Critères
              </th>
              {matrixOptions.map((option, index) => (
                <th key={index} className="text-center p-3 font-medium text-gray-700 min-w-[140px] whitespace-nowrap">
                  {option}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixQuestions.map((matrixQuestion, questionIndex) => (
              <tr key={questionIndex} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900 min-w-[200px] sticky left-0 bg-white z-10">
                  {matrixQuestion}
                </td>
                {matrixOptions.map((option, optionIndex) => (
                  <td key={optionIndex} className="p-3 text-center min-w-[140px]">
                    <input
                      type="radio"
                      name={`matrix-${question.id}-${questionIndex}`}
                      value={option}
                      checked={value[matrixQuestion] === option}
                      onChange={() => handleAnswerChange(matrixQuestion, option)}
                      id={`${question.id}-${questionIndex}-${optionIndex}`}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résumé des réponses */}
      {Object.keys(value).length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Vos réponses :</h4>
          <div className="space-y-2">
            {Object.entries(value).map(([question, answer]) => (
              <div key={question} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{question}</span>
                <span className="text-purple-600 font-medium">{answer}</span>
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
