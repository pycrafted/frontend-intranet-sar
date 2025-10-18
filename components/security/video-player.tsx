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
    <Card className="overflow-hidden shadow-2xl border-0 bg-white backdrop-blur-xl hover:shadow-xl transition-all duration-500 group">
      {/* Header avec titre et bouton questionnaire - Responsive */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${currentVideoInfo.color} shadow-lg flex-shrink-0`}>
              <Play className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-tight">
                {currentVideoInfo.title}
              </CardTitle>
            </div>
          </div>
          
          {onQuizClick && (
            <Button
              onClick={onQuizClick}
              className="text-white font-semibold px-4 py-2 sm:px-6 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
              style={{
                backgroundColor: "#344256",
                borderColor: "#344256"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2a3441"
                e.currentTarget.style.borderColor = "#2a3441"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#344256"
                e.currentTarget.style.borderColor = "#344256"
              }}
            >
              <ClipboardCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Questionnaire</span>
              <span className="xs:hidden">Quiz</span>
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
          
          {/* Boutons de navigation - Responsive */}
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between z-50">
            <Button
              onClick={onPrevious}
              variant="ghost"
              size="sm"
              className="gap-1 sm:gap-2 hover:bg-white/30 text-white font-semibold hover:text-white transition-all duration-200 hover:scale-105 backdrop-blur-md border border-white/30 bg-black/20 hover:bg-black/40 px-2 py-1 sm:px-3 sm:py-2"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Précédent</span>
            </Button>

            <div className="flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 sm:px-4 sm:py-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              <span className="text-white text-xs sm:text-sm font-medium">
                {currentIndex + 1} / {totalVideos}
              </span>
            </div>

            <Button
              onClick={onNext}
              variant="ghost"
              size="sm"
              className="gap-1 sm:gap-2 hover:bg-white/30 text-white font-semibold hover:text-white transition-all duration-200 hover:scale-105 backdrop-blur-md border border-white/30 bg-black/20 hover:bg-black/40 px-2 py-1 sm:px-3 sm:py-2"
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
