"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Lightbulb, Send } from "lucide-react"
import { useIdeas } from "@/hooks/useIdeas"

interface IdeaFormData {
  description: string
  department: string
}

interface IdeaBoxModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IdeaBoxModal({ isOpen, onClose }: IdeaBoxModalProps) {
  const { departments, loading, error, submitIdea, fetchDepartments } = useIdeas()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<IdeaFormData>({
    description: '',
    department: ''
  })
  const [errors, setErrors] = useState<Partial<IdeaFormData>>({})

  // Charger les départements au montage du composant
  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
    }
  }, [isOpen, fetchDepartments])

  const validateForm = (): boolean => {
    const newErrors: Partial<IdeaFormData> = {}
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire'
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'La description doit contenir au moins 5 caractères'
    }
    
    if (!formData.department) {
      newErrors.department = 'Le département est obligatoire'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const result = await submitIdea(formData)
      
      if (result.success) {
        setIsSubmitted(true)
        setFormData({
          description: '',
          department: ''
        })
        setErrors({})
      } else {
        console.error('Erreur lors de la soumission:', result.error)
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof IdeaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleReset = () => {
    setFormData({
      description: '',
      department: ''
    })
    setErrors({})
    setIsSubmitted(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            💡 Boîte à Idées
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              🔒 Anonyme
            </div>
            <p className="text-sm text-gray-600">
              Partagez vos idées pour améliorer la SAR
            </p>
          </div>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              🎉 Idée soumise avec succès !
            </h3>
            <p className="text-gray-600 mb-6">
              Votre idée a été transmise au département concerné.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-white border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                💡 Soumettre une autre idée
              </Button>
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Département */}
            <div>
              <Label htmlFor="department" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                🏢 Département concerné *
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger className={`${errors.department ? 'border-red-500' : 'border-orange-200 focus:border-orange-400'} bg-white rounded-lg shadow-sm`}>
                  <SelectValue placeholder="Sélectionnez un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center gap-2">
                        <span>{dept.icon}</span>
                        <div>
                          <div className="font-medium">{dept.name}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  ⚠️ {errors.department}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                😊 Parlez-nous de votre idée *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre idée en détail, son contexte et son objectif..."
                rows={6}
                className={`${errors.description ? 'border-red-500' : 'border-orange-200 focus:border-orange-400'} bg-white rounded-lg shadow-sm`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  ⚠️ {errors.description}
                </p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1 bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
              >
                <span className="flex items-center gap-2">
                  🔄 Annuler
                </span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    🚀 Soumettre
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
