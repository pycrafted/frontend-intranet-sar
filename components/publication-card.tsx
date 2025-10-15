  "use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MoreHorizontal, 
  Calendar, 
  BarChart3, 
  CheckSquare, 
  Image as ImageIcon, 
  Video, 
  Play,
  ChevronDown,
  ChevronUp,
  Flag
} from "lucide-react"
import { Article } from "@/lib/api"
import { cn } from "@/lib/utils"
import { MediaContent } from "./media-content"

interface PublicationCardProps {
  article: Article
}

export function PublicationCard({ 
  article
}: PublicationCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="w-4 h-4" />
      case "announcement":
        return <Flag className="w-4 h-4" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event":
        return "bg-green-100 text-green-700 border-green-200"
      case "announcement":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default:
        return "bg-blue-100 text-blue-700 border-blue-200"
    }
  }

  const renderMediaContent = () => {
    // Log de débogage pour l'article
    console.log('📰 [PUBLICATION_CARD] Article data:', {
      id: article.id,
      title: article.title,
      image: article.image,
      image_url: article.image_url,
      type: (article as any).type,
      hasImage: !!(article.image_url || article.image)
    });

    // Déterminer le type de média basé sur les données disponibles
    let mediaType: 'image' | 'video' | 'checklist' = 'image'
    let mediaProps: any = {}

    if ((article as any).type === "checklist" && (article as any).checklist_items) {
      mediaType = 'checklist'
      mediaProps = { checklistItems: (article as any).checklist_items }
    } else if ((article as any).type === "video" && (article as any).video_url) {
      mediaType = 'video'
      mediaProps = { 
        videoUrl: (article as any).video_url, 
        videoPoster: article.image_url || article.image 
      }
    } else if (article.image_url || article.image) {
      mediaType = 'image'
      const imageUrl = article.image_url || article.image;
      mediaProps = { images: [imageUrl] }
      
      console.log('🖼️ [PUBLICATION_CARD] Image URL générée:', {
        article_id: article.id,
        article_title: article.title,
        image: article.image,
        image_url: article.image_url,
        final_url: imageUrl,
        mediaType
      });
    } else {
      console.log('❌ [PUBLICATION_CARD] Aucun média trouvé pour l\'article:', article.id);
      return null
    }

    return (
      <MediaContent
        type={mediaType}
        {...mediaProps}
        className="mb-6"
      />
    )
  }


  return (
    <Card className="publication-card bg-white shadow-sm border border-gray-200 hover:shadow-lg rounded-xl overflow-hidden group fade-in">
      <CardContent className="p-0">
        {/* PARTIE HAUTE - Informations textuelles et métadonnées */}
        <div className="p-6 pb-6">
          {/* Header avec date et actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{new Date(article.date).toLocaleDateString("fr-FR")}</span>
              <span>•</span>
              <span>{article.time}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Type et catégorie */}
          <div className="flex items-center gap-2 mb-4">
            <Badge className={cn("text-xs px-3 py-1", getTypeColor(article.type))}>
              {getTypeIcon(article.type)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {article.type === "event" ? "Événement" : 
               article.type === "announcement" ? "Annonce" : "Publication"}
            </Badge>
          </div>

          {/* Titre et contenu */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h2>
            
            <div className="text-gray-700 leading-relaxed">
              {(
                <div>
                  <p className={cn(
                    "text-gray-700 leading-relaxed",
                    !showFullContent && article.content.length > 200 ? "line-clamp-3" : ""
                  )}>
                    {article.content}
                  </p>
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
            </div>
          </div>
        </div>

        {/* TRAIT DE SÉPARATION */}
        <div className="mx-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="flex items-center justify-center -mt-1">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* PARTIE BASSE - Médias et contenu interactif */}
        <div className="px-6 py-8">
          {/* Contenu média ou interactif */}
          <div className="mb-0">
            {renderMediaContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
