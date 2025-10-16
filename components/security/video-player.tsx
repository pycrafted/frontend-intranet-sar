"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"

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
}

export function VideoPlayer({ video, onPrevious, onNext, currentIndex, totalVideos }: VideoPlayerProps) {
  return (
    <Card className="overflow-hidden shadow-2xl border-0 bg-black backdrop-blur-xl hover:shadow-blue-500/20 transition-all duration-500 group">
      <CardContent className="p-0">
        <div className="relative aspect-[16/6] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
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
          
          {/* Boutons de pagination sur la vidéo */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Button
              onClick={onPrevious}
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-white/20 text-white font-semibold hover:text-white transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <Button
              onClick={onNext}
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-white/20 text-white font-semibold hover:text-white transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/20 to-transparent blur-2xl" />
        </div>

      </CardContent>
    </Card>
  )
}
