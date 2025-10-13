"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Newspaper, Clock, User, ExternalLink } from "lucide-react"
import { useArticles } from "@/hooks/useArticles"
import Link from "next/link"

export function RecentNews() {
  const { articles, loading, error } = useArticles({
    type: 'news',
    pageSize: 5
  })

  // Trier les articles par date (plus récent en premier) et ne prendre que le premier
  const sortedArticles = articles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 1)

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

  if (loading) {
    return (
      <Card className="h-[28rem] flex flex-col">
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
      <Card className="h-[28rem] flex flex-col">
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

  return (
    <Card className="h-[28rem] flex flex-col overflow-hidden relative">
      {/* Image de fond si disponible */}
      {sortedArticles.length > 0 && sortedArticles[0].image_url && (
        <div className="absolute inset-0">
          <img
            src={sortedArticles[0].image_url}
            alt={sortedArticles[0].title}
            className="w-full h-full object-cover"
          />
          {/* Overlay sombre pour la lisibilité */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <CardHeader className="relative pb-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white drop-shadow-lg">
          <Newspaper className="h-5 w-5" />
          Actualités
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col justify-center">
        {sortedArticles.length === 0 ? (
          <div className="text-center py-6">
            <Newspaper className="h-8 w-8 text-white/60 mx-auto mb-2 drop-shadow-lg" />
            <p className="text-sm text-white/80 drop-shadow-md">Aucune actualité récente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedArticles.map((article) => (
              <div
                key={article.id}
                className="p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* En-tête de l'article */}
                  <div className="flex items-center gap-2">
                  </div>
                  
                  {/* Titre */}
                  <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-yellow-200 transition-colors drop-shadow-lg">
                    {article.title}
                  </h3>
                  
                  {/* Contenu */}
                  <p className="text-sm text-white/90 line-clamp-3 drop-shadow-md">
                    {article.content}
                  </p>
                  
                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="drop-shadow-md">{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="drop-shadow-md">{formatDate(article.date)}</span>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
