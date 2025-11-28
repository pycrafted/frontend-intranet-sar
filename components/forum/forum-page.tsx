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
        marginLeft: isSidebarCollapsed ? '64px' : '320px'
      }
    : {
        marginLeft: '0px'
      }
  
  return (
    <div 
      className="min-h-full w-full flex items-start justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-8 transition-all duration-300"
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
  message: string
  author: string
  authorAvatar: string
  replies: number
  views: number
  lastActivity: string
  forumId: string | number | null
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
  const allConversations: Conversation[] = useMemo(() => {
    console.log('📦📦📦 [FORUM_PAGE] ===== NORMALISATION allConversations =====')
    console.log('📦 [FORUM_PAGE] apiConversations.length:', apiConversations.length)
    console.log('📦 [FORUM_PAGE] apiConversations reçues:')
    apiConversations.forEach((c, idx) => {
      console.log(`📦 [FORUM_PAGE]   ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
    })
    
    const normalized = apiConversations.map(c => {
      let forumId: number | string | null = null
      if (c.forumId !== undefined && c.forumId !== null) {
        forumId = c.forumId
      } else if (typeof c.forum === 'object' && c.forum?.id !== undefined) {
        forumId = c.forum.id
      } else if (typeof c.forum === 'number' || typeof c.forum === 'string') {
        forumId = c.forum
      }
      
      return {
        id: c.id,
        message: c.message || (c as any).content || (c as any).description || 'Nouvelle conversation',
        author: c.author?.full_name || c.author?.username || 'Utilisateur',
        authorAvatar: c.author_avatar || c.authorAvatar || c.author?.avatar_url || '/photo_profil.png',
        replies: c.replies || c.replies_count || 0,
        views: c.views || 0,
        lastActivity: c.lastActivity || c.last_activity || 'À l\'instant',
        forumId: forumId !== null && forumId !== undefined ? Number(forumId) : 0,
        content: (c as any).content,
        forum: c.forum,
      }
    })
    
    console.log('📦 [FORUM_PAGE] allConversations normalisées:', normalized.length)
    normalized.forEach((c, idx) => {
      console.log(`📦 [FORUM_PAGE]   ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
    })
    console.log('📦📦📦 [FORUM_PAGE] ===== FIN NORMALISATION =====')
    return normalized
  }, [apiConversations])
  
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true) // Rétracté par défaut
  const [isCreateForumDialogOpen, setIsCreateForumDialogOpen] = useState(false)
  
  // Filtrer les conversations par forum sélectionné
  const forumConversations = useMemo(() => {
    console.log('🔍🔍🔍 [FORUM_PAGE] ===== FILTRAGE forumConversations =====')
    console.log('🔍 [FORUM_PAGE] selectedForum:', selectedForum ? { id: selectedForum.id, name: selectedForum.name } : 'null')
    console.log('🔍 [FORUM_PAGE] allConversations.length:', allConversations.length)
    
    if (!selectedForum) {
      console.log('🔍 [FORUM_PAGE] Aucun forum sélectionné, retour []')
      console.log('🔍🔍🔍 [FORUM_PAGE] ===== FIN FILTRAGE =====')
      return []
    }
    
    const selectedForumId = typeof selectedForum.id === 'string' ? parseInt(selectedForum.id) : Number(selectedForum.id)
    console.log('🔍 [FORUM_PAGE] selectedForumId (normalisé):', selectedForumId, typeof selectedForumId)
    
    const filtered = allConversations.filter(c => {
      const cForumId = c.forumId !== undefined && c.forumId !== null 
        ? (typeof c.forumId === 'string' ? parseInt(c.forumId) : Number(c.forumId))
        : null
      
      const matches = cForumId !== null && selectedForumId !== null && Number(cForumId) === Number(selectedForumId)
      
      console.log(`🔍 [FORUM_PAGE]   Conv ID=${c.id}: cForumId=${cForumId}, selectedForumId=${selectedForumId}, matches=${matches}`)
      
      return matches
    })
    
    console.log('🔍 [FORUM_PAGE] forumConversations filtrées:', filtered.length)
    filtered.forEach((c, idx) => {
      console.log(`🔍 [FORUM_PAGE]   ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
    })
    console.log('🔍🔍🔍 [FORUM_PAGE] ===== FIN FILTRAGE =====')
    return filtered
  }, [allConversations, selectedForum])
  
  // Charger les forums au montage
  useEffect(() => {
    fetchForums()
  }, [fetchForums])
  
  // Sélectionner le premier forum par défaut quand les forums sont chargés
  useEffect(() => {
    if (forums.length > 0 && !selectedForum) {
      setSelectedForum(forums[0])
    }
  }, [forums.length, selectedForum])
  
  // Charger les conversations du forum sélectionné
  useEffect(() => {
    if (selectedForum) {
      const forumId = typeof selectedForum.id === 'string' ? parseInt(selectedForum.id) : selectedForum.id
      fetchConversations(forumId)
    }
  }, [selectedForum, fetchConversations])
  
  // Ne plus sélectionner automatiquement la première conversation
  // L'utilisateur doit cliquer sur une conversation pour la voir
  
  // Gérer la sélection d'un forum
  const handleSelectForum = (forum: Forum) => {
    setSelectedForum(forum)
    setSelectedConversation(null)
  }
  
  // Gérer la sélection d'une conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
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
    setSelectedConversation(null)
  }
  
  // Gérer la création d'un nouveau forum
  const handleCreateForum = () => {
    setIsCreateForumDialogOpen(true)
  }
  
  // Callback après création de forum réussie
  const handleForumCreated = () => {
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

      {/* Contenu principal - centré comme la page actualités */}
      {/* Le sidebar secondaire est fixe (w-16 = 64px rétracté, w-80 = 320px développé) */}
      {/* Le contenu est centré avec max-w-4xl comme la page actualités */}
        <ContentArea isSidebarCollapsed={isSidebarCollapsed}>
          <div className="w-full max-w-4xl mx-auto">
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
                    isLoading={isLoadingConversations}
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

