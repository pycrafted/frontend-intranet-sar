"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, Eye, Filter, Heart, MessageCircle, Share, MoreHorizontal, Plus, Bell, BarChart3, CheckSquare, Clock, CheckCircle, Circle } from "lucide-react"
import { useArticles, useArticleStats } from "@/hooks/useArticles"
import { Article } from "@/lib/api"
import { AdaptivePublicationCard } from "@/components/adaptive-publication-card"
import { StandardLoader } from "@/components/ui/standard-loader"

// Données statiques supprimées - maintenant récupérées depuis l'API Django


export default function ActualitesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeDepartment, setActiveDepartment] = useState("all")
  const [activeTimeFilter, setActiveTimeFilter] = useState("all")
  const [deletedArticles, setDeletedArticles] = useState<number[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Debounce pour la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Recherche immédiate si le champ est vide
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 1000) // 1 seconde pour laisser le temps de finir d'écrire
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Utilisation du hook pour récupérer les données depuis l'API
  const { articles, loading, error } = useArticles({
    type: activeFilter === "all" ? undefined : activeFilter,
    search: debouncedSearchTerm || undefined,
    timeFilter: activeTimeFilter === "all" ? undefined : activeTimeFilter,
  })

  // Récupération des statistiques pour les filtres
  const { stats } = useArticleStats()

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Forcer la recherche immédiate sur Enter
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
    }
  }


  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  const handleDepartmentChange = (department: string) => {
    // Mapper les noms français aux clés internes
    const departmentMap: { [key: string]: string } = {
      "Tous": "all",
      "Sécurité": "securite",
      "Finance": "finance",
      "Formation": "formation",
      "Production": "production",
      "Partenariat": "partenariat",
      "Environnement": "environnement",
      "RH": "rh",
    }
    
    const internalKey = departmentMap[department] || "all"
    setActiveDepartment(internalKey)
  }

  const handleTimeFilterChange = (timeFilter: string) => {
    setActiveTimeFilter(timeFilter)
    
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
  }

  const handleDeleteArticle = (articleId: number) => {
    
    setDeletedArticles(prev => [...prev, articleId])
  }

  const handleUpdateArticle = (updatedArticle: Article) => {
    
    // Ici, on pourrait mettre à jour la liste des articles
    // Pour l'instant, on recharge la page pour voir les changements
    window.location.reload()
  }

  // Tous les articles dans une seule liste, en filtrant les articles supprimés
  const allArticles = articles.filter(article => !deletedArticles.includes(article.id))



  // Options de période pour le filtre
  const timeFilterOptions = [
    {id: "all", name: "Toutes les périodes"},
    {id: "today", name: "Aujourd'hui"},
    {id: "week", name: "Cette semaine"},
    {id: "month", name: "Ce mois"}
  ]

  return (
    <LayoutWrapper 
      secondaryNavbarProps={{
        searchTerm,
        onSearchChange: handleSearch,
        onSearchKeyDown: handleSearchKeyDown,
        searchPlaceholder: "Rechercher dans les actualités...",
        isTyping,
        selectedDepartment: (() => {
          const departmentMap: { [key: string]: string } = {
            "all": "Tous",
            "securite": "Sécurité",
            "finance": "Finance",
            "formation": "Formation",
            "production": "Production",
            "partenariat": "Partenariat",
            "environnement": "Environnement",
            "rh": "RH",
          }
          return departmentMap[activeDepartment] || "Tous"
        })(),
        onDepartmentChange: handleDepartmentChange,
        selectedTimeFilter: activeTimeFilter,
        onTimeFilterChange: handleTimeFilterChange,
        timeFilterOptions
      }}
      sidebarProps={{
        activeFilter,
        onFilterChange: handleFilterChange,
        activeDepartment,
        onDepartmentChange: handleDepartmentChange,
        activeTimeFilter,
        onTimeFilterChange: handleTimeFilterChange
      }}
    >
      <div className="w-full space-y-6">

        {/* État de chargement et d'erreur */}
        {(loading || error) && (
          <StandardLoader 
            title={loading ? "Chargement des actualités..." : undefined}
            message={loading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
            error={error}
            showRetry={!!error}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Feed principal - Style Talkspirit */}
                 {!loading && !error && (
                   <div className="space-y-6 stagger-animation">
                     {/* Toutes les publications */}
                     {allArticles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Toutes les publications</h3>
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                    {allArticles.length}
                  </Badge>
                </div>
                {allArticles.map((article) => (
                  <AdaptivePublicationCard
                    key={article.id}
                    article={article}
                    onDelete={handleDeleteArticle}
                    onUpdate={handleUpdateArticle}
                    searchTerm={searchTerm}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && articles.length === 0 && (
          <Card className="p-12 text-center rounded-lg">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Aucune actualité ou annonce publiée</h3>
              </div>
            </div>
          </Card>
        )}
      </div>
    </LayoutWrapper>
  )
}
