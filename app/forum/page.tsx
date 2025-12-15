"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, MessageCircle } from "lucide-react"
import { ForumCreateModal } from "@/components/forum/forum-create-modal"
import { ForumCard } from "@/components/forum/forum-card"
import { useForum } from "@/hooks/useForum"
import { useAuth } from "@/hooks/useAuth"
import type { ForumCreateData, ForumUpdateData } from "@/lib/types/forum"
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, X } from "lucide-react"

interface ForumPageProps {
  isMainSidebarCollapsed?: boolean
}

export default function ForumPage({ isMainSidebarCollapsed = false }: ForumPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const {
    forums,
    loading,
    error,
    fetchForums,
    createForum: createForumHandler,
    updateForum: updateForumHandler,
    deleteForum: deleteForumHandler,
  } = useForum()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedForum, setSelectedForum] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<Partial<ForumUpdateData>>({
    title: "",
    image: null,
  })
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof ForumUpdateData, string>>>({})
  const editFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchForums().catch((err) => {
      console.error("Erreur lors du chargement des forums:", err)
    })
  }, [fetchForums])

  // Rediriger vers le forum avec l'ID 1 s'il existe, sinon vers le premier forum disponible
  useEffect(() => {
    if (!loading && forums.length > 0) {
      // Chercher d'abord le forum avec l'ID 1
      const forumId1 = forums.find(f => f.id === 1)
      if (forumId1) {
        router.replace(`/forum/1`)
      } else if (forums[0]?.id) {
        // Sinon, rediriger vers le premier forum disponible
        router.replace(`/forum/${forums[0].id}`)
      }
    }
  }, [loading, forums, router])

  const handleCreateForum = async (data: ForumCreateData) => {
    try {
      await createForumHandler(data)
      success("Forum créé", "Le forum a été créé avec succès")
      await fetchForums()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du forum"
      toastError("Erreur", errorMessage)
      throw err
    }
  }

  const handleEditForum = (forum: any) => {
    setSelectedForum(forum)
    setEditFormData({
      title: forum.title,
      image: null,
    })
    setEditImagePreview(forum.image_url || null)
    setIsEditModalOpen(true)
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setEditErrors({ ...editErrors, image: "Le fichier doit être une image" })
        return
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditErrors({ ...editErrors, image: "La taille de l'image ne doit pas dépasser 5MB" })
        return
      }
      
      setEditFormData({ ...editFormData, image: file })
      setEditErrors({ ...editErrors, image: undefined })
      
      // Créer un aperçu
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveEditImage = () => {
    setEditFormData({ ...editFormData, image: null })
    setEditImagePreview(selectedForum?.image_url || null)
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ''
    }
  }

  const handleUpdateForum = async () => {
    if (!selectedForum) return

    setEditErrors({})
    const newErrors: Partial<Record<keyof ForumUpdateData, string>> = {}
    if (!editFormData.title?.trim()) {
      newErrors.title = "Le titre est requis"
    } else if (editFormData.title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères"
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors)
      return
    }

    try {
      await updateForumHandler(selectedForum.id, editFormData as ForumUpdateData)
      success("Forum modifié", "Le forum a été modifié avec succès")
      setIsEditModalOpen(false)
      setSelectedForum(null)
      setEditFormData({ title: "" })
      await fetchForums()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification du forum"
      toastError("Erreur", errorMessage)
    }
  }

  const handleDeleteForum = (forum: any) => {
    setSelectedForum(forum)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteForum = async () => {
    if (!selectedForum) return

    try {
      await deleteForumHandler(selectedForum.id)
      success("Forum supprimé", "Le forum a été supprimé avec succès")
      setIsDeleteModalOpen(false)
      setSelectedForum(null)
      await fetchForums()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du forum"
      toastError("Erreur", errorMessage)
    }
  }

  return (
    <AuthGuard redirectTo="/">
      <LayoutWrapper
        sidebarProps={{
          forums,
          forumsLoading: loading,
          onCreateForumClick: () => setIsCreateModalOpen(true),
          onEditForumClick: handleEditForum,
          onDeleteForumClick: handleDeleteForum,
        }}
      >
        <div className="w-full">
          {/* Contenu principal - Design moderne et élégant */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base text-muted-foreground">Chargement des forums...</p>
                  </div>
                </div>
              ) : error ? (
                <Card className="p-4 sm:p-6 md:p-8 shadow-sm">
                  <CardContent className="text-center">
                    <p className="text-destructive text-base sm:text-lg mb-4">Erreur lors du chargement des forums</p>
                    <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
                  </CardContent>
                </Card>
              ) : forums.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun forum créé</h3>
                    <p className="text-gray-500 mb-4">
                      Il n'y a aucun forum disponible pour le moment. Créez le premier forum pour commencer à discuter avec vos collègues.
                    </p>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)} 
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Créer le premier forum
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6 w-full">
                  {/* En-tête élégant avec gradient subtil */}
                  <div className="space-y-3 pb-4 border-b border-border w-full">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Forums</h1>
                        <p className="text-muted-foreground">
                          Rejoignez les discussions et partagez vos idées avec vos collègues
                        </p>
                      </div>
                      <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau forum
                      </Button>
                    </div>
                    
                    {/* Statistiques élégantes */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="font-medium text-foreground">
                          {forums.length} {forums.length === 1 ? "forum" : "forums"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>
                          {forums.reduce((acc, f) => acc + f.message_count, 0)} messages au total
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grille de forums - Design moderne - Centrée */}
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 w-full place-items-center">
                    {forums.map((forum) => (
                      <ForumCard
                        key={forum.id}
                        forum={forum}
                        currentUserId={user?.id}
                        onEdit={handleEditForum}
                        onDelete={handleDeleteForum}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de création de forum */}
        <ForumCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateForum}
          loading={loading}
        />

        {/* Modal d'édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le forum</DialogTitle>
              <DialogDescription>
                Modifiez les informations du forum.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateForum(); }}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">
                    Titre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-title"
                    placeholder="Titre du forum"
                    value={editFormData.title || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className={editErrors.title ? "border-destructive" : ""}
                  />
                  {editErrors.title && (
                    <p className="text-sm text-destructive">{editErrors.title}</p>
                  )}
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Image du forum (optionnel)</Label>
                  <div className="space-y-2">
                    {editImagePreview ? (
                      <div className="relative">
                        <img
                          src={editImagePreview}
                          alt="Aperçu"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveEditImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => editFileInputRef.current?.click()}
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
                      ref={editFileInputRef}
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                    {editErrors.image && (
                      <p className="text-sm text-destructive">{editErrors.image}</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditModalOpen(false)
                  setEditFormData({ title: "", image: null })
                  setEditImagePreview(null)
                  setEditErrors({})
                  if (editFileInputRef.current) {
                    editFileInputRef.current.value = ''
                  }
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer les modifications
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le forum</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer le forum "{selectedForum?.title}" ? Cette action est irréversible et supprimera tous les messages associés.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDeleteForum}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </LayoutWrapper>
    </AuthGuard>
  )
}
