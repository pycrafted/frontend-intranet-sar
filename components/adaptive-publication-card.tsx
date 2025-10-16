"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Calendar,
  BarChart3,
  CheckSquare,
  Video,
  Play,
  ChevronDown,
  ChevronUp,
  Flag,
  Images,
  AlertTriangle,
  Newspaper,
  Megaphone,
  Trash2,
  Edit
} from "lucide-react"
import { Article, api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { EditArticleModal } from "./edit-article-modal"
import { VisibleDropdownMenu } from "./visible-dropdown-menu"
import { HighlightText } from "./ui/highlight-text"

interface AdaptivePublicationCardProps {
  article: Article
  onDelete?: (articleId: number) => void
  onUpdate?: (updatedArticle: Article) => void
  searchTerm?: string
  isPublic?: boolean // Nouveau prop pour indiquer si c'est une page publique
}

export function AdaptivePublicationCard({ article, onDelete, onUpdate, searchTerm, isPublic = false }: AdaptivePublicationCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.deleteArticle(article.id)
      
      // Notifier le parent pour mettre à jour la liste
      if (onDelete) {
        onDelete(article.id)
      }
      
      setShowDeleteModal(false)
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error)
      // TODO: Afficher une notification d'erreur à l'utilisateur
      alert('Erreur lors de la suppression de l\'article. Veuillez réessayer.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = (updatedArticle: Article) => {
    if (onUpdate) {
      onUpdate(updatedArticle)
    }
    setShowEditModal(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="w-4 h-4" />
      case "announcement":
        return <AlertTriangle className="w-4 h-4" />
      case "news":
        return <Newspaper className="w-4 h-4" />
      default:
        return <Newspaper className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event":
        return "bg-green-100 text-green-700 border-green-200"
      case "announcement":
        return "bg-red-100 text-red-700 border-red-300"
      case "news":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-blue-100 text-blue-700 border-blue-200"
    }
  }

  const renderContent = () => {
    // Détection automatique du type de contenu si content_type n'est pas défini
    let contentType = article.content_type
    
    if (!contentType || contentType === 'text_only') {
      if (article.video_url || article.video) {
        contentType = 'video'
      } else if (article.image_url || article.image) {
        contentType = article.content ? 'text_image' : 'image_only'
      } else if (article.type === 'event') {
        contentType = 'event'
      }
    }
    

    switch (contentType) {
      case 'text_only':
        return <TextOnlyContent article={article} searchTerm={searchTerm} />
      case 'image_only':
        return <ImageOnlyContent article={article} searchTerm={searchTerm} />
      case 'text_image':
        return <TextImageContent article={article} searchTerm={searchTerm} />
      case 'video':
        return <VideoContent article={article} searchTerm={searchTerm} />
      case 'event':
        return <EventContent article={article} searchTerm={searchTerm} />
      default:
        return <TextOnlyContent article={article} searchTerm={searchTerm} />
    }
  }

  return (
    <Card className={cn(
      "adaptive-publication-card rounded-xl overflow-hidden group fade-in w-full",
      article.type === "announcement" 
        ? "announcement-card" 
        : "news-card"
    )}>
      <CardContent className="p-0 w-full">
        {/* Header commun */}
        <div className="px-6 pt-3 pb-1">
          {/* Date de publication en haut à gauche */}
          <div className="flex items-center justify-between mb-3">
            <div className="publication-date">
              <Calendar className="w-4 h-4" />
              <span className="date-text">
                {new Date(article.date).toLocaleDateString("fr-FR", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="separator">•</span>
              <span className="time-text">
                {new Date(`2000-01-01T${article.time}`).toLocaleTimeString("fr-FR", {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            {/* Actions en haut à droite - seulement si authentifié */}
            {!isPublic && (
              <div className="flex items-center gap-1 relative">
                <VisibleDropdownMenu
                  onEdit={() => {
                    setShowEditModal(true)
                  }}
                  onDelete={() => {
                    setShowDeleteModal(true)
                  }}
                />
              </div>
            )}
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {article.type === "event" ? "Événement" :
               article.type === "announcement" ? "Annonce" : 
               article.type === "news" ? "Actualité" : "Publication"}
            </Badge>
            {article.type === "announcement" && (
              <Badge className="important-badge">
                <AlertTriangle className="w-3 h-3 mr-1" />
                IMPORTANT
              </Badge>
            )}
          </div>
        </div>

        {/* Contenu adaptatif */}
        {renderContent()}
      </CardContent>
      
      {/* Modals - seulement si pas en mode public */}
      {!isPublic && (
        <>
          {/* Modal de confirmation de suppression */}
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            article={article}
            isDeleting={isDeleting}
          />
          
          {/* Modal de modification d'article */}
          <EditArticleModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            article={article}
            onUpdate={handleUpdate}
          />
        </>
      )}
    </Card>
  )
}

// Composant pour le contenu texte seul
function TextOnlyContent({ article, searchTerm }: { article: Article; searchTerm?: string }) {
  const [showFullContent, setShowFullContent] = useState(false)

  return (
    <div className="px-6 pb-6 w-full">
      {article.title && (
        <h2 className="article-title mb-3 w-full block">
          <HighlightText 
            text={article.title} 
            searchTerm={searchTerm || ""} 
          />
        </h2>
      )}
      
      <div className="text-gray-700 leading-relaxed">
        <div className={cn(
          "publication-content",
          !showFullContent && article.content && article.content.length > 200 ? "line-clamp-3" : ""
        )}>
          <HighlightText 
            text={article.content} 
            searchTerm={searchTerm || ""} 
          />
        </div>
        {article.content && article.content.length > 200 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullContent(!showFullContent)}
            className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
          >
            {showFullContent ? (
              <>
                Voir moins <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Voir plus <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// Composant pour le contenu image seule
function ImageOnlyContent({ article, searchTerm }: { article: Article; searchTerm?: string }) {
  return (
    <div className="px-6 pb-6 w-full">
      {article.title && (
        <h2 className="article-title mb-4 w-full block">
          <HighlightText 
            text={article.title} 
            searchTerm={searchTerm || ""} 
          />
        </h2>
      )}
      
      <div className="relative group">
        <img
          src={article.image_url || article.image}
          alt={article.title || "Image"}
          className="publication-image"
          onLoad={() => {
            // Image chargée avec succès
          }}
          onError={(e) => {
            console.error('❌ Erreur de chargement de l\'image (ImageOnly):', {
              image_url: article.image_url,
              image: article.image,
              src: e.currentTarget.src,
              article_id: article.id,
              article_title: article.title
            });
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  )
}

// Composant pour le contenu texte + image
function TextImageContent({ article, searchTerm }: { article: Article; searchTerm?: string }) {
  const [showFullContent, setShowFullContent] = useState(false)

  return (
    <div className="px-6 pb-6 w-full">
      {article.title && (
        <h2 className="article-title mb-3 w-full block">
          <HighlightText 
            text={article.title} 
            searchTerm={searchTerm || ""} 
          />
        </h2>
      )}
      
      {article.content && (
        <div className="text-gray-700 leading-relaxed mb-4">
          <div className={cn(
            "publication-content",
            !showFullContent && article.content.length > 200 ? "line-clamp-3" : ""
          )}>
            {article.content}
          </div>
          {article.content.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
            >
              {showFullContent ? (
                <>
                  Voir moins <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Voir plus <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
      
      <div className="relative group">
        <img
          src={article.image_url || article.image}
          alt={article.title || "Image"}
          className="publication-image-text"
          onLoad={() => {
            // Image chargée avec succès
          }}
          onError={(e) => {
            console.error('❌ Erreur de chargement de l\'image (TextImage):', {
              image_url: article.image_url,
              image: article.image,
              src: e.currentTarget.src,
              article_id: article.id,
              article_title: article.title
            });
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  )
}


// Composant pour le contenu vidéo
function VideoContent({ article, searchTerm }: { article: Article; searchTerm?: string }) {
  const [showFullContent, setShowFullContent] = useState(false)

  return (
    <div className="px-6 pb-6 w-full">
      <h2 className="article-title mb-3 w-full block">
        <HighlightText 
          text={article.title} 
          searchTerm={searchTerm || ""} 
        />
      </h2>
      
      {article.content && (
        <div className="text-gray-700 leading-relaxed mb-4">
         <div className={cn(
           "publication-content",
           !showFullContent && article.content.length > 200 ? "line-clamp-3" : ""
         )}>
           <HighlightText 
             text={article.content} 
             searchTerm={searchTerm || ""} 
           />
         </div>
          {article.content.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
            >
              {showFullContent ? (
                <>
                  Voir moins <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Voir plus <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
      
      {/* Vidéo responsive avec ratio d'aspect préservé */}
      <div className="relative group">
        {/* Vidéo avec contrôles */}
        {article.video_url || article.video ? (
          <div className="publication-video-container">
            <video
              src={article.video_url || article.video}
              className="publication-video"
              poster={article.video_poster_url || article.video_poster}
              controls
              preload="metadata"
              onError={(e) => {
                // Gestion silencieuse des erreurs vidéo
              }}
              onLoadStart={() => {
                // Début de chargement vidéo
              }}
              onLoadedMetadata={(e) => {
                // Ajuster la hauteur en fonction du ratio d'aspect de la vidéo
                const video = e.target as HTMLVideoElement;
                const aspectRatio = video.videoWidth / video.videoHeight;
                const maxWidth = video.parentElement?.offsetWidth || 800;
                const calculatedHeight = Math.min(maxWidth / aspectRatio, 600);
                video.style.height = `${calculatedHeight}px`;
              }}
            />
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center shadow-lg">
            <div className="text-center">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune vidéo disponible</p>
              <p className="text-gray-400 text-sm mt-2">
                {article.title.includes('Test Vidéo') ? 'Article de test - pas de fichier vidéo uploadé' : 'Vidéo non trouvée'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


// Composant pour le contenu événement
function EventContent({ article, searchTerm }: { article: Article; searchTerm?: string }) {
  const [showFullContent, setShowFullContent] = useState(false)

  return (
    <div className="px-6 pb-6 w-full">
      <h2 className="article-title mb-3 w-full block">
        {article.title}
      </h2>
      
      <div className="text-gray-700 leading-relaxed mb-4">
         <div className={cn(
           "publication-content",
           !showFullContent && article.content.length > 200 ? "line-clamp-3" : ""
         )}>
           {article.content}
         </div>
        {article.content.length > 200 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullContent(!showFullContent)}
            className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
          >
            {showFullContent ? (
              <>
                Voir moins <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Voir plus <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Informations de l'événement */}
      <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <span>Détails de l'événement</span>
        </div>
        
        {article.event_date && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">
              Date: {new Date(article.event_date).toLocaleDateString("fr-FR")}
            </span>
          </div>
        )}
        
        {article.end_date && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">
              Fin des inscriptions: {new Date(article.end_date).toLocaleDateString("fr-FR")}
            </span>
          </div>
        )}
      </div>
      
      {/* Image de l'événement si disponible */}
      {(article.image_url || article.image) && (
        <div className="mt-4 relative group">
          <img
            src={article.image_url || article.image}
            alt={article.title || "Image"}
            className="publication-image-text"
          />
        </div>
      )}
    </div>
  )
}
