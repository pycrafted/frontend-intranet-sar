"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, ClipboardCheck } from "lucide-react"

interface Video {
  id: number
  title: string
  url: string
  description: string
}

interface VideoPlayerProps {
  video: Video
  onPrevious: () => void
  onNext: () => void
  currentIndex: number
  totalVideos: number
  onQuizClick?: () => void
}

export function VideoPlayer({ video, onPrevious, onNext, currentIndex, totalVideos, onQuizClick }: VideoPlayerProps) {
  const videos = [
    {
      id: 1,
      title: "Vidéo Institutionnelle SAR",
      description: "Découvrez l'histoire, les valeurs et la mission de la Société Africaine de Raffinage depuis sa création en 1961",
      duration: "15 min",
      type: "Institutionnelle",
      color: "from-red-600 to-red-700"
    },
    {
      id: 2,
      title: "Vidéo Sécurité",
      description: "Formation complète sur les équipements de protection et les procédures de sécurité au travail",
      duration: "12 min",
      type: "Sécurité",
      color: "from-amber-600 to-orange-600"
    }
  ]

  const currentVideoInfo = videos[currentIndex] || videos[0]

  return (
    <Card className="overflow-hidden shadow-2xl border-0 bg-white backdrop-blur-xl sm:hover:shadow-xl transition-all duration-500 group w-full">
      {/* Header avec titre et bouton questionnaire - Responsive optimisé */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50 pb-2 xs:pb-2.5 sm:pb-3 md:pb-4 px-2 xs:px-3 sm:px-4 md:px-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2.5 xs:gap-3 sm:gap-4">
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <div className={`p-1.5 xs:p-2 sm:p-2.5 md:p-3 rounded-lg xs:rounded-xl bg-gradient-to-r ${currentVideoInfo.color} shadow-lg flex-shrink-0`}>
              <Play className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 sm:group-hover:text-slate-900 transition-colors leading-tight break-words">
                {currentVideoInfo.title}
              </CardTitle>
            </div>
          </div>
          
          {onQuizClick && (
            <Button
              onClick={onQuizClick}
              className="text-white font-semibold px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-2 rounded-md xs:rounded-lg shadow-lg sm:hover:shadow-xl transition-all duration-300 sm:hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 xs:gap-2 w-full xs:w-auto text-xs xs:text-sm sm:text-base touch-manipulation"
              style={{
                backgroundColor: "#344256",
                borderColor: "#344256"
              }}
              onMouseEnter={(e) => {
                if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                  e.currentTarget.style.backgroundColor = "#2a3441"
                  e.currentTarget.style.borderColor = "#2a3441"
                }
              }}
              onMouseLeave={(e) => {
                if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                  e.currentTarget.style.backgroundColor = "#344256"
                  e.currentTarget.style.borderColor = "#344256"
                }
              }}
            >
              <ClipboardCheck className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
              <span>Quiz</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Zone vidéo */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
          {video.url.includes('cloudflarestream.com') ? (
            <iframe
              src={video.url}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={video.url || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-110 transition-all duration-300 border-4 border-white/20 backdrop-blur-sm animate-glow"
                >
                  <Play className="h-6 w-6 fill-current ml-1" />
                </Button>
              </div>
            </>
          )}
          
          {/* Boutons de navigation - Responsive optimisé */}
          <div className="absolute bottom-1.5 xs:bottom-2 sm:bottom-3 md:bottom-4 left-1.5 xs:left-2 sm:left-3 md:left-4 right-1.5 xs:right-2 sm:right-3 md:right-4 flex items-center justify-between z-50 gap-1 xs:gap-2">
            <Button
              onClick={onPrevious}
              variant="ghost"
              size="sm"
              className="gap-1 xs:gap-1.5 sm:gap-2 sm:hover:bg-white/30 text-white font-semibold sm:hover:text-white transition-all duration-200 sm:hover:scale-105 active:scale-95 backdrop-blur-md border border-white/30 bg-black/30 sm:bg-black/20 sm:hover:bg-black/40 px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2 text-xs xs:text-sm touch-manipulation"
            >
              <ChevronLeft className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Précédent</span>
            </Button>

            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2">
              <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              <span className="text-white text-[10px] xs:text-xs sm:text-sm font-medium whitespace-nowrap">
                {currentIndex + 1} / {totalVideos}
              </span>
            </div>

            <Button
              onClick={onNext}
              variant="ghost"
              size="sm"
              className="gap-1 xs:gap-1.5 sm:gap-2 sm:hover:bg-white/30 text-white font-semibold sm:hover:text-white transition-all duration-200 sm:hover:scale-105 active:scale-95 backdrop-blur-md border border-white/30 bg-black/30 sm:bg-black/20 sm:hover:bg-black/40 px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2 text-xs xs:text-sm touch-manipulation"
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          {/* Effets visuels */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/20 to-transparent blur-2xl" />
        </div>

      </CardContent>
    </Card>
  )
}
