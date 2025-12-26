"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { VideoPlayer } from "@/components/security/video-player"
import { QuizModal } from "@/components/security/quiz-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSecurity, SecurityDocument } from "@/hooks/useSecurity"
import * as LucideIcons from "lucide-react"
import { Loader2, X, Video, FileText, Image as ImageIcon, Play, Calendar, ExternalLink } from "lucide-react"
import { StandardLoader } from "@/components/ui/standard-loader"
import { cn } from "@/lib/utils"

const videos = [
  {
    id: 1,
    title: "Vidéo Institutionnelle SAR",
    url: "https://customer-7vjhdwttxhzqh687.cloudflarestream.com/9f3bb8e2feb1fccc6ef636cb632a196d/watch",
    description: "Découvrez l'histoire, les valeurs et la mission de la Société Africaine de Raffinage",
  },
  {
    id: 2,
    title: "Formation Sécurité",
    url: "https://customer-7vjhdwttxhzqh687.cloudflarestream.com/ae5c76fc1c8aee7a4dd1d723bc5af8a1/watch",
    description: "Formation complète sur les équipements de protection et les procédures de sécurité",
  },
  {
    id: 3,
    title: "Simulations",
    url: "https://customer-7vjhdwttxhzqh687.cloudflarestream.com/7a1013c538628239bbd5cf22c58738bf/watch",
    description: "Vidéo de simulations de sécurité",
  },
]

// Fonction helper pour obtenir l'icône Lucide React à partir du nom
function getIconComponent(iconName: string) {
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.FileText
  return IconComponent
}

