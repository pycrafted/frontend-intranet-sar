"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { VideoPlayer } from "@/components/security/video-player"
import { QuizModal } from "@/components/security/quiz-modal"
import { SecurityMarquee } from "@/components/security/security-marquee"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useSecurity, SecurityDocument } from "@/hooks/useSecurity"
import * as LucideIcons from "lucide-react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  
  const { documents, isLoading } = useSecurity()

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1))
  }

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0))
  }

  const handleDocumentClick = (document: SecurityDocument) => {
    if (document.is_pdf && document.file_url) {
      // Ouvrir le PDF directement dans un nouvel onglet, comme dans la page documents
      window.open(document.file_url, '_blank', 'noopener,noreferrer')
    } else if (document.is_image && document.file_url) {
      // Afficher l'image dans un modal
      setSelectedImage(document)
      setIsImageModalOpen(true)
    }
  }
  return (
    <LayoutWrapper>
      <div className="min-h-screen" style={{backgroundColor: "#e4e6eb"}}>
        {/* Contenu principal - Style actualités : exploite toute la largeur en mobile */}
        <div className="w-full px-1 xs:px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-3 xs:py-4 sm:py-5 md:py-6 lg:py-8 xl:py-10">
          {/* Bande défilante (Marquee) - Au-dessus de la vidéo */}
          <div className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto mb-3 xs:mb-4 sm:mb-5 md:mb-6">
            <SecurityMarquee
              videos={videos}
              hasQuiz={true}
              hasPdfs={documents.length > 0}
              speed={30}
              direction="left"
          />
        </div>

          {/* Vidéo - Prend toute la largeur en mobile (comme les cartes actualités), centrée avec max-width sur desktop */}
          <div className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700 mb-4 xs:mb-5 sm:mb-6">
            <VideoPlayer
              video={videos[currentVideoIndex]}
              onPrevious={handlePreviousVideo}
              onNext={handleNextVideo}
              currentIndex={currentVideoIndex}
              totalVideos={videos.length}
              onQuizClick={() => setIsQuizOpen(true)}
            />
          </div>

          {/* Cartes de documents PDF - Affichage dynamique */}
          {documents.length > 0 && (
            <div className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5">
                {documents.map((document) => {
                  const IconComponent = getIconComponent(document.icon)
                  return (
                    <Card
                      key={document.id}
                      className="bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-slate-200"
                      onClick={() => handleDocumentClick(document)}
                    >
                      <CardContent className="p-4 xs:p-5 sm:p-6 flex flex-col items-center text-center">
                        <div className="mb-3 xs:mb-4 p-3 xs:p-4 rounded-lg bg-slate-100">
                          <IconComponent className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10" style={{color: "rgb(52, 66, 87)"}} />
                        </div>
                        <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-slate-800 mb-2">
                          {document.title}
                        </h3>
                        <p className="text-xs xs:text-sm text-slate-600 leading-relaxed">
                          {document.description || "Document de sécurité"}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && documents.length === 0 && (
            <div className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}
        </div>

        <QuizModal open={isQuizOpen} onOpenChange={setIsQuizOpen} />
        
        {/* Modal pour afficher les images */}
        {selectedImage && (
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogContent className="w-[95vw] h-[95vh] max-w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex-shrink-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 truncate pr-4">
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
      </div>
    </LayoutWrapper>
  )
}






