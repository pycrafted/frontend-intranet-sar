"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Newspaper, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { useArticles } from "@/hooks/useArticles"
import { useLinkedInActualites, LinkedInActualite } from "@/hooks/useLinkedInActualites"
import LinkedInModal from "@/components/linkedin-modal"
import Link from "next/link"

const GENERIC_IMG = "/media/generique.jpg"

type SlideItem = {
  id: number | string
  imageUrl: string | null
  summary: string
  linkedInItem?: LinkedInActualite
}

interface NewsCarouselProps {
  autoScrollInterval?: number
  className?: string
}

export function NewsCarousel({ autoScrollInterval = 4000, className = "" }: NewsCarouselProps) {
  const { articles: regularArticles, loading: loadingRegular } = useArticles({ type: 'news', pageSize: 10 })
  const { items: linkedInItems, loading: loadingLinkedIn } = useLinkedInActualites()
  const [modalItem, setModalItem] = useState<LinkedInActualite | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const loading = loadingLinkedIn || loadingRegular

  // LinkedIn posts en priorité, fallback sur articles réguliers
  const hasLinkedIn = linkedInItems.length > 0

  const sortedArticles: SlideItem[] = hasLinkedIn
    ? linkedInItems.slice(0, 10).map(item => ({
        id: item.id,
        imageUrl: item.image_url || GENERIC_IMG,
        summary: item.content.replace(/\n+/g, ' ').trim(),
        linkedInItem: item,
      }))
    : regularArticles
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map(a => ({
          id: a.id,
          imageUrl: a.image_url || null,
          summary: (a.content || a.title || '').replace(/<[^>]*>/g, '').trim(),
        }))

  const getSummary = (text: string, max = 150) => {
    const clean = text.replace(/<[^>]*>/g, '').trim()
    if (clean.length <= max) return clean
    const truncated = clean.substring(0, max)
    const lastSpace = truncated.lastIndexOf(' ')
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
  }

  // Navigation
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === sortedArticles.length - 1 ? 0 : prev + 1))
  }, [sortedArticles.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? sortedArticles.length - 1 : prev - 1))
  }, [sortedArticles.length])

// Auto-scroll
  useEffect(() => {
    if (sortedArticles.length <= 1 || isPaused || isHovered) return
    intervalRef.current = setInterval(goToNext, autoScrollInterval)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sortedArticles.length, isPaused, isHovered, autoScrollInterval, goToNext])

  // Clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevious() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goToNext() }
    }
    const el = carouselRef.current
    if (el) el.addEventListener('keydown', handleKeyDown)
    return () => { if (el) el.removeEventListener('keydown', handleKeyDown) }
  }, [goToNext, goToPrevious])

  // Swipe mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const dist = touchStart - touchEnd
    if (dist > 50) goToNext()
    else if (dist < -50) goToPrevious()
  }

  // ── État loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className={`h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col ${className}`}>
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Newspaper className="h-5 w-5 text-slate-800" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">Actualités</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Dernières nouvelles SAR</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="animate-pulse">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2 mb-2 sm:mb-3" />
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── État vide ─────────────────────────────────────────────────────────────
  if (sortedArticles.length === 0) {
    return (
      <Card className={`h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col ${className}`}>
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Newspaper className="h-5 w-5 text-slate-800" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">Actualités</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Dernières nouvelles SAR</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center p-3 sm:p-6">
          <div className="text-center py-4 sm:py-6">
            <Newspaper className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-gray-500">Aucune actualité publiée</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentSlide = sortedArticles[currentIndex]

  // ── Carrousel ─────────────────────────────────────────────────────────────
  return (
    <>
      <Card
        ref={carouselRef as React.RefObject<HTMLDivElement>}
        className={`h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative carousel-card news-carousel-mobile group ${className}`}
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image de fond */}
        {currentSlide.imageUrl && (
          <div className="absolute inset-0">
            <img
              src={currentSlide.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = GENERIC_IMG }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Navigation prev/next */}
        {sortedArticles.length > 1 && (
          <>
            <Button
              variant="ghost" size="sm"
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border border-white/30 h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={goToPrevious}
              aria-label="Article précédent"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost" size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border border-white/30 h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={goToNext}
              aria-label="Article suivant"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </>
        )}

        <CardHeader className="relative z-10 pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/90 shadow-sm group-hover:scale-105 transition-all duration-300">
                <Newspaper className="h-5 w-5 text-slate-800" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white leading-tight drop-shadow-lg">
                  Actualités
                  {sortedArticles.length > 1 && (
                    <span className="text-xs font-normal text-white/70 ml-1.5">
                      ({currentIndex + 1}/{sortedArticles.length})
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-white/70 mt-0.5 drop-shadow-md">Dernières nouvelles SAR</p>
              </div>
            </div>
            <Link href="/actualites" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-7 px-3 text-xs text-white hover:bg-white/20 border border-white/30">
                Voir toutes les actus
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="relative flex-1 flex flex-col px-4 pb-4 pt-0 overflow-hidden carousel-content">
          <div className="flex flex-col h-full justify-end">
            {currentSlide.summary?.trim() && (
              <button
                type="button"
                className="w-full text-left p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                onClick={() => currentSlide.linkedInItem && setModalItem(currentSlide.linkedInItem)}
              >
                <p className="text-[11px] text-white/90 drop-shadow-md leading-relaxed line-clamp-6 carousel-text">
                  {getSummary(currentSlide.summary, 300)}
                </p>
              </button>
            )}
          </div>
        </CardContent>

      </Card>

      {/* Modal LinkedIn */}
      <LinkedInModal
        item={modalItem}
        allItems={linkedInItems.filter(i => !!i.linkedin_url)}
        onClose={() => setModalItem(null)}
        onNavigate={setModalItem}
      />
    </>
  )
}
