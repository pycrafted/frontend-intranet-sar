"use client"

import { useState } from "react"
import { Megaphone, AlertTriangle, Calendar, Users, Upload, Video, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { api, CreateArticleData } from "@/lib/api"

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
}

const priorityLevels = [
  { value: "low", label: "Faible", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Moyenne", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "Élevée", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-700" }
]

const targetAudiences = [
  "Tous les employés",
  "Direction",
  "Ressources Humaines",
  "Équipe Technique",
  "Équipe Commerciale",
  "Équipe de Production"
]

export function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "",
    targetAudience: "",
    endDate: "",
    isPinned: true, // Les annonces sont épinglées par défaut
    image: null as File | null,
    video: null as File | null,
    videoPoster: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, video: file }))
    }
  }

  const handleVideoPosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, videoPoster: file }))
    }
  }

  const handleSubmit = async () => {
    // Validation : au moins un contenu doit être fourni
    const hasTitle = formData.title && formData.title.trim()
    const hasContent = formData.content && formData.content.trim()
    const hasImage = formData.image
    const hasVideo = formData.video
    
    if (!hasTitle && !hasContent && !hasImage && !hasVideo) {
      alert("Veuillez fournir au moins un titre, un contenu, une image ou une vidéo pour l'annonce.")
      return
    }

    setIsSubmitting(true)
    try {
      // Déterminer le type de contenu basé sur les données fournies
      let contentType = "text_only"
      const hasTitle = formData.title && formData.title.trim()
      const hasContent = formData.content && formData.content.trim()
      const hasImage = formData.image
      const hasVideo = formData.video
      
      if (hasVideo && !hasTitle && !hasContent && !hasImage) {
        contentType = "video"
      } else if (hasImage && hasTitle && hasContent && !hasVideo) {
        contentType = "text_image"
      } else if (hasImage && (hasTitle || hasContent) && !hasVideo) {
        contentType = "text_image"
      } else if (hasImage && !hasTitle && !hasContent && !hasVideo) {
        contentType = "image_only"
      } else if (hasTitle || hasContent) {
        contentType = "text_only"
      }

      // Préparer les données pour l'API
      const articleData: CreateArticleData = {
        type: "announcement",
        title: hasTitle ? formData.title : undefined,
        content: hasContent ? formData.content : undefined,
        author: "Utilisateur Actuel", // TODO: Récupérer depuis le contexte utilisateur
        author_role: "Employé", // TODO: Récupérer depuis le contexte utilisateur
        category: "Toutes", // Les annonces sont généralement pour tous
        is_pinned: formData.isPinned,
        end_date: formData.endDate || undefined,
        content_type: contentType,
        image: hasImage ? formData.image : undefined,
        video: hasVideo ? formData.video : undefined,
        video_poster: formData.videoPoster || undefined
      }

      

      // Créer l'annonce via l'API
      const createdArticle = await api.createArticle(articleData)
      
      
      // Reset et fermeture
      setFormData({
        title: "",
        content: "",
        priority: "",
        targetAudience: "",
        endDate: "",
        isPinned: true,
        image: null,
        video: null,
        videoPoster: null
      })
      setStep(1)
      onClose()
      
      // Optionnel: Rafraîchir la page ou notifier le parent
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      // TODO: Afficher une notification d'erreur à l'utilisateur
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToStep2 = (formData.title.trim() || formData.content.trim() || formData.image || formData.video)
  const canSubmit = canProceedToStep2 && formData.priority && formData.targetAudience

  const selectedPriority = priorityLevels.find(p => p.value === formData.priority)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-600" />
            Nouvelle Annonce
          </DialogTitle>
          
          {/* Indicateur de progression */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              step >= 1 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500"
            )}>
              1
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded">
              <div className={cn(
                "h-full bg-orange-600 rounded transition-all duration-300",
                step >= 2 ? "w-full" : "w-0"
              )} />
            </div>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              step >= 2 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500"
            )}>
              2
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <>
              {/* Étape 1: Contenu de l'annonce */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Conseil :</strong> Vous pouvez créer une annonce avec seulement une image, 
                    seulement du texte, seulement une vidéo, ou une combinaison de ces éléments.
                  </p>
                </div>
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Titre de l'annonce (optionnel)
                  </Label>
                  <Input
                    id="title"
                    placeholder="Titre clair et percutant pour votre annonce..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                    Contenu de l'annonce (optionnel)
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Décrivez clairement l'information importante à diffuser..."
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    className="mt-1 min-h-[120px] resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.content.length} caractères
                  </div>
                </div>

                {/* Upload d'image */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Image (optionnel)
                  </Label>
                  <div className="mt-1">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors duration-200"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.image ? formData.image.name : "Cliquez pour ajouter une image"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Upload de vidéo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Vidéo (optionnel)
                  </Label>
                  <div className="mt-1">
                    <input
                      type="file"
                      id="video"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="video"
                      className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200"
                    >
                      <Video className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.video ? formData.video.name : "Cliquez pour ajouter une vidéo"}
                      </span>
                    </label>
                  </div>
                  
                  {/* Upload d'image de couverture pour la vidéo */}
                  {formData.video && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Image de couverture pour la vidéo (optionnel)
                      </Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="videoPoster"
                          accept="image/*"
                          onChange={handleVideoPosterUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="videoPoster"
                          className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors duration-200"
                        >
                          <Play className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formData.videoPoster ? formData.videoPoster.name : "Ajouter une image de couverture"}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Étape 2: Configuration de l'annonce */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                    Niveau de priorité *
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez le niveau de priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", 
                              priority.value === "urgent" ? "bg-red-500" :
                              priority.value === "high" ? "bg-orange-500" :
                              priority.value === "medium" ? "bg-yellow-500" : "bg-green-500"
                            )} />
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAudience" className="text-sm font-medium text-gray-700">
                    Public cible *
                  </Label>
                  <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange("targetAudience", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Qui doit voir cette annonce ?" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map((audience) => (
                        <SelectItem key={audience} value={audience}>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {audience}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                    Date d'expiration (optionnel)
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    L'annonce sera automatiquement archivée après cette date
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => handleInputChange("isPinned", e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <Label htmlFor="isPinned" className="text-sm text-gray-700">
                    Épingler cette annonce en haut de la liste
                  </Label>
                </div>

                {/* Aperçu de l'annonce */}
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="text-sm font-medium text-gray-600 mb-2">Aperçu :</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <div className="font-semibold text-gray-900">
                        {formData.title || "Titre de l'annonce"}
                      </div>
                      {selectedPriority && (
                        <Badge className={cn("text-xs", selectedPriority.color)}>
                          {selectedPriority.label}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {formData.content || "Contenu de l'annonce..."}
                    </div>
                    
                    {/* Affichage des médias */}
                    <div className="space-y-1">
                      {formData.image && (
                        <div className="text-sm text-gray-600 italic">
                          📷 Image : {formData.image.name}
                        </div>
                      )}
                      {formData.video && (
                        <div className="text-sm text-gray-600 italic">
                          🎥 Vidéo : {formData.video.name}
                          {formData.videoPoster && (
                            <span className="ml-2">+ Image de couverture</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {formData.targetAudience && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {formData.targetAudience}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={isSubmitting}
                >
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </Button>
              
              {step === 1 ? (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2 || isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Publication...
                    </>
                  ) : (
                    "Publier l'annonce"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
