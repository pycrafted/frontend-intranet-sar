"use client"

import { useState, useEffect, useMemo } from "react"
import { ForumSidebar } from "./forum-sidebar"
import { ConversationDetail } from "./conversation-detail"
import { ConversationList } from "./conversation-list"
import { ForumHeader } from "./forum-header"
import { CreateForumDialog } from "./create-forum-dialog"
import { useForum, Forum as ForumType, Conversation as ConversationType } from "@/hooks/useForum"

// Composant pour éviter l'erreur d'hydratation avec les styles dynamiques
function ContentArea({ isSidebarCollapsed, children }: { isSidebarCollapsed: boolean; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  const style = mounted && isLargeScreen
    ? {
        width: `calc(100% - ${isSidebarCollapsed ? '64px' : '320px'})`,
        marginLeft: isSidebarCollapsed ? '64px' : '320px'
      }
    : {
        width: '100%',
        marginLeft: '0px'
      }
  
  return (
    <div 
      className="min-h-full flex items-start justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-8 transition-all duration-300"
      style={style}
    >
      {children}
    </div>
  )
}

// Interfaces pour compatibilité avec les composants existants
export interface Forum {
  id: string | number
  name: string
  description: string
  image: string
  memberCount: number
  conversationCount: number
}

export interface Conversation {
  id: string | number
  title: string
  author: string
  authorAvatar: string
  replies: number
  views: number
  lastActivity: string
  isResolved?: boolean
  forumId: string | number | null
  image: string
  description: string
  content?: string // Pour compatibilité avec l'API
  forum?: number | { id: number } // Pour compatibilité avec l'API
}

interface ForumPageProps {
  isMainSidebarCollapsed?: boolean
}

export function ForumPage({ isMainSidebarCollapsed = false }: ForumPageProps) {
  const {
    forums: apiForums,
    conversations: apiConversations,
    comments: apiComments,
    isLoadingForums,
    isLoadingConversations,
    isLoadingComments,
    fetchForums,
    fetchConversations,
    fetchComments,
  } = useForum()
  
  // Convertir les forums de l'API au format attendu par les composants
  const forums: Forum[] = apiForums.map(f => ({
    id: f.id,
    name: f.name,
    description: f.description || '',
    image: f.image_url || f.image || '/sitesar.jpg',
    memberCount: f.member_count,
    conversationCount: f.conversation_count,
  }))
  
  // Convertir les conversations de l'API au format attendu par les composants
  // Utiliser useMemo pour éviter de recalculer à chaque render
  const allConversations: Conversation[] = useMemo(() => {
    console.log('🟨 [FORUM_PAGE] ===== DÉBUT NORMALISATION allConversations =====')
    console.log('🟨 [FORUM_PAGE] apiConversations.length:', apiConversations.length)
    console.log('🟨 [FORUM_PAGE] apiConversations:', apiConversations.map(c => ({ id: c.id, title: c.title, forumId: c.forumId })))
    
    return apiConversations.map(c => {
    // Extraire le forumId de différentes façons possibles
    let forumId: number | string | null = null
    if (c.forumId !== undefined && c.forumId !== null) {
      forumId = c.forumId
    } else if (typeof c.forum === 'object' && c.forum?.id !== undefined) {
      forumId = c.forum.id
    } else if (typeof c.forum === 'number' || typeof c.forum === 'string') {
      forumId = c.forum
    }
    
    // Log pour debug
    console.log("🟨 [FORUM_PAGE] Normalisation conversation:", {
      id: c.id,
      title: c.title,
      forumId: forumId,
      forumIdFromProp: c.forumId,
      forum: c.forum,
      author_avatar: c.author_avatar,
      authorAvatar: c.authorAvatar,
      author_avatar_url: c.author?.avatar_url,
      author_full_name: c.author?.full_name,
      author_username: c.author?.username
    })
    
    const normalized: Conversation = {
      id: c.id,
      title: c.title || (c as any).content?.substring(0, 100) || 'Nouvelle conversation',
      author: c.author?.full_name || c.author?.username || 'Utilisateur',
      authorAvatar: c.author_avatar || c.authorAvatar || c.author?.avatar_url || '/photo_profil.png',
      replies: c.replies || c.replies_count || 0,
      views: c.views || 0,
      lastActivity: c.lastActivity || c.last_activity || 'À l\'instant',
      isResolved: c.isResolved !== undefined ? c.isResolved : (c.is_resolved !== undefined ? c.is_resolved : true),
      forumId: forumId || 0, // Fallback à 0 si null (ne devrait jamais arriver)
      image: c.image || c.image_url || '/sitesar.jpg',
      description: c.description || (c as any).content || '',
      content: (c as any).content, // Garder pour compatibilité
      forum: c.forum, // Garder pour compatibilité
    }
    
    console.log("🟨 [FORUM_PAGE] Conversation normalisée:", {
      id: normalized.id,
      title: normalized.title,
      forumId: normalized.forumId
    })
    
      return normalized
    })
  }, [apiConversations])
  
  // Log après normalisation
  useEffect(() => {
    console.log('🟨 [FORUM_PAGE] allConversations normalisées:', allConversations.length)
    allConversations.forEach((c, idx) => {
      console.log(`🟨 [FORUM_PAGE]   allConversation ${idx + 1}: ID=${c.id}, title="${c.title}", forumId=${c.forumId}`)
    })
    console.log('🟨 [FORUM_PAGE] ===== FIN NORMALISATION allConversations =====')
  }, [allConversations])
  
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true) // Rétracté par défaut
  const [isCreateForumDialogOpen, setIsCreateForumDialogOpen] = useState(false)
  
  // Filtrer les conversations par forum sélectionné - Utiliser useMemo pour optimiser
  const forumConversations = useMemo(() => {
    if (!selectedForum) return []
    
    return allConversations.filter(c => {
        // Extraire le forumId de la conversation (déjà normalisé dans allConversations)
        const cForumId = c.forumId !== undefined && c.forumId !== null 
          ? (typeof c.forumId === 'string' ? parseInt(c.forumId) : Number(c.forumId))
          : null
        
        // Extraire le forumId du forum sélectionné
        const selectedForumId = selectedForum.id !== undefined && selectedForum.id !== null
          ? (typeof selectedForum.id === 'string' ? parseInt(selectedForum.id) : Number(selectedForum.id))
          : null
        
        // Comparer les IDs (en s'assurant qu'ils sont tous des nombres)
        const matches = cForumId !== null && selectedForumId !== null && Number(cForumId) === Number(selectedForumId)
        
        console.log("🟡 [FORUM_PAGE] Filtrage conversation:", {
          conversationId: c.id,
          conversationTitle: c.title,
          cForumId,
          selectedForumId,
          matches,
          cForumIdType: typeof cForumId,
          selectedForumIdType: typeof selectedForumId
        })
        
        return matches
      })
  }, [allConversations, selectedForum])
  
  // Log pour debug
  useEffect(() => {
    console.log("🟡 [FORUM_PAGE] ===== ÉTAT DES CONVERSATIONS =====")
    console.log("🟡 [FORUM_PAGE] selectedForum:", selectedForum?.id, selectedForum?.name)
    console.log("🟡 [FORUM_PAGE] allConversations:", allConversations.length)
    allConversations.forEach((c, idx) => {
      console.log(`🟡 [FORUM_PAGE]   Conversation ${idx + 1}:`, {
        id: c.id,
        title: c.title,
        forumId: c.forumId,
        forum: c.forum,
        forumIdType: typeof c.forumId,
        forumType: typeof c.forum
      })
    })
    console.log("🟡 [FORUM_PAGE] forumConversations (filtrées):", forumConversations.length)
    forumConversations.forEach((c, idx) => {
      console.log(`🟡 [FORUM_PAGE]   Conversation filtrée ${idx + 1}:`, c.id, c.title)
    })
    console.log("🟡 [FORUM_PAGE] ====================================")
  }, [selectedForum, allConversations, forumConversations])
  
  // Charger les forums au montage
  useEffect(() => {
    console.log("🟡 [FORUM_PAGE] useEffect - Chargement des forums")
    console.log("🟡 [FORUM_PAGE] Appel fetchForums()...")
    fetchForums()
    // Ne pas charger toutes les conversations ici, attendre qu'un forum soit sélectionné
  }, [fetchForums])
  
  // Sélectionner le premier forum par défaut quand les forums sont chargés
  useEffect(() => {
    if (forums.length > 0 && !selectedForum) {
      console.log("🟡 [FORUM_PAGE] Sélection automatique du premier forum:", forums[0])
      setSelectedForum(forums[0])
    }
  }, [forums.length, selectedForum])
  
  // Charger les conversations du forum sélectionné
  useEffect(() => {
    if (selectedForum) {
      const forumId = typeof selectedForum.id === 'string' ? parseInt(selectedForum.id) : selectedForum.id
      console.log("🟡 [FORUM_PAGE] Chargement des conversations pour le forum:", forumId)
      fetchConversations(forumId)
    }
  }, [selectedForum, fetchConversations])
  
  // Log des forums reçus
  useEffect(() => {
    console.log("🟡 [FORUM_PAGE] Forums mis à jour:", forums.length)
    if (forums.length > 0) {
      console.log("🟡 [FORUM_PAGE] Détails des forums dans le composant:")
      forums.forEach((forum, idx) => {
        console.log(`🟡 [FORUM_PAGE]   Forum ${idx + 1}: ID=${forum.id}, name="${forum.name}", memberCount=${forum.memberCount}, conversationCount=${forum.conversationCount}`)
      })
    } else {
      console.warn("🟡 [FORUM_PAGE] ⚠️ AUCUN FORUM DANS LE COMPOSANT!")
    }
  }, [forums])
  
  // Ne plus sélectionner automatiquement la première conversation
  // L'utilisateur doit cliquer sur une conversation pour la voir
  
  // Gérer la sélection d'un forum
  const handleSelectForum = (forum: Forum) => {
    console.log("🟡 [FORUM_PAGE] Forum sélectionné:", forum.id, forum.name)
    setSelectedForum(forum)
    setSelectedConversation(null) // Réinitialiser la conversation sélectionnée
  }
  
  // Gérer la sélection d'une conversation
  const handleSelectConversation = (conversation: Conversation) => {
    console.log("🟡 [FORUM_PAGE] Conversation sélectionnée:", conversation.id, conversation.title)
    setSelectedConversation(conversation)
    // Charger les commentaires de cette conversation
    const conversationId = typeof conversation.id === 'string' ? parseInt(conversation.id) : conversation.id
    if (conversationId) {
      fetchComments(conversationId)
    }
  }
  
  // Récupérer les commentaires de la conversation sélectionnée
  const selectedConversationId = selectedConversation 
    ? (typeof selectedConversation.id === 'string' ? parseInt(selectedConversation.id) : selectedConversation.id)
    : null
  const conversationComments = selectedConversationId && apiComments[selectedConversationId]
    ? apiComments[selectedConversationId].map(c => ({
        id: c.id,
        author: c.author?.full_name || c.author?.username || 'Utilisateur',
        authorAvatar: c.authorAvatar || c.author?.avatar_url || '/photo_profil.png',
        content: c.content,
        timestamp: c.timestamp || c.created_at,
        likes: c.likes || c.likes_count || 0,
      }))
    : []
  
  // Gérer le retour depuis une conversation
  const handleBackFromConversation = () => {
    console.log("🟡 [FORUM_PAGE] Retour depuis la conversation")
    setSelectedConversation(null)
  }
  
  // Gérer la création d'un nouveau forum
  const handleCreateForum = () => {
    setIsCreateForumDialogOpen(true)
  }
  
  // Callback après création de forum réussie
  const handleForumCreated = () => {
    // Recharger la liste des forums
    fetchForums()
  }
  
  // Plus besoin de handleCreateConversation et handleConversationCreated
  // La création se fait maintenant directement dans ConversationList

  return (
    <>
      {/* Sidebar secondaire collé au sidebar principal */}
      <div className="hidden lg:block">
        <ForumSidebar
          forums={forums}
          conversations={forumConversations}
          comments={conversationComments}
          selectedForumId={selectedForum?.id?.toString() || null}
          selectedConversationId={selectedConversation?.id?.toString() || null}
          onSelectForum={handleSelectForum}
          onSelectConversation={handleSelectConversation}
          onCreateForum={handleCreateForum}
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
          isMainSidebarCollapsed={isMainSidebarCollapsed}
          isLoading={isLoadingForums || isLoadingConversations}
          isLoadingComments={isLoadingComments}
        />
      </div>

      {/* Contenu principal - centré dynamiquement dans l'espace disponible après les deux sidebars */}
      {/* Le sidebar secondaire est fixe (w-16 = 64px rétracté, w-80 = 320px développé) */}
      {/* On centre le contenu dans l'espace restant en utilisant calc() pour la largeur */}
        <ContentArea isSidebarCollapsed={isSidebarCollapsed}>
          <div className="w-full max-w-5xl mx-auto">
            {selectedConversation ? (
              <ConversationDetail conversation={selectedConversation} onBack={handleBackFromConversation} />
            ) : selectedForum ? (
              <div className="space-y-6">
                <ForumHeader forum={selectedForum} />
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">Chargement des conversations...</p>
                  </div>
                ) : (
                  <ConversationList 
                    conversations={forumConversations} 
                    onSelectConversation={handleSelectConversation}
                    forumId={selectedForum ? (typeof selectedForum.id === 'string' ? parseInt(selectedForum.id) : selectedForum.id) : null}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  {isLoadingForums ? 'Chargement des forums...' : 'Sélectionnez un forum'}
                </p>
              </div>
            )}
          </div>
        </ContentArea>
        
        {/* Dialogue de création de forum */}
        <CreateForumDialog
          open={isCreateForumDialogOpen}
          onOpenChange={setIsCreateForumDialogOpen}
          onSuccess={handleForumCreated}
        />
    </>
  )
}

