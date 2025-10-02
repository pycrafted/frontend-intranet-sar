"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  MousePointer, 
  GripVertical, 
  Settings, 
  Plus, 
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft
} from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur votre Dashboard !',
    description: 'Votre espace de travail personnalisable. Découvrez comment l\'utiliser en quelques étapes.',
    target: 'dashboard-header',
    position: 'bottom'
  },
  {
    id: 'drag-cards',
    title: 'Déplacer les cartes',
    description: 'Cliquez et glissez sur l\'icône de déplacement pour réorganiser vos cartes selon vos préférences.',
    target: 'drag-handle',
    position: 'right',
    action: 'hover'
  },
  {
    id: 'manage-cards',
    title: 'Gérer vos cartes',
    description: 'Utilisez ce bouton pour modifier les tailles et masquer/afficher vos cartes selon vos besoins.',
    target: 'widget-manager',
    position: 'bottom'
  },
  {
    id: 'visibility',
    title: 'Contrôler la visibilité',
    description: 'Dans le gestionnaire, vous pouvez masquer/afficher vos cartes temporairement.',
    target: 'visibility-toggle',
    position: 'top'
  },
  {
    id: 'complete',
    title: 'C\'est parti !',
    description: 'Vous êtes maintenant prêt à personnaliser votre dashboard. Amusez-vous bien !',
    target: 'dashboard-header',
    position: 'bottom'
  }
]

interface DashboardTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function DashboardTour({ isOpen, onClose, onComplete }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(0)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    onComplete()
  }

  if (!isVisible || !isOpen) return null

  const step = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 max-w-[90vw]">
        <Card className="shadow-2xl border-2 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{currentStep + 1}</span>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">{step.description}</p>
            
            {/* Action hints */}
            {step.action === 'hover' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <MousePointer className="h-4 w-4" />
                  <span className="text-sm font-medium">Survolez l'élément pour le voir en action</span>
                </div>
              </div>
            )}
            
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 
                    index < currentStep ? 'bg-blue-300' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <div className="text-sm text-gray-500">
                {currentStep + 1} / {TOUR_STEPS.length}
              </div>
              
              <Button
                size="sm"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Terminer' : 'Suivant'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Hook pour gérer le tour
export function useDashboardTour() {
  const [hasSeenTour, setHasSeenTour] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('dashboard-tour-seen')
    setHasSeenTour(seen === 'true')
  }, [])

  const startTour = () => {
    setIsTourOpen(true)
  }

  const completeTour = () => {
    setIsTourOpen(false)
    setHasSeenTour(true)
    localStorage.setItem('dashboard-tour-seen', 'true')
  }

  const resetTour = () => {
    setHasSeenTour(false)
    localStorage.removeItem('dashboard-tour-seen')
  }

  return {
    hasSeenTour,
    isTourOpen,
    startTour,
    completeTour,
    resetTour
  }
}
