"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { VideoPlayer } from "@/components/security/video-player"
import { QuizModal } from "@/components/security/quiz-modal"
import { SecurityMarquee } from "@/components/security/security-marquee"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Shield, BookOpen, FileCheck } from "lucide-react"

const videos = [
  {
    id: 1,
    title: "Vidéo Institutionnelle SAR",
    url: "https://customer-eas3f2kom74sgnh6.cloudflarestream.com/3f0c7ea611f5f970f280df7cf5c8587b/watch",
    description: "Découvrez l'histoire, les valeurs et la mission de la Société Africaine de Raffinage",
  },
  {
    id: 2,
    title: "Formation Sécurité",
    url: "https://customer-eas3f2kom74sgnh6.cloudflarestream.com/8acc2118f34340bfcfa5a667d3a0d95c/watch",
    description: "Formation complète sur les équipements de protection et les procédures de sécurité",
  },
]

export default function SecuritePage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1))
  }

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0))
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
              hasPdfs={false} // Sera mis à true quand les PDF seront ajoutés
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

          {/* Cartes de documents PDF - 4 cartes alignées */}
          <div className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5">
              {/* Carte 1: Règlement Intérieur */}
              <Card className="bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-slate-200">
                <CardContent className="p-4 xs:p-5 sm:p-6 flex flex-col items-center text-center">
                  <div className="mb-3 xs:mb-4 p-3 xs:p-4 rounded-lg bg-slate-100">
                    <FileText className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10" style={{color: "rgb(52, 66, 87)"}} />
                  </div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-slate-800 mb-2">
                    Règlement Intérieur
                  </h3>
                  <p className="text-xs xs:text-sm text-slate-600 leading-relaxed">
                    Consultez le règlement intérieur de la SAR pour connaître les règles et procédures en vigueur
                  </p>
                </CardContent>
              </Card>

              {/* Carte 2: Guide de Sécurité */}
              <Card className="bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-slate-200">
                <CardContent className="p-4 xs:p-5 sm:p-6 flex flex-col items-center text-center">
                  <div className="mb-3 xs:mb-4 p-3 xs:p-4 rounded-lg bg-slate-100">
                    <Shield className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10" style={{color: "rgb(52, 66, 87)"}} />
                  </div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-slate-800 mb-2">
                    Guide de Sécurité
                  </h3>
                  <p className="text-xs xs:text-sm text-slate-600 leading-relaxed">
                    Découvrez les mesures de sécurité essentielles et les bonnes pratiques à adopter sur le site
                  </p>
                </CardContent>
              </Card>

              {/* Carte 3: Manuel des Procédures */}
              <Card className="bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-slate-200">
                <CardContent className="p-4 xs:p-5 sm:p-6 flex flex-col items-center text-center">
                  <div className="mb-3 xs:mb-4 p-3 xs:p-4 rounded-lg bg-slate-100">
                    <BookOpen className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10" style={{color: "rgb(52, 66, 87)"}} />
                  </div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-slate-800 mb-2">
                    Manuel des Procédures
                  </h3>
                  <p className="text-xs xs:text-sm text-slate-600 leading-relaxed">
                    Accédez au manuel complet des procédures opérationnelles et de sécurité de la SAR
                  </p>
                </CardContent>
              </Card>

              {/* Carte 4: Checklist Sécurité */}
              <Card className="bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-slate-200">
                <CardContent className="p-4 xs:p-5 sm:p-6 flex flex-col items-center text-center">
                  <div className="mb-3 xs:mb-4 p-3 xs:p-4 rounded-lg bg-slate-100">
                    <FileCheck className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10" style={{color: "rgb(52, 66, 87)"}} />
                  </div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-slate-800 mb-2">
                    Checklist Sécurité
                  </h3>
                  <p className="text-xs xs:text-sm text-slate-600 leading-relaxed">
                    Utilisez cette checklist pour vérifier votre conformité aux normes de sécurité en vigueur
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <QuizModal open={isQuizOpen} onOpenChange={setIsQuizOpen} />
      </div>
    </LayoutWrapper>
  )
}






