"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Image as ImageIcon, X } from "lucide-react"

interface ForumMessageFormProps {
  onSubmit: (content: string, image?: File | null) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  placeholder?: string
  initialContent?: string
  initialImageUrl?: string | null
  isEditing?: boolean
}

export function ForumMessageForm({
  onSubmit,
  onCancel,
  loading = false,
  placeholder = "Écrivez votre message...",
  initialContent = "",
  initialImageUrl = null,
  isEditing = false,
}: ForumMessageFormProps) {
  const [content, setContent] = useState(initialContent)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mettre à jour le contenu quand initialContent change
  useEffect(() => {
    setContent(initialContent)
    setImagePreview(initialImageUrl)
  }, [initialContent, initialImageUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Accepter les messages même s'ils ne contiennent que des emojis ou une image
    if ((!content || content.length === 0) && !selectedImage || loading) return

    try {
      await onSubmit(content, selectedImage)
      // Réinitialiser seulement si ce n'est pas en mode édition
      if (!isEditing) {
        setContent("")
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert("Le fichier doit être une image.")
        return
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille de l'image ne doit pas dépasser 5MB.")
        return
      }
      setSelectedImage(file)
      // Créer une preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          className="min-h-[140px] w-full rounded-xl border border-border/60 bg-white px-5 py-4 pr-20 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:shadow-md resize-none"
        />
        <div className="absolute bottom-3 right-3 z-50 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-muted/50 flex-shrink-0"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            aria-label="Ajouter une image"
          >
            <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <input
            ref={fileInputRef}
            id="message-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className="hidden"
          />
        </div>
      </div>

      {/* Preview de l'image */}
      {imagePreview && (
        <div className="relative inline-block">
          <div className="relative rounded-lg overflow-hidden border-2 border-white/20">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-48 max-w-full object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-white/70 italic">Soyez respectueux et constructif dans vos échanges</p>
        <div className="flex items-center gap-2">
          {isEditing && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border-white/30 bg-white/10 text-white px-4 py-3 text-sm font-medium hover:bg-white/20"
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={((!content || content.length === 0) && !selectedImage) || loading}
            className="flex items-center gap-2.5 rounded-xl bg-white text-[#344256] px-6 py-3 text-sm font-medium shadow-md transition-all hover:bg-white/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isEditing ? "Modifier l'avis" : "Publier mon avis"}
          </Button>
        </div>
      </div>
    </form>
  )
}

