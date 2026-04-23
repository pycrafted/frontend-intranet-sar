"use client"

import { useState, useEffect, useRef } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import { ForumCreateModal } from "@/components/forum/forum-create-modal"
import { ForumCard } from "@/components/forum/forum-card"
import { ForumSidebar } from "@/components/forum-sidebar"
import { useForum } from "@/hooks/useForum"
import { PageLoader } from "@/components/ui/loader"
import { useAuth } from "@/hooks/useAuth"
import type { ForumCreateData, ForumUpdateData } from "@/lib/types/forum"
import { useToast } from "@/components/ui/toast"
import { useConfirm } from "@/components/ui/confirm-dialog"
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
import { ImageIcon, X } from "lucide-react"

export default function ForumPage() {
  const confirm = useConfirm()
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

  const handleDeleteForum = async (forum: any) => {
    if (!await confirm({ message: `Supprimer le forum "${forum.title}" ? Cette action supprimera tous les messages associés.`, title: 'Supprimer le forum' })) return
    try {
      await deleteForumHandler(forum.id)
      success("Forum supprimé", "Le forum a été supprimé avec succès")
      await fetchForums()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du forum"
      toastError("Erreur", errorMessage)
    }
  }

  return (
    <AuthGuard redirectTo="/">
      <LayoutWrapper>
        <ForumSidebar
          forums={forums}
          loading={loading}
          onCreateClick={() => setIsCreateModalOpen(true)}
          onEditForum={handleEditForum}
          onDeleteForum={handleDeleteForum}
          isMainSidebarCollapsed={true}
        />
        <div className="lg:pl-80 w-full">

          {/* Hero banner */}
          <div className="px-3 sm:px-6 pt-6 pb-5">
            <div className="mx-auto max-w-[760px] rounded-2xl overflow-hidden" style={{ backgroundColor: '#344256' }}>
              <div className="px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Forums de discussion</h1>
                    <p className="text-white/70 text-sm mt-0.5">Échangez avec vos collègues sur tous les sujets</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="lg:hidden flex-shrink-0 bg-white text-[#344256] hover:bg-white/90 font-semibold text-sm px-4 py-2 rounded-lg"
                >
                  + Nouveau
                </Button>
              </div>
            </div>
          </div>

          <div className="px-3 sm:px-6 pb-8">
          <div className="mx-auto max-w-[760px] space-y-3">
            {loading ? (
              <PageLoader />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center justify-between text-red-700 text-sm">
                <span>{error}</span>
                <button onClick={() => fetchForums()} className="underline ml-4">Réessayer</button>
              </div>
            ) : forums.length === 0 ? (
              <div className="rounded-xl bg-white border border-gray-200 p-10 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#344256' + '18' }}>
                  <MessageCircle className="h-8 w-8" style={{ color: '#344256' }} />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Aucun forum pour l'instant</h3>
                <p className="text-sm text-gray-500 mb-5">Lancez la discussion en créant le premier forum.</p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-white text-sm font-semibold"
                  style={{ backgroundColor: '#344256' }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Créer le premier forum
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#344256' }}></div>
                    <h2 className="text-sm font-semibold text-gray-700">Tous les forums</h2>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 text-white" style={{ backgroundColor: '#344256' }}>{forums.length}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
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
              </>
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

      </LayoutWrapper>
    </AuthGuard>
  )
}
