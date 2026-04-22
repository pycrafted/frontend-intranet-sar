"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
  const { departments, submitIdea, fetchDepartments } = useIdeas()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<IdeaFormData>({
    description: '',
    department: ''
  })
  const [errors, setErrors] = useState<Partial<IdeaFormData>>({})

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
        setFormData({ description: '', department: '' })
        setErrors({})
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
    setFormData({ description: '', department: '' })
    setErrors({})
    setIsSubmitted(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Boîte à idées
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Soumission anonyme — votre identité n'est pas transmise.
          </p>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <p className="text-base font-medium text-gray-900 mb-1">Suggestion envoyée</p>
            <p className="text-sm text-gray-500 mb-6">
              Votre idée a été transmise au département concerné.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" onClick={handleReset} className="text-sm">
                Soumettre une autre idée
              </Button>
              <Button onClick={handleClose} className="text-sm" style={{ backgroundColor: "#344256" }}>
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div>
              <Label htmlFor="department" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Département concerné <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger className={`h-10 text-sm bg-white ${errors.department ? 'border-red-400' : 'border-gray-300'}`}>
                  {formData.department ? (() => {
                    const selectedDept = departments.find(d => String(d.id) === String(formData.department))
                    return selectedDept ? (
                      <span>{selectedDept.name}</span>
                    ) : (
                      <SelectValue placeholder="Sélectionner un département" />
                    )
                  })() : (
                    <SelectValue placeholder="Sélectionner un département" />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)} className="text-sm">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-xs text-red-500 mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre idée, son contexte et son objectif..."
                rows={5}
                className={`text-sm resize-none bg-white ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto text-sm h-10"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 text-sm h-10 text-white"
                style={{ backgroundColor: "#344256" }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi en cours…
                  </span>
                ) : (
                  "Soumettre"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
