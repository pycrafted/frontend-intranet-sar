"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { ImageIcon, X, Calendar, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ForumMessageForm } from "@/components/forum/forum-message-form"
import { ForumCreateModal } from "@/components/forum/forum-create-modal"
import { ForumSidebar } from "@/components/forum-sidebar"
import { useForum } from "@/hooks/useForum"
import { PageLoader } from "@/components/ui/loader"
import { useAuth } from "@/hooks/useAuth"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ForumMessage, ForumUpdateData, ForumCreateData } from "@/lib/types/forum"

interface ForumDetailPageProps {
  isMainSidebarCollapsed?: boolean
}

export default function ForumDetailPage(_: ForumDetailPageProps) {
  const confirm = useConfirm()
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
  const [isEditForumModalOpen, setIsEditForumModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ForumMessage | null>(null)
  const [editMessageContent, setEditMessageContent] = useState("")
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState("")
  const [editingMessageImage, setEditingMessageImage] = useState<string | null>(null)
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

  const handleCreateMessage = async (content: string, image?: File | null) => {
    try {
      if (isEditingMessage && editingMessageId) {
        // Sauvegarder l'ID du message avant d'annuler l'édition
        const messageIdToScroll = editingMessageId
        
        // Mode édition : mettre à jour le message
        await updateMessageHandler(messageIdToScroll, content, image)
        success("Message modifié", "Le message a été modifié avec succès")
        handleCancelEdit()
        await fetchMessages(forumId)
        
        // Faire défiler vers le message modifié après un court délai pour laisser le DOM se mettre à jour
        setTimeout(() => {
          const messageElement = document.getElementById(`forum-message-${messageIdToScroll}`)
          if (messageElement) {
            messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
            // Ajouter un effet visuel temporaire pour mettre en évidence le message modifié
            messageElement.classList.add("ring-2", "ring-primary", "ring-offset-2")
            setTimeout(() => {
              messageElement.classList.remove("ring-2", "ring-primary", "ring-offset-2")
            }, 2000)
          }
        }, 300)
      } else {
        // Mode création : créer un nouveau message
        await createMessage(forumId, content, image)
        await fetchMessages(forumId)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi du message"
      toastError("Erreur", errorMessage)
      throw err
    }
  }

  const handleEditMessage = (message: ForumMessage) => {
    setEditingMessageId(message.id)
    setEditingMessageContent(message.content || "")
    setEditingMessageImage(message.image_url || null)
    setIsEditingMessage(true)
    // Scroll vers le formulaire en bas
    setTimeout(() => {
      const formElement = document.getElementById("forum-message-form")
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  const handleCancelEdit = () => {
    setIsEditingMessage(false)
    setEditingMessageId(null)
    setEditingMessageContent("")
    setEditingMessageImage(null)
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

  const handleDeleteMessage = async (message: ForumMessage) => {
    if (!await confirm({ message: 'Supprimer ce message ? Cette action est irréversible.', title: 'Supprimer le message' })) return
    try {
      await deleteMessageHandler(message.id)
      success("Message supprimé", "Le message a été supprimé avec succès")
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
    setEditForumImagePreview(null)
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

  const handleDeleteForum = async (forum: typeof currentForum) => {
    if (!forum) return
    if (!await confirm({ message: `Supprimer le forum "${forum.title}" ? Cette action est irréversible.`, title: 'Supprimer le forum' })) return
    try {
      await deleteForumHandler(forum.id)
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
          <PageLoader />
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  if (error && !currentForum) {
    return (
      <AuthGuard redirectTo="/">
        <LayoutWrapper>
          <div className="flex items-center justify-center min-h-[60vh] px-6">
            <div className="text-center">
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button variant="outline" onClick={() => router.push("/forum")}>Retour aux forums</Button>
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
      <LayoutWrapper>
        <ForumSidebar
          forums={forums}
          loading={loading}
          onCreateClick={() => setIsCreateModalOpen(true)}
          onEditForum={handleEditForum}
          onDeleteForum={handleDeleteForum}
          isMainSidebarCollapsed={true}
        />
        <div className="lg:pl-80 w-full space-y-4 xs:space-y-6 px-0">
          <div className="py-6 px-4">
            <div className="max-w-3xl mx-auto space-y-3 xs:space-y-4">
              <Card className="adaptive-publication-card rounded-xl overflow-hidden group fade-in w-full news-card">
                <CardContent className="p-0 w-full">
                  {currentForum.image_url && (
                    <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gray-50 -mx-0">
                      <img src={currentForum.image_url} alt={currentForum.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30" />
                    </div>
                  )}
                  <div className="px-3 xs:px-4 sm:px-6 pt-2 xs:pt-3 pb-1">
                    <div className="flex items-center justify-between mb-2 xs:mb-3">
                      <div className="publication-date flex items-center gap-1 xs:gap-2 text-base xs:text-lg text-gray-500">
                        <Calendar className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" />
                        <span className="date-text font-medium text-gray-600 hidden xs:inline">
                          {currentForum.last_message
                            ? new Date(currentForum.last_message.created_at).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            : new Date().toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="date-text font-medium text-gray-600 xs:hidden">
                          {currentForum.last_message
                            ? new Date(currentForum.last_message.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: '2-digit' })
                            : new Date().toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 xs:gap-4">
                        <div className="relative h-10 w-10 xs:h-12 xs:w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-200">
                          <img
                            src={currentForum.created_by_info.avatar_url || "/placeholder-user.jpg"}
                            alt={currentForum.created_by_info.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { const t = e.target as HTMLImageElement; if (t.src !== "/placeholder-user.jpg") t.src = "/placeholder-user.jpg" }}
                          />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 text-base xs:text-lg">{currentForum.created_by_info.full_name}</div>
                          <div className="text-sm xs:text-base text-gray-500">
                            {currentForum.last_message
                              ? `Dernière activité ${new Date(currentForum.last_message.created_at).toLocaleDateString('fr-FR')}`
                              : "Nouveau forum"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 xs:px-4 sm:px-6 pb-4 xs:pb-6 w-full">
                    <h1 className="article-title mb-0 w-full block text-2xl xs:text-3xl font-bold text-gray-900 leading-tight">
                      {currentForum.title}
                    </h1>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3 xs:space-y-4 relative">
                <div className="flex items-center gap-2 mb-3 xs:mb-4 px-1">
                  <div className="w-1 h-4 xs:h-6 rounded-full" style={{ backgroundColor: '#344256' }}></div>
                  <h3 className="text-base xs:text-lg font-semibold text-gray-900">Avis</h3>
                  <Badge variant="secondary" className="ml-2 text-xs xs:text-sm px-2 py-1 text-white" style={{ backgroundColor: '#344256' }}>
                    {messages.length}
                  </Badge>
                </div>

                {messages.length === 0 ? (
                  <Card className="adaptive-publication-card rounded-xl overflow-hidden fade-in w-full">
                    <CardContent className="py-12 text-center">
                      <p className="text-sm xs:text-base text-gray-500">Aucun message pour le moment. Soyez le premier à participer !</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 xs:space-y-4">
                    {messages.map((message) => (
                      <Card
                        key={message.id}
                        id={`forum-message-${message.id}`}
                        className="adaptive-publication-card rounded-xl overflow-hidden group fade-in w-full news-card transition-all duration-300"
                      >
                        <CardContent className="p-0 w-full">
                          <div className="px-3 xs:px-4 sm:px-6 pt-2 xs:pt-3 pb-1">
                            <div className="flex items-center justify-between mb-2 xs:mb-3">
                              <div className="publication-date flex items-center gap-1 xs:gap-2 text-base xs:text-lg text-gray-500">
                                <Calendar className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" />
                                <span className="date-text font-medium text-gray-600 hidden xs:inline">
                                  {new Date(message.created_at).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="date-text font-medium text-gray-600 xs:hidden">
                                  {new Date(message.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: '2-digit' })}
                                </span>
                                <span className="separator text-gray-400 hidden xs:inline">•</span>
                                <span className="time-text text-gray-500 hidden xs:inline">
                                  {new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {user && message.author === user.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditMessage(message)} className="cursor-pointer">Modifier</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteMessage(message)} className="cursor-pointer text-destructive focus:text-destructive">Supprimer</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                          <div className="px-3 xs:px-4 sm:px-6 pb-4 xs:pb-6 w-full">
                            <div className="flex items-start gap-3 xs:gap-4 mb-3 xs:mb-4">
                              <div className="relative h-10 w-10 xs:h-12 xs:w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-200">
                                <img
                                  src={message.author_info.avatar_url || "/placeholder-user.jpg"}
                                  alt={message.author_info.full_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { const t = e.target as HTMLImageElement; if (t.src !== "/placeholder-user.jpg") t.src = "/placeholder-user.jpg" }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="mb-2 xs:mb-3">
                                  <span className="font-semibold text-gray-900 text-base xs:text-lg">{message.author_info.full_name}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-gray-700 leading-relaxed text-xl xs:text-2xl">
                              <div className="publication-content whitespace-pre-wrap break-words">
                                {message.content.split(/(!\[.*?\]\(.*?\))/g).map((part, index) => {
                                  const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/)
                                  if (imageMatch) {
                                    return <img key={index} src={imageMatch[2]} alt={imageMatch[1] || "GIF"} className="max-w-full h-auto rounded-lg my-2" loading="lazy" />
                                  }
                                  return <span key={index}>{part}</span>
                                })}
                              </div>
                              {message.image_url && (
                                <div className="mt-3">
                                  <img src={message.image_url} alt="Image du message" className="max-w-full h-auto rounded-lg" loading="lazy" />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Card id="forum-message-form" className="rounded-xl overflow-visible fade-in w-full" style={{ backgroundColor: '#344256' }}>
                <CardContent className="p-4 w-full overflow-visible">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white/20">
                      <img
                        src={user?.avatar_url || "/placeholder-user.jpg"}
                        alt={user?.full_name || "Vous"}
                        className="w-full h-full object-cover"
                        onError={(e) => { const t = e.target as HTMLImageElement; if (t.src !== "/placeholder-user.jpg") t.src = "/placeholder-user.jpg" }}
                      />
                    </div>
                    <span className="font-semibold text-white text-sm">{user?.full_name || "Vous"}</span>
                    <Badge variant="outline" className="ml-auto text-xs px-2 py-0.5 bg-white/20 text-white border-white/30">
                      {isEditingMessage ? "Modifier l'avis" : "Nouvel avis"}
                    </Badge>
                  </div>
                  <div className="relative overflow-visible">
                    <ForumMessageForm
                      onSubmit={handleCreateMessage}
                      onCancel={handleCancelEdit}
                      loading={loading}
                      placeholder="Partagez vos idées, posez vos questions..."
                      initialContent={editingMessageContent}
                      initialImageUrl={editingMessageImage}
                      isEditing={isEditingMessage}
                    />
                  </div>
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
                      <Label
                        htmlFor="edit-forum-image"
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors block"
                      >
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Cliquez pour sélectionner une image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF jusqu'à 5MB
                        </p>
                      </Label>
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

