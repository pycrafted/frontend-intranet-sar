"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageSquare, ImageIcon, X } from "lucide-react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ForumMessageForm } from "@/components/forum/forum-message-form"
import { ForumCreateModal } from "@/components/forum/forum-create-modal"
import { useForum } from "@/hooks/useForum"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { ForumMessage, ForumUpdateData, ForumCreateData } from "@/lib/types/forum"

interface ForumDetailPageProps {
  isMainSidebarCollapsed?: boolean
}

export default function ForumDetailPage({ isMainSidebarCollapsed = false }: ForumDetailPageProps) {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const forumId = parseInt(params.id as string)

  const {
    forums,
    currentForum,
    messages,
    loading,
    error,
    fetchForum,
    fetchForums,
    fetchMessages,
    createMessage,
    createForum: createForumHandler,
    updateMessage: updateMessageHandler,
    deleteMessage: deleteMessageHandler,
    updateForum: updateForumHandler,
    deleteForum: deleteForumHandler,
  } = useForum()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMessageModalOpen, setIsEditMessageModalOpen] = useState(false)
  const [isDeleteMessageModalOpen, setIsDeleteMessageModalOpen] = useState(false)
  const [isEditForumModalOpen, setIsEditForumModalOpen] = useState(false)
  const [isDeleteForumModalOpen, setIsDeleteForumModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ForumMessage | null>(null)
  const [editMessageContent, setEditMessageContent] = useState("")
  const [editForumFormData, setEditForumFormData] = useState<ForumUpdateData>({
    title: "",
    image: null,
  })
  const [editForumImagePreview, setEditForumImagePreview] = useState<string | null>(null)
  const [editForumErrors, setEditForumErrors] = useState<Partial<Record<keyof ForumUpdateData, string>>>({})
  const editForumFileInputRef = useRef<HTMLInputElement>(null)

  // Charger tous les forums pour la sidebar
  useEffect(() => {
    fetchForums().catch((err) => {
      console.error("Erreur lors du chargement des forums:", err)
    })
  }, [fetchForums])

  // Charger le forum et ses messages
  useEffect(() => {
    if (forumId) {
      fetchForum(forumId).catch((err) => {
        console.error("Erreur lors du chargement du forum:", err)
      })
      fetchMessages(forumId).catch((err) => {
        console.error("Erreur lors du chargement des messages:", err)
      })
    }
  }, [forumId, fetchForum, fetchMessages])

  const handleCreateForum = async (data: ForumCreateData) => {
    try {
      await createForumHandler(data)
      success("Forum créé", "Le forum a été créé avec succès")
      await fetchForums()
      setIsCreateModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du forum"
      toastError("Erreur", errorMessage)
      throw err
    }
  }

  const handleCreateMessage = async (content: string) => {
    try {
      await createMessage(forumId, content)
      await fetchMessages(forumId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi du message"
      toastError("Erreur", errorMessage)
      throw err
    }
  }

  const handleEditMessage = (message: ForumMessage) => {
    setSelectedMessage(message)
    setEditMessageContent(message.content)
    setIsEditMessageModalOpen(true)
  }

  const handleUpdateMessage = async () => {
    if (!selectedMessage) return

    try {
      await updateMessageHandler(selectedMessage.id, editMessageContent)
      success("Message modifié", "Le message a été modifié avec succès")
      setIsEditMessageModalOpen(false)
      setSelectedMessage(null)
      setEditMessageContent("")
      await fetchMessages(forumId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification du message"
      toastError("Erreur", errorMessage)
    }
  }

  const handleDeleteMessage = (message: ForumMessage) => {
    setSelectedMessage(message)
    setIsDeleteMessageModalOpen(true)
  }

  const confirmDeleteMessage = async () => {
    if (!selectedMessage) return

    try {
      await deleteMessageHandler(selectedMessage.id)
      success("Message supprimé", "Le message a été supprimé avec succès")
      setIsDeleteMessageModalOpen(false)
      setSelectedMessage(null)
      await fetchMessages(forumId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du message"
      toastError("Erreur", errorMessage)
    }
  }

  const handleEditForum = (forum?: typeof currentForum) => {
    const forumToEdit = forum || currentForum
    if (forumToEdit) {
      setEditForumFormData({
        title: forumToEdit.title,
        image: null,
      })
      setEditForumImagePreview(forumToEdit.image_url || null)
      setIsEditForumModalOpen(true)
    }
  }

  const handleEditForumImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setEditForumErrors({ ...editForumErrors, image: "Le fichier doit être une image" })
        return
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditForumErrors({ ...editForumErrors, image: "La taille de l'image ne doit pas dépasser 5MB" })
        return
      }
      
      setEditForumFormData({ ...editForumFormData, image: file })
      setEditForumErrors({ ...editForumErrors, image: undefined })
      
      // Créer un aperçu
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditForumImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveEditForumImage = () => {
    setEditForumFormData({ ...editForumFormData, image: null })
    setEditForumImagePreview(currentForum?.image_url || null)
    if (editForumFileInputRef.current) {
      editForumFileInputRef.current.value = ''
    }
  }

  const handleUpdateForum = async () => {
    if (!currentForum) return

    setEditForumErrors({})
    const newErrors: Partial<Record<keyof ForumUpdateData, string>> = {}
    if (!editForumFormData.title?.trim()) {
      newErrors.title = "Le titre est requis"
    } else if (editForumFormData.title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères"
    }

    if (Object.keys(newErrors).length > 0) {
      setEditForumErrors(newErrors)
      return
    }

    try {
      await updateForumHandler(currentForum.id, editForumFormData)
      success("Forum modifié", "Le forum a été modifié avec succès.")
      setIsEditForumModalOpen(false)
      setEditForumFormData({ title: "", image: null })
      setEditForumImagePreview(null)
      setEditForumErrors({})
      if (editForumFileInputRef.current) {
        editForumFileInputRef.current.value = ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification du forum"
      toastError("Erreur", errorMessage)
    }
  }

  const handleDeleteForum = (forum: typeof currentForum) => {
    if (!forum) return
    setIsDeleteForumModalOpen(true)
  }

  const confirmDeleteForum = async () => {
    if (!currentForum) return

    try {
      await deleteForumHandler(currentForum.id)
      success("Forum supprimé", "Le forum a été supprimé avec succès")
      router.push("/forum")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du forum"
      toastError("Erreur", errorMessage)
    }
  }

  if (loading && !currentForum) {
    return (
      <AuthGuard redirectTo="/">
        <LayoutWrapper>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  if (error && !currentForum) {
    return (
      <AuthGuard redirectTo="/">
        <LayoutWrapper>
          <div className="flex items-center justify-center min-h-[60vh] px-6">
            <div className="p-4 sm:p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive max-w-md">
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          </div>
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  if (!currentForum) {
    return (
      <AuthGuard redirectTo="/">
        <LayoutWrapper>
          <div className="flex items-center justify-center min-h-[60vh] px-6">
            <div className="text-center">
              <p className="text-base sm:text-lg text-muted-foreground mb-4">Forum introuvable</p>
              <Button variant="outline" onClick={() => router.push("/forum")} className="w-full sm:w-auto">
                Retour aux forums
              </Button>
            </div>
          </div>
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard redirectTo="/">
      <LayoutWrapper
        sidebarProps={{
          forums,
          forumsLoading: loading,
          onCreateForumClick: () => setIsCreateModalOpen(true),
          onEditForumClick: (forum: any) => handleEditForum(forum),
          onDeleteForumClick: handleDeleteForum,
        }}
      >
        <div className="w-full">
          {/* Contenu principal - Design moderne et centré */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Image header avec overlay - Design moderne */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl shadow-lg">
                {currentForum.image_url ? (
                  <img
                    src={currentForum.image_url}
                    alt={currentForum.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30" />

                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                  <h1 className="text-3xl font-bold text-white text-balance">{currentForum.title}</h1>

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/20">
                        {currentForum.created_by_info.avatar_url ? (
                          <img
                            src={currentForum.created_by_info.avatar_url}
                            alt={currentForum.created_by_info.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-semibold">
                            {currentForum.created_by_info.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{currentForum.created_by_info.full_name}</div>
                        <div className="text-sm text-white/80">
                          {currentForum.last_message
                            ? `Dernière activité ${new Date(currentForum.last_message.created_at).toLocaleDateString('fr-FR')}`
                            : "Nouveau forum"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-white/90">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        {currentForum.message_count} messages
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages section - Design moderne et centré */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Réponses ({messages.length})</h3>
                </div>

                <Card className="overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    {messages.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <p className="text-sm">Aucun message pour le moment. Soyez le premier à participer !</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {messages.map((message) => (
                          <div key={message.id} className="p-5 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-background">
                                {message.author_info.avatar_url ? (
                                  <img
                                    src={message.author_info.avatar_url}
                                    alt={message.author_info.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                    {message.author_info.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="mb-2 flex items-center gap-3 flex-wrap">
                                  <span className="font-semibold text-foreground">{message.author_info.full_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Formulaire de réponse - Design moderne et centré */}
              <Card className="overflow-hidden shadow-sm border-2">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || "Vous"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {user?.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "VO"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">Ajouter votre réponse</h4>
                      <p className="text-sm text-muted-foreground">Partagez votre point de vue avec la communauté</p>
                    </div>
                  </div>

                  <ForumMessageForm
                    onSubmit={handleCreateMessage}
                    loading={loading}
                    placeholder="Partagez vos idées, posez vos questions..."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal d'édition de message */}
        <Dialog open={isEditMessageModalOpen} onOpenChange={setIsEditMessageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le message</DialogTitle>
              <DialogDescription>
                Modifiez le contenu de votre message.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-message-content">Message</Label>
                <Textarea
                  id="edit-message-content"
                  value={editMessageContent}
                  onChange={(e) => setEditMessageContent(e.target.value)}
                  disabled={loading}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditMessageModalOpen(false)
                  setSelectedMessage(null)
                  setEditMessageContent("")
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdateMessage} disabled={loading || !editMessageContent.trim()}>
                {loading ? "Modification..." : "Modifier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression de message */}
        <Dialog open={isDeleteMessageModalOpen} onOpenChange={setIsDeleteMessageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le message</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteMessageModalOpen(false)
                  setSelectedMessage(null)
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmDeleteMessage} disabled={loading}>
                {loading ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de modification de forum */}
        <Dialog open={isEditForumModalOpen} onOpenChange={setIsEditForumModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le forum</DialogTitle>
              <DialogDescription>
                Modifiez les informations de votre forum.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateForum(); }}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-forum-title">
                    Titre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-forum-title"
                    placeholder="Titre du forum"
                    value={editForumFormData.title || ""}
                    onChange={(e) =>
                      setEditForumFormData({ ...editForumFormData, title: e.target.value })
                    }
                    className={editForumErrors.title ? "border-destructive" : ""}
                  />
                  {editForumErrors.title && (
                    <p className="text-sm text-destructive">{editForumErrors.title}</p>
                  )}
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label htmlFor="edit-forum-image">Image du forum (optionnel)</Label>
                  <div className="space-y-2">
                    {editForumImagePreview ? (
                      <div className="relative">
                        <img
                          src={editForumImagePreview}
                          alt="Aperçu"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveEditForumImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => editForumFileInputRef.current?.click()}
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
                      ref={editForumFileInputRef}
                      id="edit-forum-image"
                      type="file"
                      accept="image/*"
                      onChange={handleEditForumImageChange}
                      className="hidden"
                    />
                    {editForumErrors.image && (
                      <p className="text-sm text-destructive">{editForumErrors.image}</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditForumModalOpen(false)
                  setEditForumFormData({ title: "", image: null })
                  setEditForumImagePreview(null)
                  setEditForumErrors({})
                  if (editForumFileInputRef.current) {
                    editForumFileInputRef.current.value = ''
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

        {/* Modal de confirmation de suppression de forum */}
        <Dialog open={isDeleteForumModalOpen} onOpenChange={setIsDeleteForumModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le forum</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer le forum "{currentForum.title}" ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteForumModalOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmDeleteForum} disabled={loading}>
                {loading ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de création de forum */}
        <ForumCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateForum}
          loading={loading}
        />
      </LayoutWrapper>
    </AuthGuard>
  )
}

