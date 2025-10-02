"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { EventForm } from "./event-form"
import { useEvents, Event, EventCreateUpdate } from "@/hooks/useEvents"

interface EventManagementProps {
  onEventSelect?: (event: Event) => void
}

export function EventManagement({ onEventSelect }: EventManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    time_filter: "all"
  })

  const {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventTypeIcon,
    getEventTypeColor,
    formatEventDate,
    formatEventTime
  } = useEvents()

  // Charger les événements au montage
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filters.type === "all" || event.type === filters.type
    
    const matchesStatus = (() => {
      if (filters.status === "all") return true
      if (filters.status === "past") return event.is_past
      if (filters.status === "today") return event.is_today
      if (filters.status === "future") return event.is_future
      return true
    })()

    const matchesTimeFilter = (() => {
      if (filters.time_filter === "all") return true
      const eventDate = new Date(event.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (filters.time_filter === "today") {
        return eventDate.toDateString() === today.toDateString()
      }
      if (filters.time_filter === "week") {
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return eventDate >= weekAgo
      }
      if (filters.time_filter === "month") {
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return eventDate >= monthAgo
      }
      return true
    })()

    return matchesSearch && matchesType && matchesStatus && matchesTimeFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + pageSize)

  // Pagination info
  const pagination = {
    page: currentPage,
    total_pages: totalPages,
    total: filteredEvents.length,
    start: startIndex + 1,
    end: Math.min(startIndex + pageSize, filteredEvents.length)
  }

  // Handlers
  const handleCreateEvent = async (data: EventCreateUpdate) => {
    const result = await createEvent(data)
    if (result) {
      setIsCreateDialogOpen(false)
    }
  }

  const handleUpdateEvent = async (data: EventCreateUpdate) => {
    if (editingEvent) {
      const result = await updateEvent(editingEvent.id, data)
      if (result) {
        setEditingEvent(null)
      }
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    const success = await deleteEvent(eventId)
    if (success) {
      setCurrentPage(1)
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
  }


  // Gestion de la sélection
  const handleSelectEvent = (eventId: number, checked: boolean) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, eventId])
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(paginatedEvents.map(event => event.id))
    } else {
      setSelectedEvents([])
    }
  }

  const clearSelection = () => {
    setSelectedEvents([])
  }

  // Fonctions utilitaires
  const getTypeColor = (type: string) => {
    const colors = {
      meeting: "bg-blue-100 text-blue-700",
      training: "bg-green-100 text-green-700",
      celebration: "bg-yellow-100 text-yellow-700",
      conference: "bg-purple-100 text-purple-700",
      other: "bg-gray-100 text-gray-700"
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const getTypeDisplay = (type: string) => {
    const displays = {
      meeting: "Réunion",
      training: "Formation",
      celebration: "Célébration",
      conference: "Conférence",
      other: "Autre"
    }
    return displays[type as keyof typeof displays] || "Autre"
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => fetchEvents()} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec style cohérent */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Database className="h-5 w-5 text-blue-600" />
                  Administration des Événements
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {pagination.total} événement{pagination.total > 1 ? 's' : ''} au total
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
                    Nouvel Événement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel événement</DialogTitle>
                  </DialogHeader>
                  <EventForm
                    onSubmit={handleCreateEvent}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Barre de recherche et filtres avec style inspiré de la page actualités */}
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Barre de recherche avec style cohérent */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Rechercher dans les événements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            {/* Filtres avec style cohérent */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Type</label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="meeting">Réunion</SelectItem>
                      <SelectItem value="training">Formation</SelectItem>
                      <SelectItem value="celebration">Célébration</SelectItem>
                      <SelectItem value="conference">Conférence</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Statut</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="past">Passés</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="future">À venir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Période</label>
                  <Select
                    value={filters.time_filter}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, time_filter: value }))}
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

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ type: "all", status: "all", time_filter: "all" })}
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}

            {/* Actions en lot avec style cohérent */}
            {selectedEvents.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    {selectedEvents.length} événement{selectedEvents.length > 1 ? 's' : ''} sélectionné{selectedEvents.length > 1 ? 's' : ''}
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
                          Êtes-vous sûr de vouloir supprimer {selectedEvents.length} événement{selectedEvents.length > 1 ? 's' : ''} ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          selectedEvents.forEach(id => handleDeleteEvent(id))
                          clearSelection()
                        }}>
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

      {/* Table des événements avec style inspiré de la page actualités */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedEvents.length === paginatedEvents.length && paginatedEvents.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Titre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Lieu</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Participants</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {paginatedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                        className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        {event.description && (
                          <p key={`desc-${event.id}`} className="text-xs text-gray-500 truncate mt-1">
                            {event.description.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getTypeColor(event.type)} border-0`}>
                        {getTypeDisplay(event.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-500" />
                          {formatDate(event.date)}
                        </div>
                        {event.time && !event.is_all_day && (
                          <div key={`time-${event.id}`} className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </div>
                        )}
                        {event.is_all_day && (
                          <div key={`allday-${event.id}`} className="text-xs text-gray-500 mt-1">
                            Toute la journée
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-500" />
                        {event.attendees}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant="outline"
                        className={
                          event.is_past 
                            ? "bg-red-100 text-red-700 border-red-200" 
                            : event.is_today
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-green-100 text-green-700 border-green-200"
                        }
                      >
                        {event.is_past ? "Passé" : event.is_today ? "Aujourd'hui" : "À venir"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          key={`edit-${event.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                          className="hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog key={`delete-dialog-${event.id}`}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-red-50 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>
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
                Affichage de <span className="font-medium text-blue-700">{pagination.start}</span> à <span className="font-medium text-blue-700">{pagination.end}</span> sur <span className="font-medium text-blue-700">{pagination.total}</span> événements
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
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
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'événement</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'événement sélectionné
              </DialogDescription>
            </DialogHeader>
            <EventForm
              event={editingEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => setEditingEvent(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
