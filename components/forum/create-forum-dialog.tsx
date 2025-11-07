"use client"

import { useState } from "react"
import { useForum } from "@/hooks/useForum"
import { useAuth } from "@/contexts/AuthContext"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface CreateForumDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateForumDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateForumDialogProps) {
  const { user } = useAuth()
  const { createForum } = useForum()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError("Le nom du forum est requis")
      return
    }
    
    if (name.trim().length < 3) {
      setError("Le nom du forum doit contenir au moins 3 caractères")
      return
    }
    
    if (!user) {
      setError("Vous devez être connecté")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await createForum({
        name: name.trim(),
        description: description.trim(),
        image: image || undefined,
        is_active: true,
      })
      
      // Réinitialiser le formulaire
      setName("")
      setDescription("")
      setImage(null)
      setError(null)
      
      // Fermer le dialogue
      onOpenChange(false)
      
      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Erreur lors de la création du forum:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du forum')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleClose = () => {
    if (!isSubmitting) {
      setName("")
      setDescription("")
      setImage(null)
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau forum</DialogTitle>
          <DialogDescription>
            Créez une nouvelle catégorie de forum pour organiser les discussions
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du forum *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Annonces Générales, Support Technique..."
                disabled={isSubmitting}
                required
                minLength={3}
              />
              <p className="text-xs text-muted-foreground">
                Le nom doit contenir au moins 3 caractères
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le sujet de ce forum..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image (optionnel)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImage(file)
                  }
                }}
                disabled={isSubmitting}
              />
              {image && (
                <p className="text-sm text-muted-foreground">
                  Fichier sélectionné : {image.name}
                </p>
              )}
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || name.trim().length < 3}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le forum"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

