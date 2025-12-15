"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film, X, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void
  className?: string
}

// Catégories populaires de GIFs
const TRENDING_TERMS = [
  "happy", "excited", "love", "funny", "celebration", 
  "thumbs up", "yes", "no", "thinking", "wow",
  "thank you", "good luck", "congratulations", "party", "dance"
]

export function GifPicker({ onGifSelect, className }: GifPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [gifs, setGifs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Fermer le picker quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Charger les GIFs tendance au chargement
      if (gifs.length === 0 && !loading) {
        fetchTrendingGifs()
      }
    } else {
      // Réinitialiser quand on ferme
      setGifs([])
      setSearchQuery("")
      setSelectedCategory(null)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const fetchTrendingGifs = async () => {
    setLoading(true)
    setGifs([])
    try {
      // Essayer d'abord avec Giphy
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC'
      const response = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        // Si Giphy échoue, essayer Tenor
        return await fetchTrendingGifsTenor()
      }
      
      const data = await response.json()
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        setGifs(data.data)
      } else {
        // Si pas de résultats, essayer Tenor
        await fetchTrendingGifsTenor()
      }
    } catch (error) {
      console.error("Erreur Giphy, essai avec Tenor:", error)
      // En cas d'erreur, essayer Tenor
      await fetchTrendingGifsTenor()
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingGifsTenor = async () => {
    try {
      // Utiliser l'API Tenor comme alternative (gratuite, pas de clé requise pour les tendances)
      const response = await fetch(`https://g.tenor.com/v1/trending?key=LIVDSRZULELA&limit=20&media_filter=minimal`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        // Convertir le format Tenor en format compatible
        const convertedGifs = data.results.map((gif: any) => ({
          id: gif.id,
          title: gif.title || gif.content_description || 'GIF',
          images: {
            fixed_height: {
              url: gif.media?.[0]?.gif?.url || gif.media?.[0]?.tinygif?.url
            },
            fixed_height_small: {
              url: gif.media?.[0]?.tinygif?.url || gif.media?.[0]?.gif?.url
            },
            original: {
              url: gif.media?.[0]?.gif?.url || gif.media?.[0]?.tinygif?.url
            }
          }
        }))
        setGifs(convertedGifs)
      }
    } catch (error) {
      console.error("Erreur Tenor:", error)
      setGifs([])
    }
  }

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      fetchTrendingGifs()
      return
    }

    setLoading(true)
    setGifs([])
    try {
      // Essayer d'abord avec Giphy
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC'
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        // Si Giphy échoue, essayer Tenor
        return await searchGifsTenor(query)
      }
      
      const data = await response.json()
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        setGifs(data.data)
      } else {
        // Si pas de résultats, essayer Tenor
        await searchGifsTenor(query)
      }
    } catch (error) {
      console.error("Erreur Giphy, essai avec Tenor:", error)
      // En cas d'erreur, essayer Tenor
      await searchGifsTenor(query)
    } finally {
      setLoading(false)
    }
  }

  const searchGifsTenor = async (query: string) => {
    try {
      const response = await fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=20&media_filter=minimal`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        // Convertir le format Tenor en format compatible
        const convertedGifs = data.results.map((gif: any) => ({
          id: gif.id,
          title: gif.title || gif.content_description || 'GIF',
          images: {
            fixed_height: {
              url: gif.media?.[0]?.gif?.url || gif.media?.[0]?.tinygif?.url
            },
            fixed_height_small: {
              url: gif.media?.[0]?.tinygif?.url || gif.media?.[0]?.gif?.url
            },
            original: {
              url: gif.media?.[0]?.gif?.url || gif.media?.[0]?.tinygif?.url
            }
          }
        }))
        setGifs(convertedGifs)
      }
    } catch (error) {
      console.error("Erreur Tenor:", error)
      setGifs([])
    }
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    searchGifs(category)
  }

  const handleGifClick = (gif: any) => {
    // Utiliser l'URL du GIF en format fix_height pour une meilleure qualité
    const gifUrl = gif.images?.fixed_height?.url || gif.images?.original?.url
    if (gifUrl) {
      onGifSelect(gifUrl)
      setIsOpen(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchGifs(searchQuery)
  }

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-muted/50 flex-shrink-0"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Sélecteur de GIFs"
      >
        <Film className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay pour fermer au clic extérieur */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 w-80 h-96 bg-background border border-border rounded-lg shadow-xl z-[100] flex flex-col">
            {/* En-tête avec recherche */}
            <div className="p-2 border-b border-border">
              <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Rechercher un GIF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              {/* Catégories rapides */}
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                <Button
                  type="button"
                  variant={selectedCategory === null ? "default" : "ghost"}
                  size="sm"
                  className="text-xs px-2 py-1 h-auto whitespace-nowrap flex-shrink-0"
                  onClick={() => {
                    setSelectedCategory(null)
                    fetchTrendingGifs()
                  }}
                >
                  Tendance
                </Button>
                {TRENDING_TERMS.slice(0, 5).map((term) => (
                  <Button
                    key={term}
                    type="button"
                    variant={selectedCategory === term ? "default" : "ghost"}
                    size="sm"
                    className="text-xs px-2 py-1 h-auto whitespace-nowrap flex-shrink-0"
                    onClick={() => handleCategoryClick(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grille de GIFs */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : gifs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Aucun GIF trouvé
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {gifs.map((gif) => (
                    <button
                      key={gif.id}
                      type="button"
                      className="relative aspect-square overflow-hidden rounded-lg hover:ring-2 ring-primary transition-all hover:scale-105"
                      onClick={() => handleGifClick(gif)}
                      aria-label={`GIF ${gif.title || 'sans titre'}`}
                    >
                      <img
                        src={gif.images?.fixed_height_small?.url || gif.images?.preview_gif?.url}
                        alt={gif.title || "GIF"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

