"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
// Removed tooltip imports - using native HTML title attributes instead
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Tag,
  Image,
  Video,
  FileText,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Database,
  AlertCircle,
  X,
  Clock,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ArticleForm } from "./article-form"
import { useArticlesAdmin } from "@/hooks/useArticlesAdmin"

interface Article {
  id: number
  type: 'news' | 'announcement'
  title: string | null
  content: string | null
  date: string
  time: string
  image_url: string | null
  content_type: string
  video_url: string | null
  video_poster_url: string | null
  created_at: string
  updated_at: string
}

interface ArticleAdminTableProps {
  onArticleSelect?: (article: Article) => void
}

export function ArticleAdminTable({ onArticleSelect }: ArticleAdminTableProps) {
  const {
    articles,
    loading,
    error,
    pagination,
    filters,
    selectedArticles,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    deleteMultipleArticles,
    setFilters,
    setSelectedArticles,
    clearSelection
  } = useArticlesAdmin()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Appliquer la recherche avec debounce plus long
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Recherche immédiate si le champ est vide
      setFilters(prev => ({ ...prev, search: searchTerm }))
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }))
      setIsTyping(false)
    }, 1000) // 1 seconde pour laisser le temps de finir d'écrire
    
    return () => clearTimeout(timer)
  }, [searchTerm, setFilters])

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
  }

  const handleDelete = async (articleId: number) => {
    await deleteArticle(articleId)
  }

  const handleDeleteMultiple = async () => {
    await deleteMultipleArticles(selectedArticles)
    clearSelection()
  }


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(articles.map(article => article.id))
    } else {
      clearSelection()
    }
  }

  const handleSelectArticle = (articleId: number, checked: boolean) => {
    if (checked) {
      setSelectedArticles(prev => [...prev, articleId])
    } else {
      setSelectedArticles(prev => prev.filter(id => id !== articleId))
    }
  }

  const getTypeDisplay = (type: string) => {
    return type === 'news' ? 'Actualité' : 'Annonce'
  }

  const getTypeColor = (type: string) => {
    return type === 'news' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
  }


  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr })
  }


  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chargement des articles...</h3>
              <p className="text-gray-600">Veuillez patienter pendant que nous récupérons les données.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Erreur lors du chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => fetchArticles()}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-sm"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header avec style inspiré de la page actualités */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Database className="h-5 w-5 text-blue-600" />
                  Administration des Articles
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {pagination.total} article{pagination.total > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel article</DialogTitle>
                  </DialogHeader>
                  <ArticleForm
                    onSubmit={async (data) => {
                      await createArticle(data)
                      setIsCreateDialogOpen(false)
                    }}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Barre de recherche et filtres */}
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Barre de recherche avancée (comme navbar secondaire) */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-xl">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                searchFocused ? 'text-blue-500' : 'text-gray-400'
                    }`} />
              <input
                type="text"
                placeholder="Rechercher dans les articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          setIsTyping(false)
                          setFilters(prev => ({ ...prev, search: searchTerm }))
                        }
                      }}
                className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 ${
                        searchFocused 
                    ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-md' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    />
                    {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setFilters(prev => ({ ...prev, search: "" }))
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
              
              {/* Indicateur de frappe */}
              {searchTerm && isTyping && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              )}
              </div>

            </div>

            {/* Filtres avancés professionnels */}
            {showFilters && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Filter className="h-5 w-5 text-slate-600" />
                      Filtres avancés
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({})}
                      className="text-slate-600 hover:text-slate-800"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Réinitialiser
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-500" />
                        Type d'article
                      </label>
                      <Select
                        value={filters.type || 'all'}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value }))}
                      >
                        <SelectTrigger className="h-11 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les types</SelectItem>
                          <SelectItem value="news">📰 Actualités</SelectItem>
                          <SelectItem value="announcement">📢 Annonces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        Période
                      </label>
                      <Select
                        value={filters.time_filter || 'all'}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, time_filter: value === 'all' ? undefined : value }))}
                      >
                        <SelectTrigger className="h-11 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500">
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les périodes</SelectItem>
                          <SelectItem value="today">📅 Aujourd'hui</SelectItem>
                          <SelectItem value="week">📆 Cette semaine</SelectItem>
                          <SelectItem value="month">📊 Ce mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Actions des filtres */}
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {Object.values(filters).filter(v => v && v !== 'all').length > 0 && (
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          {Object.values(filters).filter(v => v && v !== 'all').length} filtre(s) actif(s)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="border-slate-300 hover:border-slate-400"
                      >
                        Fermer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Appliquer les filtres
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions en lot avec style cohérent */}
            {selectedArticles.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} sélectionné{selectedArticles.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        title="Supprimer définitivement les articles sélectionnés"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMultiple}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearSelection} 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    title="Désélectionner tous les articles"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table des articles avec style inspiré de la page actualités */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedArticles.length === articles.length && articles.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Titre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                        className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {article.title || "Sans titre"}
                        </p>
                        {article.content && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {article.content.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getTypeColor(article.type)} border-0`}>
                        {getTypeDisplay(article.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-500" />
                          {formatDate(article.date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(article)}
                          className="hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                          title="Modifier cet article"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-red-50 text-red-600 hover:text-red-700"
                              title="Supprimer cet article"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination avec style cohérent */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium text-blue-700">{pagination.start}</span> à <span className="font-medium text-blue-700">{pagination.end}</span> sur <span className="font-medium text-blue-700">{pagination.total}</span> articles
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium text-blue-700">{pagination.page}</span> sur <span className="font-medium text-blue-700">{pagination.total_pages}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.page + 1 }))}
                  disabled={pagination.page >= pagination.total_pages}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      {editingArticle && (
        <Dialog open={!!editingArticle} onOpenChange={() => setEditingArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'article</DialogTitle>
            </DialogHeader>
            <ArticleForm
              article={editingArticle}
              onSubmit={async (data) => {
                await updateArticle(editingArticle.id, data)
                setEditingArticle(null)
              }}
              onCancel={() => setEditingArticle(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
