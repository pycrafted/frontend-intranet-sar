"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { VideoPlayer } from "@/components/security/video-player"
import { SecurityCards } from "@/components/security/security-cards"
import { QuizModal } from "@/components/security/quiz-modal"
import { Button } from "@/components/ui/button"
import { FileText, ClipboardCheck } from "lucide-react"

const videos = [
  {
    id: 1,
    title: "Formation Sécurité - Partie 1",
    url: "https://customer-eas3f2kom74sgnh6.cloudflarestream.com/3f0c7ea611f5f970f280df7cf5c8587b/watch",
    description: "Formation complète sur les équipements de protection",
  },
  {
    id: 2,
    title: "Formation Sécurité - Partie 2",
    url: "https://customer-eas3f2kom74sgnh6.cloudflarestream.com/8acc2118f34340bfcfa5a667d3a0d95c/watch",
    description: "Procédures de sécurité et signalement des dangers",
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

  const handleViewReglement = () => {
    // Pour l'instant, on ouvre une nouvelle fenêtre avec un message
    window.open("#", "_blank")
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-[#e5e7eb] relative overflow-hidden -mx-1 sm:-mx-2 lg:-mx-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-cyan-400/15 to-transparent rounded-full blur-3xl animate-float transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2 - scrollY * 0.3}px)`,
            }}
          />
          <div
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 via-purple-400/15 to-transparent rounded-full blur-3xl animate-float transition-transform duration-1000 ease-out"
            style={{
              animationDelay: "1s",
              transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5 - scrollY * 0.2}px)`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-transparent rounded-full blur-3xl animate-float transition-transform duration-1000 ease-out"
            style={{
              animationDelay: "2s",
              transform: `translate(${mousePosition.x}px, ${mousePosition.y - scrollY * 0.25}px)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
              transition: "transform 0.3s ease-out",
            }}
          />
        </div>

        <div className="w-full p-8 md:p-12 lg:p-16 relative z-10">
          <div className="flex gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Button
              onClick={() => setIsQuizOpen(true)}
              variant="outline"
              className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-md hover:from-blue-50 hover:to-white hover:shadow-xl hover:shadow-blue-500/20 border-blue-200/60 text-slate-700 font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <ClipboardCheck className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Questionnaire de Sécurité</span>
            </Button>

            <Button
              onClick={handleViewReglement}
              variant="outline"
              className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur-md hover:from-indigo-50 hover:to-white hover:shadow-xl hover:shadow-indigo-500/20 border-indigo-200/60 text-slate-700 font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <FileText className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Règlement Intérieur</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-3 animate-in fade-in slide-in-from-left-8 duration-700">
              <VideoPlayer
                video={videos[currentVideoIndex]}
                onPrevious={handlePreviousVideo}
                onNext={handleNextVideo}
                currentIndex={currentVideoIndex}
                totalVideos={videos.length}
              />
            </div>

            <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
              <SecurityCards variant="stacked" />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <SecurityCards />
          </div>
        </div>

        <QuizModal open={isQuizOpen} onOpenChange={setIsQuizOpen} />
      </div>
    </LayoutWrapper>
  )
}





