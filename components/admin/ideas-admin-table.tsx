"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Tag,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Clock,
  XCircle,
  Rocket
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useIdeasAdmin } from "@/hooks/useIdeasAdmin"

interface IdeasAdminTableProps {
  onIdeaSelect?: (idea: any) => void
}

export function IdeasAdminTable({ onIdeaSelect }: IdeasAdminTableProps) {
  const {
    ideas,
    loading,
    error,
    pagination,
    filters,
    selectedIdeas,
    fetchIdeas,
    updateIdeaStatus,
    deleteIdea,
    deleteMultipleIdeas,
    updateMultipleIdeasStatus,
    setFilters,
    setSelectedIdeas,
    clearSelection
  } = useIdeasAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Appliquer la recherche avec debounce
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilters({ search: searchTerm })
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setFilters({ search: searchTerm })
      setIsTyping(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [searchTerm, setFilters])

  const handleDelete = async (ideaId: number) => {
    await deleteIdea(ideaId)
  }

  const handleDeleteMultiple = async () => {
    await deleteMultipleIdeas(selectedIdeas)
    clearSelection()
  }

  const handleStatusChange = async (ideaId: number, status: string) => {
    await updateIdeaStatus(ideaId, status)
  }

  const handleStatusChangeMultiple = async (status: string) => {
    await updateMultipleIdeasStatus(selectedIdeas, status)
    clearSelection()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIdeas(ideas.map(idea => idea.id))
    } else {
      clearSelection()
    }
  }

  const handleSelectIdea = (ideaId: number, checked: boolean) => {
    if (checked) {
      setSelectedIdeas(prev => [...prev, ideaId])
    } else {
      setSelectedIdeas(prev => prev.filter(id => id !== ideaId))
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-orange-100 text-orange-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'implemented': 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      'submitted': Clock,
      'under_review': Eye,
      'approved': CheckCircle,
      'rejected': XCircle,
      'implemented': Rocket
    }
    return icons[status as keyof typeof icons] || Clock
  }

  const getDepartmentIcon = (department: string) => {
    const icons = {
      'production': '🏭',
      'maintenance': '🔧',
      'quality': '✅',
      'safety': '🛡️',
      'logistics': '🚛',
      'it': '💻',
      'hr': '👥',
      'finance': '💰',
      'marketing': '📢',
      'other': '📋'
    }
    return icons[department as keyof typeof icons] || '📋'
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr })
  }

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Database className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chargement des idées...</h3>
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
                onClick={() => fetchIdeas()}
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
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Administration des Idées
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {pagination.total} idée{pagination.total > 1 ? 's' : ''} au total
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
                placeholder="Rechercher dans les idées..."
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

            {/* Filtres */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Département</label>
                  <Select
                    value={filters.department}
                    onValueChange={(value) => setFilters({ department: value })}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Tous les départements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="production">🏭 Production</SelectItem>
                      <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                      <SelectItem value="quality">✅ Qualité</SelectItem>
                      <SelectItem value="safety">🛡️ Sécurité</SelectItem>
                      <SelectItem value="logistics">🚛 Logistique</SelectItem>
                      <SelectItem value="it">💻 Informatique</SelectItem>
                      <SelectItem value="hr">👥 RH</SelectItem>
                      <SelectItem value="finance">💰 Finance</SelectItem>
                      <SelectItem value="marketing">📢 Marketing</SelectItem>
                      <SelectItem value="other">📋 Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Statut</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ status: value })}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="submitted">🕐 Soumise</SelectItem>
                      <SelectItem value="under_review">👁️ En cours d'examen</SelectItem>
                      <SelectItem value="approved">✅ Approuvée</SelectItem>
                      <SelectItem value="rejected">❌ Rejetée</SelectItem>
                      <SelectItem value="implemented">🚀 Implémentée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Période</label>
                  <Select
                    value={filters.time_filter}
                    onValueChange={(value) => setFilters({ time_filter: value })}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Toutes les périodes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Actions en lot</label>
                  <div className="flex gap-2">
                    <Select onValueChange={handleStatusChangeMultiple}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder="Changer statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">🕐 Soumise</SelectItem>
                        <SelectItem value="under_review">👁️ En cours d'examen</SelectItem>
                        <SelectItem value="approved">✅ Approuvée</SelectItem>
                        <SelectItem value="rejected">❌ Rejetée</SelectItem>
                        <SelectItem value="implemented">🚀 Implémentée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Actions en lot */}
            {selectedIdeas.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    {selectedIdeas.length} idée{selectedIdeas.length > 1 ? 's' : ''} sélectionnée{selectedIdeas.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer {selectedIdeas.length} idée{selectedIdeas.length > 1 ? 's' : ''} ? 
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
                  <Button variant="outline" size="sm" onClick={clearSelection} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table des idées */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedIdeas.length === ideas.length && ideas.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Département</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Soumise le</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {ideas.map((idea) => {
                  const StatusIcon = getStatusIcon(idea.status)
                  return (
                    <tr key={idea.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIdeas.includes(idea.id)}
                          onCheckedChange={(checked) => handleSelectIdea(idea.id, checked as boolean)}
                          className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          <p className="text-sm text-gray-900 line-clamp-3">
                            {idea.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getDepartmentIcon(idea.department)}</span>
                          <span className="text-sm text-gray-900">{idea.department_display}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${getStatusColor(idea.status)} border-0 flex items-center gap-1 w-fit`}>
                          <StatusIcon className="h-3 w-3" />
                          {idea.status_display}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500" />
                            {formatDate(idea.submitted_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Select onValueChange={(value) => handleStatusChange(idea.id, value)}>
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">🕐 Soumise</SelectItem>
                              <SelectItem value="under_review">👁️ En cours</SelectItem>
                              <SelectItem value="approved">✅ Approuvée</SelectItem>
                              <SelectItem value="rejected">❌ Rejetée</SelectItem>
                              <SelectItem value="implemented">🚀 Implémentée</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-red-50 text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette idée ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(idea.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium text-blue-700">{pagination.start}</span> à <span className="font-medium text-blue-700">{pagination.end}</span> sur <span className="font-medium text-blue-700">{pagination.total}</span> idées
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: pagination.page - 1 })}
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
                  onClick={() => setFilters({ page: pagination.page + 1 })}
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
    </div>
  )
}
