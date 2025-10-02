"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  Save,
  X
} from "lucide-react"
import { Event, EventCreateUpdate } from "@/hooks/useEvents"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface EventFormProps {
  event?: Event
  onSubmit: (data: EventCreateUpdate) => Promise<void>
  onCancel: () => void
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventCreateUpdate>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "other",
    attendees: 0,
    is_all_day: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialiser le formulaire avec les données de l'événement si en mode édition
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time || "",
        location: event.location,
        type: event.type || "other",
        attendees: event.attendees || 0,
        is_all_day: event.is_all_day || false
      })
    } else {
      // Valeurs par défaut pour un nouvel événement
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      setFormData({
        title: "",
        description: "",
        date: tomorrow.toISOString().split('T')[0], // Demain par défaut
        time: "09:00",
        location: "",
        type: "other",
        attendees: 0,
        is_all_day: false
      })
    }
  }, [event])

  const handleInputChange = (field: keyof EventCreateUpdate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis"
    }

    if (!formData.date) {
      newErrors.date = "La date est requise"
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = "La date ne peut pas être dans le passé"
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Le lieu est requis"
    }

    if (!formData.type || !["meeting", "training", "celebration", "conference", "other"].includes(formData.type)) {
      newErrors.type = "Le type d'événement est requis"
    }

    if ((formData.attendees || 0) < 0) {
      newErrors.attendees = "Le nombre de participants ne peut pas être négatif"
    }

    if (!formData.is_all_day && !formData.time) {
      newErrors.time = "L'heure est requise si l'événement n'est pas toute la journée"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Préparer les données pour l'envoi
      const submitData: EventCreateUpdate = {
        ...formData,
        time: formData.is_all_day ? undefined : formData.time,
        attendees: formData.attendees || 0,
        type: formData.type || "other" // S'assurer que le type a une valeur par défaut
      }

      const result = await onSubmit(submitData)
      
      // Si la soumission échoue, le hook gère déjà l'erreur
      // Ici on peut ajouter une logique supplémentaire si nécessaire
      
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: "meeting", label: "Réunion", icon: "👥" },
    { value: "training", label: "Formation", icon: "🎓" },
    { value: "celebration", label: "Célébration", icon: "🎉" },
    { value: "conference", label: "Conférence", icon: "🎤" },
    { value: "other", label: "Autre", icon: "📅" }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations principales */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="h-5 w-5 text-blue-600" />
            Informations principales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Titre de l'événement *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Formation Sécurité"
                className={errors.title ? "border-red-300 focus:border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                Type d'événement *
              </Label>
              <Select
                key={formData.type}
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description détaillée de l'événement..."
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Date et heure */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="h-5 w-5 text-blue-600" />
            Date et heure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={errors.date ? "border-red-300 focus:border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                Heure {!formData.is_all_day && "*"}
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                disabled={formData.is_all_day}
                className={errors.time ? "border-red-300 focus:border-red-500" : ""}
              />
              {errors.time && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_all_day"
              checked={formData.is_all_day}
              onCheckedChange={(checked) => {
                handleInputChange("is_all_day", checked)
                if (checked) {
                  handleInputChange("time", "")
                } else {
                  handleInputChange("time", "09:00")
                }
              }}
            />
            <Label htmlFor="is_all_day" className="text-sm font-medium text-gray-700">
              Événement toute la journée
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Lieu et participants */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            Lieu et participants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Lieu *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ex: Salle de conférence, Restaurant d'entreprise..."
              className={errors.location ? "border-red-300 focus:border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.location}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees" className="text-sm font-medium text-gray-700">
              Nombre de participants
            </Label>
            <Input
              id="attendees"
              type="number"
              min="0"
              value={formData.attendees}
              onChange={(e) => handleInputChange("attendees", parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.attendees ? "border-red-300 focus:border-red-500" : ""}
            />
            {errors.attendees && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.attendees}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aperçu */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Aperçu de l'événement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {typeOptions.find(opt => opt.value === formData.type)?.icon || "📅"}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                {formData.title || "Titre de l'événement"}
              </h3>
            </div>
            
            {formData.description && (
              <p className="text-gray-600 text-sm">
                {formData.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formData.date ? format(new Date(formData.date), "dd MMMM yyyy", { locale: fr }) : "Date"}
              </div>
              
              {!formData.is_all_day && formData.time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formData.time}
                </div>
              )}
              
              {formData.is_all_day && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Toute la journée
                </div>
              )}
              
              {formData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {formData.location}
                </div>
              )}
              
              {(formData.attendees || 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {formData.attendees || 0} participant{(formData.attendees || 0) > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enregistrement...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {event ? "Modifier" : "Créer"} l'événement
            </div>
          )}
        </Button>
      </div>
    </form>
  )
}
