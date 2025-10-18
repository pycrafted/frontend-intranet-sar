"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { VideoPlayer } from "@/components/security/video-player"
import { SecurityCarousel } from "@/components/security/security-carousel"
import { QuizModal } from "@/components/security/quiz-modal"

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1))
  }

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0))
  }


  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-[#e5e7eb] relative overflow-hidden">
        {/* Background Effects - Responsive */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Effet 1 - Top Right */}
          <div
            className="absolute top-10 right-4 sm:top-16 sm:right-8 md:top-20 md:right-12 lg:top-20 lg:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-400/20 via-cyan-400/15 to-transparent rounded-full blur-3xl animate-float transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 1}px, ${mousePosition.y * 1 - scrollY * 0.2}px)`,
            }}
          />
          {/* Effet 2 - Bottom Left */}
          <div
            className="absolute bottom-10 left-4 sm:bottom-16 sm:left-8 md:bottom-20 md:left-12 lg:bottom-20 lg:left-20 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gradient-to-tr from-indigo-400/20 via-purple-400/15 to-transparent rounded-full blur-3xl animate-float transition-transform duration-1000 ease-out"
            style={{
              animationDelay: "1s",
              transform: `translate(${-mousePosition.x * 0.8}px, ${-mousePosition.y * 0.8 - scrollY * 0.15}px)`,
            }}
          />
          {/* Effet 3 - Center */}
          <div
            className="absolute top-1/2 left-1/2 w-36 h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-transparent rounded-full blur-3xl animate-float transition-transform duration-1000 ease-out"
            style={{
              animationDelay: "2s",
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5 - scrollY * 0.1}px)`,
            }}
          />
          {/* Grille de fond */}
          <div
            className="absolute inset-0 opacity-[0.02] sm:opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
              transition: "transform 0.3s ease-out",
            }}
          />
        </div>

        {/* Contenu principal - Responsive */}
        <div className="w-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:px-16 xl:py-20 relative z-10">
          {/* Vidéo centrée - Responsive */}
          <div className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <VideoPlayer
              video={videos[currentVideoIndex]}
              onPrevious={handlePreviousVideo}
              onNext={handleNextVideo}
              currentIndex={currentVideoIndex}
              totalVideos={videos.length}
              onQuizClick={() => setIsQuizOpen(true)}
            />
          </div>

          {/* Carousel de cartes de sécurité - Responsive */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <SecurityCarousel />
          </div>
        </div>

        <QuizModal open={isQuizOpen} onOpenChange={setIsQuizOpen} />
      </div>
    </LayoutWrapper>
  )
}






