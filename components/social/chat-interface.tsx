"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSocialNetwork } from "@/hooks/useSocialNetwork"
import { EmojiPicker } from "./emoji-picker"
import { GifPicker } from "./gif-picker"
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Plus,
  Star,
  Image as ImageIcon,
  X,
  Menu,
  Loader2,
  UserPlus,
  Trash2,
  Edit,
} from "lucide-react"

export function ChatInterface() {
  const searchParams = useSearchParams()
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
    updateMessage,
    checkNewMessages,
    markConversationAsRead,
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true) // Flag pour forcer le scroll (après envoi de message)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, messageId: string} | null>(null)
  const [conversationContextMenu, setConversationContextMenu] = useState<{x: number, y: number, conversationId: string} | null>(null)
  const isPollingMessagesRef = useRef(false)

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

  // Fonction pour vérifier si l'utilisateur est proche du bas du conteneur
  const isNearBottom = (): boolean => {
    const container = messagesContainerRef.current
    if (!container) return true // Par défaut, considérer qu'on est en bas si le conteneur n'existe pas
    
    const threshold = 150 // Seuil en pixels (150px du bas)
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    
    // Vérifier si on est proche du bas (à moins de threshold pixels)
    return scrollHeight - scrollTop - clientHeight < threshold
  }

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  // Mais seulement si l'utilisateur est déjà proche du bas ou s'il vient d'envoyer un message
  useEffect(() => {
    if (selectedChat && messages[selectedChat]) {
      // Toujours scroller si shouldAutoScrollRef est true (après envoi de message)
      // Sinon, scroller seulement si l'utilisateur est proche du bas
      if (shouldAutoScrollRef.current || isNearBottom()) {
        // Utiliser setTimeout pour s'assurer que le DOM est mis à jour
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          shouldAutoScrollRef.current = false // Réinitialiser le flag
        }, 100)
      }
    }
  }, [messages, selectedChat])

  // Polling automatique pour vérifier les nouveaux messages de la conversation active
  useEffect(() => {
    if (!selectedChat) {
      return
    }

    // Intervalle de polling : 2 secondes pour la conversation active (plus rapide)
    const pollingInterval = 2000
    let pollingTimeout: NodeJS.Timeout | null = null

    const pollForNewMessages = async () => {
      // Éviter les appels multiples simultanés
      if (isPollingMessagesRef.current) {
        return
      }

      isPollingMessagesRef.current = true

      try {
        await checkNewMessages(selectedChat)
        // Marquer automatiquement comme lus si de nouveaux messages sont détectés
        // (la fonction checkNewMessages met déjà à jour les messages)
      } catch (err) {
        // Ignorer les erreurs silencieusement pour ne pas polluer la console
        console.debug('⚠️ [CHAT_INTERFACE] Erreur lors de la vérification des nouveaux messages:', err)
      } finally {
        isPollingMessagesRef.current = false
      }
    }

    // Démarrer le polling
    const startPolling = () => {
      pollForNewMessages()
      pollingTimeout = setTimeout(startPolling, pollingInterval)
    }

    // Attendre un peu avant de commencer le polling (éviter les appels immédiats)
    const initialDelay = setTimeout(() => {
      startPolling()
    }, 1000)

    // Nettoyer les timeouts au démontage ou changement de conversation
    return () => {
      if (pollingTimeout) {
        clearTimeout(pollingTimeout)
      }
      clearTimeout(initialDelay)
      isPollingMessagesRef.current = false
    }
  }, [selectedChat, checkNewMessages])

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
  
  // Recherche de conversations (filtrage local) avec mémorisation stricte
  const filteredConversations = useMemo(() => {
    let filtered = conversations
    
    // Appliquer le filtre actif
    if (activeFilter === 'unread') {
      filtered = filtered.filter(conv => (conv.unread || 0) > 0)
    } else if (activeFilter === 'favorites') {
      filtered = filtered.filter(conv => conv.is_pinned === true)
    }
    
    // Trier : favoris en premier, puis par date de dernier message
    const sorted = filtered.sort((a, b) => {
      // Favoris en premier
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      // Puis par date de dernier message (plus récent en premier)
      const dateA = new Date(a.last_message_at || a.created_at || 0).getTime()
      const dateB = new Date(b.last_message_at || b.created_at || 0).getTime()
      return dateB - dateA
    })
    
    // Retourner une nouvelle référence seulement si le contenu a vraiment changé
    return sorted
  }, [conversations, activeFilter])

  // Sélectionner une conversation depuis l'URL ou la première conversation disponible
  useEffect(() => {
    // Vérifier si un paramètre de conversation est présent dans l'URL
    const conversationParam = searchParams?.get('conversation')
    
    if (conversationParam && conversations.length > 0) {
      // Vérifier si la conversation existe dans la liste
      const conversationExists = conversations.some(conv => conv.id === conversationParam)
      if (conversationExists) {
        setSelectedChat(conversationParam)
        return
      }
    }
    
    // Sinon, sélectionner la première conversation si aucune n'est sélectionnée
    if (!selectedChat && conversations.length > 0) {
      setSelectedChat(conversations[0].id)
    }
  }, [conversations, selectedChat, searchParams])

  // Recherche d'utilisateurs avec debounce (déclenchée directement depuis le champ de recherche)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userSearchQuery.length >= 2) {
        searchUsers(userSearchQuery)
      } else {
        clearSearch()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [userSearchQuery, searchUsers, clearSearch])

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
    // Forcer le scroll vers le bas quand on change de conversation
    shouldAutoScrollRef.current = true
    // Marquer la conversation comme lue localement pour arrêter immédiatement le clignotement
    markConversationAsRead(chatId)
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

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setMessageInput(message.text || '')
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setMessageInput('')
    setIsEditingMessage(false)
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

  // Fonction pour rendre le contenu avec support des images markdown
  const renderMessageContent = (text: string, isDeleted: boolean, isSent: boolean) => {
    if (isDeleted) {
      return <span className="italic">Message supprimé</span>
    }

    // Détecter les images markdown ![alt](url)
    const parts = text.split(/(!\[.*?\]\(.*?\))/g)
    
    return (
      <>
        {parts.map((part, index) => {
          const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/)
          if (imageMatch) {
            const [, alt, url] = imageMatch
            return (
              <img
                key={index}
                src={url}
                alt={alt || "GIF"}
                className="max-w-xs h-auto rounded-lg my-2"
                loading="lazy"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            )
          }
          // Détecter les liens dans le texte restant
          const urlRegex = /(https?:\/\/[^\s]+)/g
          const textWithLinks = part.split(urlRegex).map((segment, segIndex) => {
            // Vérifier si le segment est une URL
            if (segment.match(/^https?:\/\/[^\s]+$/)) {
              return (
                <a
                  key={segIndex}
                  href={segment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400 hover:text-blue-300"
                >
                  {segment}
                </a>
              )
            }
            return <span key={segIndex}>{segment}</span>
          })
          return <span key={index}>{textWithLinks}</span>
        })}
      </>
    )
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

  // Gérer l'envoi du message ou la modification
  const handleSendMessage = async () => {
    if (!selectedChat || (!messageInput.trim() && !selectedFile)) {
      return
    }

    // Si on est en mode édition, modifier le message au lieu d'en envoyer un nouveau
    if (editingMessageId) {
      setIsEditingMessage(true)
      try {
        await updateMessage(editingMessageId, messageInput)
        handleCancelEdit()
      } catch (error) {
        console.error('Erreur lors de la modification du message:', error)
        alert('Erreur lors de la modification du message')
      } finally {
        setIsEditingMessage(false)
      }
      return
    }

    // Envoi normal d'un nouveau message
    const fileToSend = selectedFile
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''

    // Forcer le scroll après l'envoi du message
    shouldAutoScrollRef.current = true
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
        className="flex w-full h-full overflow-hidden border-0 rounded-none m-0 p-0 bg-white"
      >
        {/* Sidebar conversations */}
        <div
          className={`fixed lg:relative inset-y-0 left-0 z-10 w-full max-w-full sm:w-[320px] lg:w-[340px] border-r border-gray-200 flex flex-col shadow-sm transform transition-transform duration-300 ease-in-out bg-white ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
           {/* Header avec champ de recherche */}
           <div className="p-4 sm:p-5 border-b border-gray-200 bg-white">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-gray-100 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                   <X className="h-5 w-5" />
                 </Button>
               </div>
             </div>
             {/* Search users for new conversation - Plus visible */}
             <div className="relative">
               <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
               <Input 
                 placeholder="Nouvelle conversation..." 
                 value={userSearchQuery} 
                 onChange={(e) => setUserSearchQuery(e.target.value)} 
                 className="pl-12 pr-12 h-12 bg-white border-2 border-gray-200 focus-visible:bg-white focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-lg text-base" 
               />
               {isSearching && (
                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                 </div>
               )}
               {userSearchQuery && !isSearching && (
                 <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => {
                   setUserSearchQuery("")
                   clearSearch()
                 }}> 
                   <X className="h-4 w-4" />
                 </Button>
               )}
             </div>
           </div>

           <div className="px-3 py-3 border-b border-gray-200 flex gap-2 overflow-x-auto scrollbar-thin bg-white">
            <Badge 
              variant={activeFilter === 'all' ? "secondary" : "outline"} 
              className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer whitespace-nowrap ${activeFilter === 'all' ? "bg-blue-100 text-blue-800 border-blue-200" : "hover:bg-gray-100 border-gray-200"}`}
              onClick={() => setActiveFilter('all')}
            >
              Tous ({conversations.length})
            </Badge>
            <Badge 
              variant={activeFilter === 'favorites' ? "secondary" : "outline"} 
              className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer whitespace-nowrap ${activeFilter === 'favorites' ? "bg-blue-100 text-blue-800 border-blue-200" : "hover:bg-gray-100 border-gray-200"}`}
              onClick={() => setActiveFilter('favorites')}
            >
              <Star className="h-3 w-3 mr-1" /> Favoris ({conversations.filter(c => c.is_pinned).length})
            </Badge>
          </div>

          {/* Conversations ou résultats de recherche utilisateurs */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-2">
              {/* Afficher les résultats de recherche d'utilisateurs si une recherche est en cours */}
              {userSearchQuery.length >= 2 ? (
                <>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : searchError ? (
                    <div className="text-center py-8 text-sm text-destructive">
                      <p>Erreur : {searchError}</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      <p>Aucun utilisateur trouvé</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleCreateConversation(user.id)}
                          className="w-full p-3 rounded-xl hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleCreateConversation(user.id)
                            }
                          }}
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={user.avatar_url || "/placeholder-user.jpg"}
                              alt={user.full_name}
                              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border-2 border-white shadow-sm object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                if (target.src !== "/placeholder-user.jpg") {
                                  target.src = "/placeholder-user.jpg"
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{user.full_name || user.username}</p>
                            {user.position && (
                              <p className="text-xs text-gray-500 truncate">{user.position}</p>
                            )}
                            {user.matricule && (
                              <p className="text-xs text-gray-500">Matricule: {user.matricule}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <UserPlus className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isLoadingConversations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : conversationsError ? (
                    <div className="text-center py-8 text-sm text-destructive">
                      <p>Erreur : {conversationsError}</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      <p>Aucune conversation</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const hasUnread = (conv.unread || 0) > 0
                      // Ne pas clignoter si la conversation est sélectionnée
                      const shouldBlink = hasUnread && selectedChat !== conv.id
                      return (
                      <div
                        key={conv.id}
                        className={`group relative w-full p-3 sm:p-3.5 rounded-xl flex items-start gap-3 transition-all duration-200 ${selectedChat === conv.id ? "bg-blue-50 shadow-sm border border-blue-200/50" : hasUnread ? "bg-green-50 border border-green-200/50 hover:bg-green-100" : "bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200"}`}
                        onContextMenu={(e) => handleConversationContextMenu(e, conv.id)}
                        style={shouldBlink ? {
                          animation: 'blink 1.5s ease-in-out infinite'
                        } : {}}
                      >
                        <button
                          onClick={() => handleSelectChat(conv.id)}
                          className="flex items-start gap-3 flex-1 min-w-0"
                        >
                          <div className="relative flex-shrink-0">
                            <div className="relative flex-shrink-0">
                              <img
                                src={conv.avatar || "/placeholder-user.jpg"}
                                alt={conv.name}
                                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border-2 border-white shadow-sm object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  if (target.src !== "/placeholder-user.jpg") {
                                    target.src = "/placeholder-user.jpg"
                                  }
                                }}
                              />
                            </div>
                            {conv.online && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-[2.5px] border-white shadow-sm" />}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="font-semibold text-sm text-gray-900 truncate">{conv.name}</span>
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2 font-medium">{conv.time}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-gray-700 truncate leading-relaxed">{conv.lastMessage}</p>
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 flex-shrink-0 ${conv.is_pinned ? 'text-yellow-500 fill-yellow-500' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(conv.id).catch(err => console.error('Erreur lors du basculement favori:', err))
                            }}
                            title={conv.is_pinned ? "Retirer des favoris" : "Mettre en favoris"}
                          >
                            <Star className={`h-4 w-4 ${conv.is_pinned ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedChat(conv.id)
                              setShowDeleteDialog(true)
                            }}
                            title="Supprimer la conversation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      )
                    })
                  )}
                </>
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
              <div className="h-12 sm:h-14 md:h-16 border-b border-border px-2 sm:px-4 md:px-6 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted lg:hidden flex-shrink-0" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div className="relative flex-shrink-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={selectedConversation.avatar || "/placeholder-user.jpg"}
                        alt={selectedConversation.name}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-background shadow-sm object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src !== "/placeholder-user.jpg") {
                            target.src = "/placeholder-user.jpg"
                          }
                        }}
                      />
                    </div>
                    {selectedConversation.online && <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-[2.5px] border-card" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{selectedConversation.name}</h2>
                    <p className="text-sm text-gray-500 font-medium">{selectedConversation.online ? "En ligne" : "Hors ligne"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-gray-100 hidden sm:flex ${selectedConversation?.is_pinned ? 'text-yellow-500 fill-yellow-500' : ''}`}
                     onClick={() => selectedChat && toggleFavorite(selectedChat).catch(err => console.error('Erreur lors du basculement favori:', err))}
                     title={selectedConversation?.is_pinned ? "Retirer des favoris" : "Mettre en favoris"}
                   >
                     <Star className={`h-5 w-5 ${selectedConversation?.is_pinned ? 'fill-current' : ''}`} />
                   </Button>
                   <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-gray-100">
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
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto min-h-0 bg-white" 
                style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
              >
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
                        <div className="bg-gray-100 backdrop-blur-sm px-3 sm:px-4 py-1.5 rounded-full">
                          <span className="text-xs font-medium text-gray-600">Aujourd'hui</span>
                        </div>
                      </div>
                      {currentMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sent ? "justify-start" : "justify-end"} group relative`}
                          onContextMenu={(e) => handleContextMenu(e, message.id, message.sent)}
                        >
                          <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] ${message.sent ? "flex-row" : "flex-row-reverse"}`}>
                            {/* Boutons modifier/supprimer au survol (uniquement pour les messages envoyés) */}
                            {message.sent && !message.is_deleted && (
                              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-muted"
                                  onClick={() => handleEditMessage(message)}
                                  title="Modifier le message"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => {
                                    setMessageToDelete(message.id)
                                  }}
                                  title="Supprimer le message"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                            <div className={`relative ${message.sent ? "bg-primary text-primary-foreground shadow-md" : "bg-white text-gray-900 shadow-sm border border-gray-200"} rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 hover:shadow-lg ${message.is_deleted ? "opacity-60 italic" : ""}`}>
                              
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
                                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-gray-600" />
                                    <a 
                                      href={message.attachment_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-gray-700 underline hover:no-underline truncate flex-1"
                                    >
                                      {message.attachment || 'Document'}
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              {/* Afficher le texte avec liens détectés et images markdown */}
                              {message.text && (
                                <div 
                                  className={`leading-relaxed text-xl xs:text-2xl ${message.is_deleted ? "text-muted-foreground" : message.sent ? "text-primary-foreground" : "text-gray-700"}`}
                                >
                                  {renderMessageContent(message.text, message.is_deleted || false, message.sent || false)}
                                </div>
                              )}
                              
                              {/* Afficher uniquement l'heure si pas de texte mais un fichier */}
                              {!message.text && (message.attachment_url || message.message_type !== 'text') && !message.is_deleted && (
                                <div className="text-xs text-gray-500 italic">Pièce jointe</div>
                              )}
                              
                              <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                                <span className={`text-[11px] block font-medium ${message.sent ? "text-primary-foreground/70" : "text-gray-500"}`}>{message.time}</span>
                                {message.is_edited && (
                                  <span className={`text-[10px] italic ${message.sent ? "text-primary-foreground/60" : "text-gray-400"}`}>modifié</span>
                                )}
                              </div>
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
              <div className="border-t border-gray-200 p-2 sm:p-3 md:p-5 bg-white">
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
                          if (e.key === "Escape" && editingMessageId) {
                            handleCancelEdit()
                          }
                        }}
                        placeholder={editingMessageId ? "Modifiez votre message..." : "Écrivez votre message..."}
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
                        <GifPicker
                          onGifSelect={(gifUrl) => {
                            setMessageInput((prev) => prev + ` ![GIF](${gifUrl})`)
                          }}
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendMessage} 
                      size="icon" 
                      className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex-shrink-0"
                      disabled={(!messageInput.trim() && !selectedFile) || isLoadingMessages || isEditingMessage}
                      title={editingMessageId ? "Enregistrer les modifications" : "Envoyer le message"}
                    >
                      {isEditingMessage ? (
                        <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                      )}
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
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar_url || "/placeholder-user.jpg"}
                        alt={user.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src !== "/placeholder-user.jpg") {
                            target.src = "/placeholder-user.jpg"
                          }
                        }}
                      />
                    </div>
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
                // Supprimer directement depuis le sidebar sans ouvrir la conversation
                const conversationId = conversationContextMenu.conversationId
                handleCloseConversationContextMenu()
                
                // Confirmer la suppression
                if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action ne peut pas être annulée.\n\nLa conversation sera supprimée uniquement pour vous, votre interlocuteur pourra toujours la voir.')) {
                  deleteConversation(conversationId).catch(err => {
                    console.error('Erreur lors de la suppression:', err)
                    alert('Erreur lors de la suppression de la conversation')
                  })
                }
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
