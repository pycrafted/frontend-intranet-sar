"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw, CheckCircle, AlertCircle } from "lucide-react"

export function DragDropDemo() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "Glissez-déposez les cartes",
      description: "Survolez une carte et utilisez l'icône de grip pour la déplacer",
      icon: "🖱️"
    },
    {
      title: "Réorganisez votre dashboard",
      description: "Placez les cartes dans l'ordre qui vous convient le mieux",
      icon: "📋"
    },
    {
      title: "Personnalisez les tailles",
      description: "Utilisez le bouton Configuration pour ajuster les tailles des cartes",
      icon: "⚙️"
    },
    {
      title: "Sauvegardez vos préférences",
      description: "Vos modifications sont automatiquement sauvegardées",
      icon: "💾"
    }
  ]

  const handleStartDemo = () => {
    setStep(0)
    setIsCompleted(false)
  }

  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleReset = () => {
    setStep(0)
    setIsCompleted(false)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-blue-600" />
          Guide d'utilisation du Drag & Drop
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barre de progression */}
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  index <= step
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Étape actuelle */}
          <div className="text-center py-4">
            <div className="text-4xl mb-2">{steps[step]?.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {steps[step]?.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {steps[step]?.description}
            </p>

            {isCompleted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Démonstration terminée !</span>
                </div>
                <p className="text-sm text-gray-600">
                  Vous pouvez maintenant utiliser le drag & drop sur votre dashboard
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleReset} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Recommencer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <Button onClick={handleNextStep} size="sm">
                  {step === steps.length - 1 ? 'Terminer' : 'Suivant'}
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Recommencer
                </Button>
              </div>
            )}
          </div>

          {/* Conseils */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Conseils d'utilisation</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Survolez une carte pour voir l'icône de grip</li>
                  <li>• Cliquez et maintenez pour commencer le drag</li>
                  <li>• Relâchez pour placer la carte à la nouvelle position</li>
                  <li>• Utilisez le bouton Configuration pour plus d'options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
