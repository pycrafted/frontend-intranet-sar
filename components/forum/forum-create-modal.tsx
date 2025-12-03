"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, X } from "lucide-react"
import type { ForumCreateData } from "@/lib/types/forum"

interface ForumCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ForumCreateData) => Promise<void>
  loading?: boolean
}

export function ForumCreateModal({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: ForumCreateModalProps) {
  const [formData, setFormData] = useState<ForumCreateData>({
    title: "",
    image: null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof ForumCreateData, string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: "Le fichier doit être une image" })
        return
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "La taille de l'image ne doit pas dépasser 5MB" })
        return
      }
      
      setFormData({ ...formData, image: file })
      setErrors({ ...errors, image: undefined })
      
      // Créer un aperçu
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Partial<Record<keyof ForumCreateData, string>> = {}
    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis"
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSubmit(formData)
      // Réinitialiser le formulaire
      setFormData({
        title: "",
        image: null,
      })
      setImagePreview(null)
      setErrors({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Erreur lors de la création du forum:", error)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: "",
        image: null,
      })
      setImagePreview(null)
      setErrors({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau forum</DialogTitle>
          <DialogDescription>
            Créez un forum pour démarrer une discussion avec vos collègues.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Discussion sur le nouveau projet"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={loading}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Image du forum (optionnel)</Label>
              <div className="space-y-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF jusqu'à 5MB
                    </p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                />
                {errors.image && (
                  <p className="text-sm text-destructive">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le forum"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

