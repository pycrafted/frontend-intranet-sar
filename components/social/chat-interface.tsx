"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSocialNetwork } from "@/hooks/useSocialNetwork"
import { User } from "@/contexts/AuthContext"
import { EmojiPicker } from "./emoji-picker"
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Plus,
  Star,
  Mic,
  Image as ImageIcon,
  X,
  Menu,
  Loader2,
  UserPlus,
  Trash2,
} from "lucide-react"

export function ChatInterface() {
  const {
    conversations,
    isLoadingConversations,
    conversationsError,
    messages,
    isLoadingMessages,
    messagesError,
    searchResults,
    isSearching,
    searchError,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    createConversationWithUser,
    searchUsers,
    clearSearch,
    getConversation,
    toggleFavorite,
    deleteConversation,
    deleteMessage,
  } = useSocialNetwork()

  // États initiaux - null pour éviter les problèmes d'hydratation
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showUserSearchDialog, setShowUserSearchDialog] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, messageId: string} | null>(null)
  const [conversationContextMenu, setConversationContextMenu] = useState<{x: number, y: number, conversationId: string} | null>(null)

  // S'assurer que le composant est monté côté client pour éviter les problèmes d'hydratation
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Afficher uniquement le sidebar secondaire si largeur < 1024px
  useEffect(() => {
    // Éviter les problèmes d'hydratation en ne s'exécutant que côté client
    if (!isClient || typeof window === 'undefined') return
    
    const applyLayout = () => {
      const isSmall = window.innerWidth < 1024
      setIsSidebarOpen(isSmall)
    }
    applyLayout()
    window.addEventListener('resize', applyLayout)
    return () => window.removeEventListener('resize', applyLayout)
  }, [isClient])

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedChat) {
      // Réinitialiser le flag de marquage quand on change de conversation
      markedAsReadRef.current.delete(selectedChat)
      fetchMessages(selectedChat)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat])
  
  // Ref pour éviter de marquer les messages comme lus plusieurs fois
  const markedAsReadRef = useRef<Set<string>>(new Set())
  
  // Marquer les messages comme lus après les avoir chargés (une seule fois par conversation)
  useEffect(() => {
    if (!selectedChat || !messages[selectedChat] || messages[selectedChat].length === 0) {
      return
    }
    
    // Vérifier si on a déjà marqué cette conversation comme lue
    const hasUnreadMessages = messages[selectedChat].some(msg => !msg.is_read)
    
    // Ne marquer comme lus que s'il y a des messages non lus et qu'on ne l'a pas déjà fait
    if (hasUnreadMessages && !markedAsReadRef.current.has(selectedChat)) {
      markedAsReadRef.current.add(selectedChat)
      markMessagesAsRead(selectedChat).finally(() => {
        // Retirer de la liste après un délai pour permettre un nouveau marquage si nécessaire
        setTimeout(() => {
          markedAsReadRef.current.delete(selectedChat)
        }, 2000)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]) // Ne dépendre que de selectedChat, pas de messages pour éviter la boucle

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (selectedChat && messages[selectedChat]) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, selectedChat])

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  // Fermer les menus contextuels avec Escape ou clic extérieur
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null)
        setConversationContextMenu(null)
      }
    }

    const handleClickOutside = () => {
      setContextMenu(null)
      setConversationContextMenu(null)
    }

    if (contextMenu || conversationContextMenu) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu, conversationContextMenu])

  // État pour le filtre actif
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favorites'>('all')
  
  // Recherche de conversations (filtrage local)
  const filteredConversations = useMemo(() => {
    let filtered = conversations
    
    // Appliquer le filtre actif
    if (activeFilter === 'unread') {
      filtered = filtered.filter(conv => (conv.unread || 0) > 0)
    } else if (activeFilter === 'favorites') {
      filtered = filtered.filter(conv => conv.is_pinned === true)
    }
    
    // Appliquer la recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((conv) =>
        conv.name.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
      )
    }
    
    // Trier : favoris en premier, puis par date de dernier message
    return filtered.sort((a, b) => {
      // Favoris en premier
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      // Puis par date de dernier message (plus récent en premier)
      const dateA = new Date(a.last_message_at || a.created_at || 0).getTime()
      const dateB = new Date(b.last_message_at || b.created_at || 0).getTime()
      return dateB - dateA
    })
  }, [conversations, searchQuery, activeFilter])

  // Sélectionner la première conversation si aucune n'est sélectionnée
  useEffect(() => {
    if (!selectedChat && conversations.length > 0) {
      setSelectedChat(conversations[0].id)
    }
  }, [conversations, selectedChat])

  // Recherche d'utilisateurs avec debounce
  useEffect(() => {
    if (!showUserSearchDialog) {
      setUserSearchQuery("")
      clearSearch()
      return
    }

    const timeoutId = setTimeout(() => {
      if (userSearchQuery.length >= 2) {
        searchUsers(userSearchQuery)
      } else {
        clearSearch()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [userSearchQuery, showUserSearchDialog, searchUsers, clearSearch])

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
    // Si largeur < 1024px, rester sur le sidebar uniquement
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(true)
    } else {
      setIsSidebarOpen(false)
    }
  }

  const handleCreateConversation = async (userId: number) => {
    const conversation = await createConversationWithUser(userId)
    if (conversation) {
      setSelectedChat(conversation.id)
      setShowUserSearchDialog(false)
      setUserSearchQuery("")
      clearSearch()
    }
  }

  const handleDeleteConversation = async () => {
    if (!selectedChat) return
    
    setIsDeleting(true)
    try {
      await deleteConversation(selectedChat)
      setSelectedChat(null)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la conversation')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    setIsDeletingMessage(true)
    try {
      await deleteMessage(messageId)
      setMessageToDelete(null)
      setContextMenu(null)
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error)
      alert('Erreur lors de la suppression du message')
    } finally {
      setIsDeletingMessage(false)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, messageId: string, isSent: boolean) => {
    // Ne montrer le menu contextuel que pour les messages envoyés par l'utilisateur et non supprimés
    const message = currentMessages.find(m => m.id === messageId)
    if (!isSent || message?.is_deleted) {
      return
    }
    
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId
    })
  }

  const handleConversationContextMenu = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConversationContextMenu({
      x: e.clientX,
      y: e.clientY,
      conversationId
    })
  }

  const handleCloseConversationContextMenu = () => {
    setConversationContextMenu(null)
  }

  // Fonction pour détecter et transformer les liens en URLs cliquables
  const detectLinks = (text: string): string => {
    // Expression régulière pour détecter les URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline text-blue-400 hover:text-blue-300">$1</a>')
  }

  // Gérer la sélection de fichiers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = event.target.files?.[0]
    if (file) {
      if (type === 'image') {
        // Vérifier que c'est une image
        if (!file.type.startsWith('image/')) {
          alert('Veuillez sélectionner une image')
          return
        }
        // Limite de taille pour les images (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert('L\'image est trop volumineuse. Taille maximale: 10MB')
          return
        }
      } else {
        // Limite de taille pour les documents (50MB)
        if (file.size > 50 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. Taille maximale: 50MB')
          return
        }
      }
      setSelectedFile(file)
    }
  }

  // Gérer l'envoi du message
  const handleSendMessage = async () => {
    if (!selectedChat || (!messageInput.trim() && !selectedFile)) {
      return
    }

    const fileToSend = selectedFile
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''

    await sendMessage(selectedChat, messageInput, undefined, fileToSend || undefined)
    setMessageInput("")
  }

  const selectedConversation = selectedChat ? getConversation(selectedChat) : null
  const currentMessages = selectedChat ? (messages[selectedChat] || []) : []

  // Ne pas rendre le composant avant que le client soit prêt (évite les problèmes d'hydratation)
  if (!isClient) {
    return (
      <div className="flex w-full h-[calc(100dvh-10rem)] items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  // Prendre tout l'espace disponible en tenant compte du navbar et du footer
  // La carte doit être collée au sidebar principal, navbar et footer
  // La hauteur est gérée par le conteneur parent
  return (
    <>
      <div
        className="flex w-full h-full overflow-hidden border-0 rounded-none m-0 p-0"
        style={{ backgroundColor: '#fdfdfe' }}
      >
        {/* Sidebar conversations */}
        <div
          className={`fixed lg:relative inset-y-0 left-0 z-10 w-full max-w-full sm:w-[320px] lg:w-[340px] border-r border-border flex flex-col shadow-sm transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          style={{ backgroundColor: '#fdfdfe' }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Messages</h1>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg hover:bg-muted"
                  onClick={() => setShowUserSearchDialog(true)}
                  title="Nouvelle conversation"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une conversation..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 h-10 bg-muted/30 border-0 focus-visible:bg-muted/50 transition-colors rounded-lg" 
              />
              {searchQuery && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery("")}> 
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="px-3 py-3 border-b border-border flex gap-2 overflow-x-auto scrollbar-thin">
            <Badge 
              variant={activeFilter === 'all' ? "secondary" : "outline"} 
              className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer whitespace-nowrap hover:bg-muted"
              onClick={() => setActiveFilter('all')}
            >
              Tous
            </Badge>
            <Badge 
              variant={activeFilter === 'unread' ? "secondary" : "outline"} 
              className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-muted whitespace-nowrap"
              onClick={() => setActiveFilter('unread')}
            >
              Non lus ({conversations.filter(c => (c.unread || 0) > 0).length})
            </Badge>
            <Badge 
              variant={activeFilter === 'favorites' ? "secondary" : "outline"} 
              className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-muted whitespace-nowrap"
              onClick={() => setActiveFilter('favorites')}
            >
              <Star className="h-3 w-3 mr-1" /> Favoris ({conversations.filter(c => c.is_pinned).length})
            </Badge>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-2">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversationsError ? (
                <div className="text-center py-8 text-sm text-destructive">
                  <p>Erreur : {conversationsError}</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <p>{searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}</p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowUserSearchDialog(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Nouvelle conversation
                    </Button>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative w-full p-3 sm:p-3.5 rounded-xl flex items-start gap-3 transition-all duration-200 ${selectedChat === conv.id ? "bg-primary/10 shadow-sm" : "hover:bg-muted/50"}`}
                    onContextMenu={(e) => handleConversationContextMenu(e, conv.id)}
                  >
                    <button
                      onClick={() => handleSelectChat(conv.id)}
                      className="flex items-start gap-3 flex-1 min-w-0"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-11 w-11 sm:h-12 sm:w-12 border-2 border-background shadow-sm">
                          <AvatarImage src={conv.avatar || "/placeholder.svg"} alt={conv.name} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                          <AvatarFallback className="text-sm font-medium">{conv.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {conv.online && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-[2.5px] border-card shadow-sm" />}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {conv.is_pinned && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-sm truncate">{conv.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-medium">{conv.time}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate leading-relaxed">{conv.lastMessage}</p>
                          {conv.unread && conv.unread > 0 && (
                            <Badge className="flex-shrink-0 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center font-semibold shadow-sm">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${conv.is_pinned ? 'text-yellow-500 fill-yellow-500 opacity-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(conv.id).catch(err => console.error('Erreur lors du basculement favori:', err))
                      }}
                      title={conv.is_pinned ? "Retirer des favoris" : "Mettre en favoris"}
                    >
                      <Star className={`h-4 w-4 ${conv.is_pinned ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Overlay mobile */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-0 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

        {/* Main chat area */}
        <div className={`${isSidebarOpen ? 'hidden' : 'flex'} lg:flex flex-1 flex-col w-full lg:w-auto min-h-0`}>
          {selectedConversation ? (
            <>
              <div className="h-12 sm:h-14 md:h-16 border-b border-border px-2 sm:px-4 md:px-6 flex items-center justify-between" style={{ backgroundColor: '#fdfdfe' }}>
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted lg:hidden flex-shrink-0" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} alt={selectedConversation.name} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                      <AvatarFallback>{selectedConversation.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {selectedConversation.online && <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-[2.5px] border-card" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm sm:text-base truncate">{selectedConversation.name}</h2>
                    <p className="text-xs text-muted-foreground font-medium">{selectedConversation.online ? "En ligne" : "Hors ligne"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted hidden sm:flex ${selectedConversation?.is_pinned ? 'text-yellow-500 fill-yellow-500' : ''}`}
                    onClick={() => selectedChat && toggleFavorite(selectedChat).catch(err => console.error('Erreur lors du basculement favori:', err))}
                    title={selectedConversation?.is_pinned ? "Retirer des favoris" : "Mettre en favoris"}
                  >
                    <Star className={`h-5 w-5 ${selectedConversation?.is_pinned ? 'fill-current' : ''}`} />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted">
                        <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer la conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto min-h-0" style={{ backgroundColor: '#fdfdfe', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                <div className="py-2 sm:py-4 md:py-5 px-2 sm:px-4 md:px-8 space-y-3 sm:space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messagesError ? (
                    <div className="text-center py-8 text-sm text-destructive">
                      <p>Erreur : {messagesError}</p>
                    </div>
                  ) : currentMessages.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <p>Aucun message pour l'instant</p>
                      <p className="text-xs mt-2">Envoyez le premier message !</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center my-4 sm:my-6">
                        <div className="bg-muted/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 rounded-full">
                          <span className="text-xs font-medium text-muted-foreground">Aujourd'hui</span>
                        </div>
                      </div>
                      {currentMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sent ? "justify-start" : "justify-end"} group relative`}
                          onContextMenu={(e) => handleContextMenu(e, message.id, message.sent)}
                        >
                          <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
                            <div className={`relative ${message.sent ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-foreground shadow-sm border border-border/50"} rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 hover:shadow-lg ${message.is_deleted ? "opacity-60 italic" : ""}`}>
                              
                              {/* Afficher l'image si c'est un message image et non supprimé */}
                              {message.message_type === 'image' && message.attachment_url && !message.is_deleted && (
                                <div className="mb-2 rounded-lg overflow-hidden max-w-xs">
                                  <img 
                                    src={message.attachment_url} 
                                    alt="Image envoyée" 
                                    className="w-full h-auto object-cover rounded-lg"
                                    onClick={() => window.open(message.attachment_url || '', '_blank')}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </div>
                              )}
                              
                              {/* Afficher le document si c'est un message file et non supprimé */}
                              {message.message_type === 'file' && message.attachment_url && !message.is_deleted && (
                                <div className="mb-2 p-2 bg-background/50 rounded-lg border border-border/50">
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    <a 
                                      href={message.attachment_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm underline hover:no-underline truncate flex-1"
                                    >
                                      {message.attachment || 'Document'}
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              {/* Afficher le texte avec liens détectés */}
                              {message.text && (
                                <p 
                                  className={`text-sm sm:text-[15px] leading-relaxed ${message.is_deleted ? "text-muted-foreground" : ""}`}
                                  dangerouslySetInnerHTML={{ __html: message.is_deleted ? "Message supprimé" : detectLinks(message.text) }}
                                />
                              )}
                              
                              {/* Afficher uniquement l'heure si pas de texte mais un fichier */}
                              {!message.text && (message.attachment_url || message.message_type !== 'text') && !message.is_deleted && (
                                <div className="text-xs text-muted-foreground/70 italic">Pièce jointe</div>
                              )}
                              
                              <span className={`text-[11px] mt-1 sm:mt-1.5 block font-medium ${message.sent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{message.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>

              {/* Composer */}
              <div className="border-t border-border p-2 sm:p-3 md:p-5" style={{ backgroundColor: '#fdfdfe' }}>
                <div className="px-0 sm:px-3">
                  <div className="flex items-end gap-2 sm:gap-3">
                    <div className="hidden sm:flex gap-1">
                      {/* Input caché pour les documents */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileSelect(e, 'file')}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                      />
                      {/* Input caché pour les images */}
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={(e) => handleFileSelect(e, 'image')}
                        className="hidden"
                        accept="image/*"
                      />
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 md:h-10 md:w-10 rounded-lg hover:bg-muted flex-shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        title="Joindre un document"
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 md:h-10 md:w-10 rounded-lg hover:bg-muted flex-shrink-0"
                        onClick={() => imageInputRef.current?.click()}
                        title="Joindre une image"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-2xl px-2 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 flex items-center gap-2 sm:gap-3 border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-all relative">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Écrivez votre message..."
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm md:text-[15px] placeholder:text-muted-foreground/60"
                        disabled={isLoadingMessages}
                      />
                      {/* Aperçu du fichier sélectionné */}
                      {selectedFile && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-background border border-border rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedFile(null)
                              if (fileInputRef.current) fileInputRef.current.value = ''
                              if (imageInputRef.current) imageInputRef.current.value = ''
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <EmojiPicker
                          onEmojiSelect={(emoji) => {
                            setMessageInput((prev) => prev + emoji)
                          }}
                          className="flex-shrink-0"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-muted/50 flex-shrink-0 hidden sm:flex"><Mic className="h-5 w-5" /></Button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendMessage} 
                      size="icon" 
                      className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex-shrink-0"
                      disabled={(!messageInput.trim() && !selectedFile) || isLoadingMessages}
                    >
                      <Send className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <p className="text-muted-foreground mb-4">Sélectionnez une conversation pour commencer</p>
                <Button onClick={() => setShowUserSearchDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nouvelle conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de recherche d'utilisateurs */}
      <Dialog open={showUserSearchDialog} onOpenChange={setShowUserSearchDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Recherchez un utilisateur par son nom, prénom, téléphone ou matricule
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom, prénom, téléphone, matricule..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {searchError && (
              <div className="text-sm text-destructive">
                {searchError}
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {searchResults.length === 0 && userSearchQuery.length >= 2 && !isSearching ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <p>Aucun utilisateur trouvé</p>
                </div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleCreateConversation(user.id)}
                    className="w-full p-3 rounded-lg hover:bg-muted/50 flex items-center gap-3 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCreateConversation(user.id)
                      }
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                      <AvatarFallback>{user.full_name?.slice(0, 2).toUpperCase() || user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.full_name || user.username}</p>
                      {user.position && (
                        <p className="text-xs text-muted-foreground truncate">{user.position}</p>
                      )}
                      {user.matricule && (
                        <p className="text-xs text-muted-foreground">Matricule: {user.matricule}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 p-1 rounded-full hover:bg-muted">
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression de conversation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la conversation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action ne peut pas être annulée.
              La conversation sera supprimée uniquement pour vous, votre interlocuteur pourra toujours la voir.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression de message */}
      <Dialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le message</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action ne peut pas être annulée.
              Le message sera supprimé pour tous les participants qui verront "Message supprimé".
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setMessageToDelete(null)}
              disabled={isDeletingMessage}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}
              disabled={isDeletingMessage}
            >
              {isDeletingMessage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu contextuel pour les messages */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleCloseContextMenu}
            onContextMenu={(e) => {
              e.preventDefault()
              handleCloseContextMenu()
            }}
          />
          <div
            className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[180px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMessageToDelete(contextMenu.messageId)
                handleCloseContextMenu()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer le message</span>
            </button>
          </div>
        </>
      )}

      {/* Menu contextuel pour les conversations dans le sidebar */}
      {conversationContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleCloseConversationContextMenu}
            onContextMenu={(e) => {
              e.preventDefault()
              handleCloseConversationContextMenu()
            }}
          />
          <div
            className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[200px]"
            style={{
              left: conversationContextMenu.x,
              top: conversationContextMenu.y,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedChat(conversationContextMenu.conversationId)
                setShowDeleteDialog(true)
                handleCloseConversationContextMenu()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer la conversation</span>
            </button>
          </div>
        </>
      )}
    </>
  )
}
