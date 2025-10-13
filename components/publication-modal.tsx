"use client"

import { useState } from "react"
import { FileText, Image, Video, Upload, AlertCircle, Play } from "lucide-react"
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

interface PublicationModalProps {
  isOpen: boolean
  onClose: () => void
}

const categories = [
  "Toutes",
  "Sécurité",
  "Finance", 
  "Formation",
  "Production",
  "Partenariat",
  "Environnement",
  "Ressources Humaines"
]

export function PublicationModal({ isOpen, onClose }: PublicationModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    type: "news",
    image: null as File | null,
    video: null as File | null,
    videoPoster: null as File | null,
    isPinned: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      setHasUnsavedChanges(true)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, video: file }))
      setHasUnsavedChanges(true)
    }
  }

  const handleVideoPosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, videoPoster: file }))
      setHasUnsavedChanges(true)
    }
  }

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      type: "news",
      image: null,
      video: null,
      videoPoster: null,
      isPinned: false
    })
    setStep(1)
    setHasUnsavedChanges(false)
    setIsSubmitting(false)
  }

  // Fonction pour gérer la fermeture du modal
  const handleClose = () => {
    if (hasUnsavedChanges && !isSubmitting) {
      const confirmClose = window.confirm(
        "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer le modal ?"
      )
      if (!confirmClose) return
    }
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Déterminer le type de contenu
      let contentType: 'text_only' | 'image_only' | 'text_image' | 'video' = 'text_only'
      
      if (formData.video && !formData.title.trim() && !formData.content.trim() && !formData.image) {
        contentType = 'video'
      } else if (formData.image && !formData.title.trim() && !formData.content.trim() && !formData.video) {
        contentType = 'image_only'
      } else if (formData.image && (formData.title.trim() || formData.content.trim()) && !formData.video) {
        contentType = 'text_image'
      } else if (formData.title.trim() || formData.content.trim()) {
        contentType = 'text_only'
      }

      // Préparer les données pour l'API
      const articleData: CreateArticleData = {
        type: "news",
        title: formData.title.trim() || undefined,
        content: formData.content.trim() || undefined,
        author: "Utilisateur Actuel", // TODO: Récupérer depuis le contexte utilisateur
        author_role: "Employé", // TODO: Récupérer depuis le contexte utilisateur
        category: formData.category,
        is_pinned: formData.isPinned,
        content_type: contentType,
        image: formData.image || undefined,
        video: formData.video || undefined,
        video_poster: formData.videoPoster || undefined
      }

      

      // Créer la publication via l'API
      const createdArticle = await api.createArticle(articleData)
      
      
      // Reset et fermeture
      resetForm()
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

  // Validation : au moins un contenu (titre, contenu, image ou vidéo) + catégorie
  const hasContent = formData.title.trim() || formData.content.trim() || formData.image || formData.video
  const canProceedToStep2 = hasContent
  const canSubmit = canProceedToStep2 && formData.category

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs sm:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
        <DialogHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Nouvelle Actualité
          </DialogTitle>
          
          {/* Indicateur de progression - Responsive */}
          <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium",
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            )}>
              1
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded">
              <div className={cn(
                "h-full bg-blue-600 rounded transition-all duration-300",
                step >= 2 ? "w-full" : "w-0"
              )} />
            </div>
            <div className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium",
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            )}>
              2
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {step === 1 && (
            <>
              {/* Étape 1: Contenu principal - Responsive */}
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-blue-800">
                      <p className="font-medium mb-1">Créer une publication</p>
                      <p>Vous pouvez publier :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                        <li>Un titre et/ou du contenu textuel</li>
                        <li>Une image seule (avec type et catégorie)</li>
                        <li>Une vidéo seule (avec type et catégorie)</li>
                        <li>Une combinaison de texte et d'image</li>
                        <li>Une combinaison de texte et de vidéo</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title" className="text-xs sm:text-sm font-medium text-gray-700">
                    Titre de l'actualité (optionnel)
                  </Label>
                  <Input
                    id="title"
                    placeholder="Donnez un titre accrocheur à votre actualité..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-xs sm:text-sm font-medium text-gray-700">
                    Contenu (optionnel)
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Rédigez le contenu de votre actualité..."
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    className="mt-1 min-h-[80px] sm:min-h-[120px] resize-none text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.content.length} caractères
                  </div>
                </div>

                {/* Upload d'image - Responsive */}
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">
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
                      className="flex items-center gap-2 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">
                        {formData.image ? formData.image.name : "Cliquez pour ajouter une image"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Upload de vidéo - Responsive */}
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">
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
                      className="flex items-center gap-2 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200"
                    >
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">
                        {formData.video ? formData.video.name : "Cliquez pour ajouter une vidéo"}
                      </span>
                    </label>
                  </div>
                  
                  {/* Upload d'image de couverture pour la vidéo - Responsive */}
                  {formData.video && (
                    <div className="mt-2">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700">
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
                          className="flex items-center gap-2 p-2 sm:p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors duration-200"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-xs sm:text-sm text-gray-600 truncate">
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
              {/* Étape 2: Configuration */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Catégorie *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => handleInputChange("isPinned", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="isPinned" className="text-sm text-gray-700">
                    Épingler cette actualité en haut de la liste
                  </Label>
                </div>

                {/* Aperçu de la publication */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-sm font-medium text-gray-600 mb-2">Aperçu :</div>
                  <div className="space-y-2">
                    {formData.title && (
                      <div className="font-semibold text-gray-900">
                        {formData.title}
                      </div>
                    )}
                    {formData.content && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {formData.content}
                      </div>
                    )}
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
                    {!formData.title && !formData.content && !formData.image && !formData.video && (
                      <div className="text-sm text-gray-500 italic">
                        Aucun contenu saisi
                      </div>
                    )}
                    {formData.category && (
                      <Badge variant="secondary" className="text-xs">
                        {formData.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-200">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto text-sm"
                >
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="w-full sm:w-auto text-sm"
              >
                Annuler
              </Button>
              
              {step === 1 ? (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2 || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Publication...</span>
                      <span className="sm:hidden">Publication...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Publier l'actualité</span>
                      <span className="sm:hidden">Publier</span>
                    </>
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
