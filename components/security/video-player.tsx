"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, ClipboardCheck } from "lucide-react"
import React from "react"

interface Video {
  id: number
  title: string
  file_url: string
  description: string | null
}

interface VideoPlayerProps {
  video: Video
  onPrevious: () => void
  onNext: () => void
  currentIndex: number
  totalVideos: number
  onQuizClick?: () => void
  headerControls?: React.ReactNode
}

export function VideoPlayer({ video, onPrevious, onNext, currentIndex, totalVideos, onQuizClick, headerControls }: VideoPlayerProps) {


  return (
    <Card className="overflow-hidden shadow-2xl border-0 bg-white backdrop-blur-xl sm:hover:shadow-xl transition-all duration-500 group w-full flex flex-col">
      {/* Header avec icône, titre et bouton questionnaire - En haut */}
      <CardHeader className="bg-white border-b border-gray-200" style={{ 
        padding: 'clamp(0.75rem, 2vw, 1.5rem) clamp(0.75rem, 2.5vw, 3rem)'
      }}>
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between" style={{ gap: 'clamp(0.625rem, 1.5vw, 1.5rem)' }}>
          <div className="flex items-center min-w-0 flex-1" style={{ gap: 'clamp(0.75rem, 2vw, 2rem)' }}>
            {/* Icône vidéo améliorée */}
            <div className="relative flex-shrink-0">
              <div 
                className="rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{ 
                  backgroundColor: "#344256",
                  padding: 'clamp(0.375rem, 1vw, 1rem)'
                }}
              >
                <Play className="text-white fill-white" style={{ 
                  width: 'clamp(0.75rem, 2vw, 1.75rem)', 
                  height: 'clamp(0.75rem, 2vw, 1.75rem)' 
                }} />
              </div>
            </div>
            
            {/* Titre et description */}
            <div className="min-w-0 flex-1">
              <CardTitle className="font-bold text-slate-800 sm:group-hover:text-slate-900 transition-colors leading-tight break-words" style={{ 
                fontSize: 'clamp(0.75rem, 1.5vw, 1.5rem)',
                marginBottom: 'clamp(0.25rem, 0.8vw, 0.5rem)',
                lineHeight: '1.2'
              }}>
                {video.title}
              </CardTitle>
              {video.description && (
                <p className="text-gray-600 leading-relaxed line-clamp-2" style={{ 
                  fontSize: 'clamp(0.625rem, 1.2vw, 1rem)',
                  lineHeight: '1.5'
                }}>
                  {video.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerControls}
            {onQuizClick && (
              <Button
                onClick={onQuizClick}
                className="text-white font-semibold rounded-md xs:rounded-lg shadow-lg sm:hover:shadow-xl transition-all duration-300 sm:hover:scale-105 active:scale-95 flex items-center justify-center touch-manipulation"
                style={{
                  backgroundColor: "#344256",
                  borderColor: "#344256",
                  padding: 'clamp(0.375rem, 1vw, 1rem) clamp(0.75rem, 2vw, 2.5rem)',
                  fontSize: 'clamp(0.625rem, 1.2vw, 1rem)',
                  gap: 'clamp(0.375rem, 1vw, 0.75rem)'
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
                <ClipboardCheck style={{
                  width: 'clamp(0.75rem, 1.5vw, 1.75rem)',
                  height: 'clamp(0.75rem, 1.5vw, 1.75rem)'
                }} />
                <span>Quiz</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {/* Zone vidéo */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
          {video.file_url ? (
            <video
              key={video.file_url}
              src={video.file_url}
              controls
              className="w-full h-full"
              preload="metadata"
            />
          ) : (
            <>
              <img
                src="/placeholder.svg"
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
          
          {/* Boutons de navigation - Responsive fluide */}
          <div className="absolute flex items-center justify-between z-50" style={{ 
            bottom: 'clamp(0.375rem, 1.5vw, 2rem)',
            left: 'clamp(0.375rem, 1.5vw, 2rem)',
            right: 'clamp(0.375rem, 1.5vw, 2rem)',
            gap: 'clamp(0.25rem, 1.5vw, 1.25rem)'
          }}>
            <Button
              onClick={onPrevious}
              variant="ghost"
              size="sm"
              className="sm:hover:bg-white/30 text-white font-semibold sm:hover:text-white transition-all duration-200 sm:hover:scale-105 active:scale-95 backdrop-blur-md border border-white/30 bg-black/30 sm:bg-black/20 sm:hover:bg-black/40 touch-manipulation"
              style={{
                padding: 'clamp(0.375rem, 1vw, 1rem) clamp(0.5rem, 1.5vw, 1.5rem)',
                fontSize: 'clamp(0.625rem, 1.2vw, 1.25rem)',
                gap: 'clamp(0.25rem, 0.8vw, 0.75rem)'
              }}
            >
              <ChevronLeft style={{ 
                width: 'clamp(0.75rem, 1.5vw, 1.75rem)', 
                height: 'clamp(0.75rem, 1.5vw, 1.75rem)' 
              }} />
              <span className="hidden sm:inline">Précédent</span>
            </Button>

            <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full" style={{ 
              gap: 'clamp(0.25rem, 0.8vw, 0.75rem)',
              padding: 'clamp(0.125rem, 0.8vw, 1rem) clamp(0.375rem, 1.5vw, 2rem)'
            }}>
              <div className="bg-white rounded-full" style={{ 
                width: 'clamp(0.25rem, 0.8vw, 1rem)', 
                height: 'clamp(0.25rem, 0.8vw, 1rem)' 
              }}></div>
              <span className="text-white font-medium whitespace-nowrap" style={{ 
                fontSize: 'clamp(0.625rem, 1.2vw, 1.125rem)'
              }}>
                {currentIndex + 1} / {totalVideos}
              </span>
            </div>

            <Button
              onClick={onNext}
              variant="ghost"
              size="sm"
              className="sm:hover:bg-white/30 text-white font-semibold sm:hover:text-white transition-all duration-200 sm:hover:scale-105 active:scale-95 backdrop-blur-md border border-white/30 bg-black/30 sm:bg-black/20 sm:hover:bg-black/40 touch-manipulation"
              style={{
                padding: 'clamp(0.375rem, 1vw, 1rem) clamp(0.5rem, 1.5vw, 1.5rem)',
                fontSize: 'clamp(0.625rem, 1.2vw, 1.25rem)',
                gap: 'clamp(0.25rem, 0.8vw, 0.75rem)'
              }}
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight style={{ 
                width: 'clamp(0.75rem, 1.5vw, 1.75rem)', 
                height: 'clamp(0.75rem, 1.5vw, 1.75rem)' 
              }} />
            </Button>
          </div>
          
        </div>

      </CardContent>
    </Card>
  )
}
