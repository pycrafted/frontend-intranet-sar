"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Newspaper, Clock, User, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { useArticles } from "@/hooks/useArticles"
import Link from "next/link"

interface NewsCarouselProps {
  autoScrollInterval?: number
  className?: string
}

export function NewsCarousel({ autoScrollInterval = 4000, className = "" }: NewsCarouselProps) {
  const { articles, loading, error } = useArticles({
    type: 'news',
    pageSize: 10
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Trier les articles par date (plus récent en premier)
  const sortedArticles = articles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5) // Limiter à 5 articles pour le carrousel

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Sécurité': 'bg-red-500 text-white border-red-500 shadow-lg',
      'Formation': 'bg-blue-500 text-white border-blue-500 shadow-lg',
      'Direction': 'bg-purple-500 text-white border-purple-500 shadow-lg',
      'Production': 'bg-green-600 text-white border-green-600 shadow-lg',
      'Ressources Humaines': 'bg-orange-500 text-white border-orange-500 shadow-lg',
      'Finance': 'bg-yellow-600 text-white border-yellow-600 shadow-lg',
      'Toutes': 'bg-gray-500 text-white border-gray-500 shadow-lg'
    }
    return colors[category] || colors['Toutes']
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') {
      return '??'
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === sortedArticles.length - 1 ? 0 : prevIndex + 1
    )
  }, [sortedArticles.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? sortedArticles.length - 1 : prevIndex - 1
    )
  }, [sortedArticles.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Gestion du défilement automatique
  useEffect(() => {
    if (sortedArticles.length <= 1 || isPaused || isHovered) return

    intervalRef.current = setInterval(goToNext, autoScrollInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [sortedArticles.length, isPaused, isHovered, autoScrollInterval, goToNext])

  // Gestion des événements clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      }
    }

    if (carouselRef.current) {
      carouselRef.current.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [goToNext, goToPrevious])

  // Gestion du swipe sur mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  if (loading) {
    return (
      <Card className={`h-[28rem] flex flex-col ${className}`}>
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600" />
            Actualités
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            {[...Array(1)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`h-[28rem] flex flex-col ${className}`}>
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600" />
            Actualités
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="text-center py-6">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-sm text-gray-500">Erreur lors du chargement</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sortedArticles.length === 0) {
    return (
      <Card className={`h-[28rem] flex flex-col ${className}`}>
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600" />
            Actualités
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="text-center py-6">
            <Newspaper className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune actualité publiée</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentArticle = sortedArticles[currentIndex]

  return (
    <Card 
      ref={carouselRef}
      className={`h-[28rem] flex flex-col overflow-hidden relative carousel-card ${className}`}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image de fond si disponible */}
      {currentArticle.image_url && (
        <div className="absolute inset-0">
          <img
            src={currentArticle.image_url}
            alt={currentArticle.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay sombre pour la lisibilité */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Contrôles de navigation */}
      {sortedArticles.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border border-white/30"
            onClick={goToPrevious}
            aria-label="Article précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border border-white/30"
            onClick={goToNext}
            aria-label="Article suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      <CardHeader className="relative pb-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white drop-shadow-lg">
          <Newspaper className="h-5 w-5" />
          Actualités
          {sortedArticles.length > 1 && (
            <span className="text-sm font-normal text-white/70">
              ({currentIndex + 1}/{sortedArticles.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <div
            className="p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="space-y-4">
              {/* En-tête de l'article */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-semibold ${getCategoryColor(currentArticle.category)}`}
                >
                  {currentArticle.category}
                </Badge>
                {currentArticle.is_pinned && (
                  <Badge variant="secondary" className="text-xs font-semibold bg-yellow-500 text-white border-yellow-500 shadow-lg">
                    📌 Épinglé
                  </Badge>
                )}
              </div>
              
              {/* Titre */}
              <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-yellow-200 transition-colors drop-shadow-lg">
                {currentArticle.title}
              </h3>
              
              {/* Contenu */}
              <p className="text-sm text-white/90 line-clamp-3 drop-shadow-md">
                {currentArticle.content}
              </p>
              
              {/* Métadonnées */}
              <div className="flex items-center justify-between text-sm text-white/80">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="drop-shadow-md">{formatDate(currentArticle.date)}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-white hover:bg-white/20 border border-white/30"
                  asChild
                >
                  <Link href="/actualites">
                    Lire la suite
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Indicateurs de pagination */}
      {sortedArticles.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {sortedArticles.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Aller à l'article ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Card>
  )
}