export default function SecuritePage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<SecurityDocument | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  
  const { documents, isLoading, error } = useSecurity()

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1))
  }

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0))
  }

  const handleDocumentClick = (document: SecurityDocument) => {
    if (document.is_pdf && document.file_url) {
      // Ouvrir le PDF directement dans un nouvel onglet
      window.open(document.file_url, '_blank', 'noopener,noreferrer')
    } else if (document.is_image && document.file_url) {
      // Afficher l'image dans un modal
      setSelectedImage(document)
      setIsImageModalOpen(true)
    }
  }


  return (
    <LayoutWrapper
      secondaryNavbarProps={{}}
    >
      <div className="w-full" style={{ paddingTop: 'clamp(0.5rem, 1vw, 1.5rem)', paddingBottom: 'clamp(1rem, 2vw, 3rem)' }}>
        {/* État de chargement et d'erreur - Style actualités */}
        {(isLoading || error) && (
          <StandardLoader 
            title={isLoading ? "Chargement des ressources de sécurité..." : undefined}
            message={isLoading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
            error={error}
            showRetry={!!error}
            onRetry={() => window.location.reload()}
          />
        )}


        {/* Contenu principal - Style actualités */}
        {!isLoading && !error && (
          <div className="stagger-animation mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'clamp(1rem, 3vw, 4rem)',
            maxWidth: 'clamp(70rem, 75vw, 100rem)',
            width: '100%'
          }}>
            {/* Section Vidéos et Documents - Layout YouTube style */}
            <div className="relative w-full">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
                {/* Colonne principale : Vidéo (style YouTube) */}
                <div className="w-full lg:w-[calc(100%-22rem)] lg:max-w-none" style={{ minWidth: 0 }}>
                  {videos.length > 0 && (
                    <VideoPlayer
                      video={videos[currentVideoIndex]}
                      onPrevious={handlePreviousVideo}
                      onNext={handleNextVideo}
                      currentIndex={currentVideoIndex}
                      totalVideos={videos.length}
                      onQuizClick={() => setIsQuizOpen(true)}
                    />
                  )}
                </div>

                {/* Colonne latérale : Documents (style YouTube suggestions) */}
                {documents.length > 0 && (
                  <div className="w-full lg:w-80 lg:flex-shrink-0" style={{ minWidth: 0 }}>
                    {/* Header de la sidebar - Style actualités */}
                    <div className="mb-3 lg:mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 xs:h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
                        <h3 className="text-base xs:text-lg font-semibold text-gray-900">Documents de sécurité</h3>
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs xs:text-sm px-2 py-1">
                          {documents.length}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Liste verticale scrollable des documents */}
                    <div className="space-y-3 lg:space-y-2.5 max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
                      {documents.map((document) => {
                        const IconComponent = getIconComponent(document.icon)
                        return (
                          <Card
                            key={document.id}
                            className={cn(
                              "rounded-lg overflow-hidden group cursor-pointer w-full",
                              "bg-white border border-gray-200 hover:border-blue-400",
                              "hover:shadow-md transition-all duration-300",
                              "flex flex-row gap-3 p-2.5 lg:p-2"
                            )}
                            onClick={() => handleDocumentClick(document)}
                          >
                            {/* Icône/Miniature à gauche - Style YouTube */}
                            <div className={cn(
                              "flex-shrink-0 w-16 h-16 lg:w-14 lg:h-14 rounded-md flex items-center justify-center",
                              document.is_pdf 
                                ? "bg-red-50 border border-red-200" 
                                : document.is_image
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-gray-50 border border-gray-200"
                            )}>
                              {document.is_pdf ? (
                                <FileText className={cn(
                                  "w-6 h-6 lg:w-5 lg:h-5",
                                  "text-red-600"
                                )} />
                              ) : document.is_image ? (
                                <ImageIcon className={cn(
                                  "w-6 h-6 lg:w-5 lg:h-5",
                                  "text-blue-600"
                                )} />
                              ) : (
                                <FileText className={cn(
                                  "w-6 h-6 lg:w-5 lg:h-5",
                                  "text-gray-600"
                                )} />
                              )}
                            </div>

                            {/* Contenu à droite - Style YouTube */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              {/* Badge compact */}
                              <div className="mb-1">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 font-medium",
                                    document.is_pdf 
                                      ? "bg-red-50 text-red-700 border-red-200" 
                                      : document.is_image
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                  )}
                                >
                                  {document.is_pdf ? "PDF" : document.is_image ? "Image" : "Doc"}
                                </Badge>
                              </div>
                              
                              {/* Titre - Style YouTube compact */}
                              <h3 className="text-sm lg:text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
                                {document.title}
                              </h3>
                              
                              {/* Indicateur d'action */}
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-auto">
                                {document.is_pdf || document.is_image ? (
                                  <>
                                    <Play className="w-3 h-3 text-blue-600" />
                                    <span className="text-blue-600 font-medium">Ouvrir</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3 h-3 text-gray-600" />
                                    <span className="text-gray-600 font-medium">Voir</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Empty State - Style actualités */}
            {!isLoading && !error && documents.length === 0 && videos.length === 0 && (
              <div className="w-full">
                <Card className="text-center rounded-lg" style={{ padding: 'clamp(2rem, 5vw, 6rem)' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'clamp(0.75rem, 2vw, 1.5rem)', 
                    alignItems: 'center' 
                  }}>
                    <div className="bg-muted rounded-full flex items-center justify-center mx-auto" style={{ 
                      width: 'clamp(3rem, 8vw, 5rem)',
                      height: 'clamp(3rem, 8vw, 5rem)'
                    }}>
                      <FileText className="text-muted-foreground" style={{ 
                        width: 'clamp(1.5rem, 4vw, 2.5rem)', 
                        height: 'clamp(1.5rem, 4vw, 2.5rem)' 
                      }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.5rem)' }}>Aucune ressource de sécurité disponible</h3>
                      <p className="text-gray-500" style={{ 
                        fontSize: 'clamp(0.75rem, 1.5vw, 1rem)', 
                        marginTop: 'clamp(0.25rem, 0.8vw, 0.5rem)' 
                      }}>Les ressources seront bientôt disponibles</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <QuizModal open={isQuizOpen} onOpenChange={setIsQuizOpen} />
      
      {/* Modal pour afficher les images - Style actualités */}
      {selectedImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="w-[95vw] h-[95vh] max-w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex-shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-4">
                {selectedImage.title}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsImageModalOpen(false)}
                className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
              <img
                src={selectedImage.file_url}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </LayoutWrapper>
  )
}
