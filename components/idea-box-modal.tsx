"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Lightbulb, Send, Lock, CheckCircle, Building2, MessageSquare, AlertTriangle, RotateCcw, X } from "lucide-react"
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
      <DialogContent className="w-[95vw] sm:w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="whitespace-nowrap">Boîte à Idées</span>
          </DialogTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
            <div className="text-xs sm:text-sm font-semibold text-orange-600 bg-orange-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              <span>Anonyme</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Partagez vos idées pour améliorer la SAR
            </p>
          </div>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 px-2 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              <span>Idée soumise avec succès !</span>
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
              Votre idée a été transmise au département concerné.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full sm:w-auto bg-white border-orange-200 text-orange-700 hover:bg-orange-50 text-sm sm:text-base flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Soumettre une autre idée</span>
              </Button>
              <Button
                onClick={handleClose}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm sm:text-base"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Département */}
            <div>
              <Label htmlFor="department" className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-gray-600" />
                <span>Département concerné *</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger className={`${errors.department ? 'border-red-500' : 'border-orange-200 focus:border-orange-400'} bg-white rounded-lg shadow-sm text-sm sm:text-base h-10 sm:h-11`}>
                  {formData.department ? (() => {
                    const selectedDept = departments.find(d => String(d.id) === String(formData.department));
                    return selectedDept ? (
                      <div className="flex items-center gap-2 w-full">
                        <span>{selectedDept.icon}</span>
                        <span className="font-medium">{selectedDept.name}</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Sélectionnez un département" />
                    );
                  })() : (
                    <SelectValue placeholder="Sélectionnez un département" />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)} className="text-sm sm:text-base">
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
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{errors.department}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <span>Parlez-nous de votre idée *</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre idée en détail, son contexte et son objectif..."
                rows={5}
                className={`${errors.description ? 'border-red-500' : 'border-orange-200 focus:border-orange-400'} bg-white rounded-lg shadow-sm text-sm sm:text-base resize-none`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:flex-1 bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 text-sm sm:text-base h-10 sm:h-11"
              >
                <span className="flex items-center justify-center gap-2">
                  <X className="h-4 w-4" />
                  <span>Annuler</span>
                </span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm sm:text-base h-10 sm:h-11"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Soumettre</span>
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
