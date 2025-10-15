"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Article {
  id?: number
  type: 'news' | 'announcement'
  title: string | null
  content: string | null
  date: string
  time: string
  image_url: string | null
  content_type: string
  video_url: string | null
  video_poster_url: string | null
  created_at?: string
  updated_at?: string
}

interface ArticleFormData {
  type: 'news' | 'announcement'
  title: string
  content: string
  date: string
  time: string
  content_type: 'text_only' | 'image_only' | 'text_image' | 'video'
  // Fichiers
  image?: File
  video?: File
  video_poster?: File
}

interface ArticleFormProps {
  article?: Article | null
  onSubmit: (data: ArticleFormData) => Promise<void>
  onCancel: () => void
}

export function ArticleForm({ article, onSubmit, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    type: 'news',
    title: '',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    content_type: 'text_only',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // Initialiser le formulaire avec les données de l'article en mode édition
  useEffect(() => {
    if (article) {
      setFormData({
        type: article.type,
        title: article.title || '',
        content: article.content || '',
        date: article.date,
        time: article.time,
        content_type: article.content_type as any,
      })
      
    }
  }, [article])

  const handleInputChange = (field: keyof ArticleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (field: 'image' | 'video' | 'video_poster', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file || undefined }))
  }


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation du titre
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    }

    // Validation du contenu selon le type
    if (formData.content_type === 'text_only' || formData.content_type === 'text_image') {
      if (!formData.content.trim()) {
        newErrors.content = 'Le contenu est obligatoire pour ce type d\'article'
      }
    }

    if (formData.content_type === 'image_only' && !formData.image) {
      newErrors.image = 'Une image est obligatoire pour ce type d\'article'
    }

    if (formData.content_type === 'video' && !formData.video) {
      newErrors.video = 'Une vidéo est obligatoire pour ce type d\'article'
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
      await onSubmit(formData)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image_only':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type d'article *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">Actualité</SelectItem>
                      <SelectItem value="announcement">Annonce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date de publication *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="time">Heure de publication *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Contenu */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contenu de l'article
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Titre de l'article"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="content_type">Type de contenu *</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value) => handleInputChange('content_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text_only">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Texte seul
                      </div>
                    </SelectItem>
                    <SelectItem value="image_only">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image seule
                      </div>
                    </SelectItem>
                    <SelectItem value="text_image">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <ImageIcon className="h-4 w-4" />
                        Texte + Image
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Vidéo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.content_type === 'text_only' || formData.content_type === 'text_image') && (
                <div>
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Contenu de l'article"
                    rows={6}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 mt-1">{errors.content}</p>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Médias */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Médias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Image principale */}
              {(formData.content_type === 'image_only' || formData.content_type === 'text_image') && (
                <div>
                  <Label>Image principale *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('image', e.target.files?.[0] || null)}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {errors.image && (
                    <p className="text-sm text-red-600 mt-1">{errors.image}</p>
                  )}
                </div>
              )}

              {/* Galerie d'images */}

              {/* Vidéo */}
              {formData.content_type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <Label>Fichier vidéo *</Label>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange('video', e.target.files?.[0] || null)}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    {errors.video && (
                      <p className="text-sm text-red-600 mt-1">{errors.video}</p>
                    )}
                  </div>

                  <div>
                    <Label>Image de couverture (poster)</Label>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('video_poster', e.target.files?.[0] || null)}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Actions du formulaire */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {article ? 'Modification...' : 'Création...'}
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {article ? 'Modifier l\'article' : 'Créer l\'article'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
