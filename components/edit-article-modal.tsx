  "use client"

import { useState, useEffect } from "react"
import { X, FileText, Image, Upload, AlertCircle, Save, Video, Play } from "lucide-react"
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
import { api, CreateArticleData, Article } from "@/lib/api"

interface EditArticleModalProps {
  isOpen: boolean
  onClose: () => void
  article: Article | null
  onUpdate: (updatedArticle: Article) => void
}


export function EditArticleModal({ isOpen, onClose, article, onUpdate }: EditArticleModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "news" as "news" | "announcement",
    image: null as File | null,
    video: null as File | null,
    videoPoster: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [currentVideoPosterUrl, setCurrentVideoPosterUrl] = useState<string | null>(null)

  // Initialiser le formulaire avec les données de l'article
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        content: article.content || "",
        type: article.type as "news" | "announcement",
        image: null,
        video: null,
        videoPoster: null,
      })
      setCurrentImageUrl(article.image_url || null)
      setCurrentVideoUrl(article.video_url || null)
      setCurrentVideoPosterUrl(article.video_poster_url || null)
      setStep(1)
    }
  }, [article])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      // Afficher un aperçu de la nouvelle image
      const reader = new FileReader()
      reader.onload = (e) => {
        setCurrentImageUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
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
      // Afficher un aperçu de la nouvelle image de couverture
      const reader = new FileReader()
      reader.onload = (e) => {
        setCurrentVideoPosterUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!article) return

    setIsSubmitting(true)
    try {
      // Déterminer le type de contenu
      let contentType: 'text_only' | 'image_only' | 'text_image' | 'video' = 'text_only'
      
      if ((formData.video || currentVideoUrl) && !formData.title.trim() && !formData.content.trim() && !(formData.image || currentImageUrl)) {
        contentType = 'video'
      } else if ((formData.image || currentImageUrl) && !formData.title.trim() && !formData.content.trim() && !(formData.video || currentVideoUrl)) {
        contentType = 'image_only'
      } else if ((formData.image || currentImageUrl) && (formData.title.trim() || formData.content.trim()) && !(formData.video || currentVideoUrl)) {
        contentType = 'text_image'
      } else if (formData.title.trim() || formData.content.trim()) {
        contentType = 'text_only'
      }

      // Préparer les données pour l'API
      const articleData: CreateArticleData = {
        type: formData.type,
        title: formData.title.trim() || undefined,
        content: formData.content.trim() || undefined,
        content_type: contentType,
        image: formData.image || undefined,
        video: formData.video || undefined,
        video_poster: formData.videoPoster || undefined
      }

      

      // Modifier l'article via l'API
      const updatedArticle = await api.updateArticle(article.id, articleData)
      
      
      // Notifier le parent de la mise à jour
      onUpdate(updatedArticle)
      
      // Reset et fermeture
      setFormData({
        title: "",
        content: "",
        type: "news",
        image: null,
        video: null,
        videoPoster: null,
      })
      setCurrentImageUrl(null)
      setCurrentVideoUrl(null)
      setCurrentVideoPosterUrl(null)
      setStep(1)
      onClose()
      
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      // TODO: Afficher une notification d'erreur à l'utilisateur
      alert("Erreur lors de la modification de l'article. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation : au moins un contenu (titre, contenu, image ou vidéo) + catégorie
  const hasContent = formData.title.trim() || formData.content.trim() || formData.image || currentImageUrl || formData.video || currentVideoUrl
  const canProceedToStep2 = hasContent
  const canSubmit = canProceedToStep2

  if (!article) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Modifier l'article
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Indicateur de progression */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
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
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            )}>
              2
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <>
              {/* Étape 1: Contenu principal */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Titre de l'article (optionnel)
                  </Label>
                  <Input
                    id="title"
                    placeholder="Donnez un titre accrocheur à votre article..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                    Contenu (optionnel)
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Rédigez le contenu de votre article..."
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
                    Image
                  </Label>
                  
                  {/* Image actuelle */}
                  {currentImageUrl && !formData.image && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-2">Image actuelle :</div>
                      <img 
                        src={currentImageUrl} 
                        alt="Image actuelle" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                  
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
                      className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <Image className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.image ? formData.image.name : "Cliquez pour changer l'image"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Upload de vidéo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Vidéo
                  </Label>
                  
                  {/* Vidéo actuelle */}
                  {currentVideoUrl && !formData.video && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-2">Vidéo actuelle :</div>
                      <video 
                        src={currentVideoUrl} 
                        className="w-32 h-20 object-cover rounded border"
                        controls
                      />
                    </div>
                  )}
                  
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
                        {formData.video ? formData.video.name : "Cliquez pour changer la vidéo"}
                      </span>
                    </label>
                  </div>
                  
                  {/* Upload d'image de couverture pour la vidéo */}
                  {(formData.video || currentVideoUrl) && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Image de couverture pour la vidéo
                      </Label>
                      
                      {/* Image de couverture actuelle */}
                      {currentVideoPosterUrl && !formData.videoPoster && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-2">Image de couverture actuelle :</div>
                          <img 
                            src={currentVideoPosterUrl} 
                            alt="Image de couverture actuelle" 
                            className="w-32 h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                      
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
              {/* Étape 2: Configuration */}
              <div className="space-y-4">

                <div className="flex items-center gap-2">
                </div>

                {/* Aperçu de l'article modifié */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-sm font-medium text-gray-600 mb-2">Aperçu des modifications :</div>
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
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
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



