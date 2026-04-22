"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Timer, Pencil, Loader2, Trash2 } from "lucide-react"
import { useEvents, Event } from "@/hooks/useEvents"
import { useAuth } from "@/hooks/useAuth"
import { API_CONFIG } from "@/lib/config"


const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

// ── Modal création d'événement ────────────────────────────────────────────────

function EventCreateModal({ open, onClose, onCreated }: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [form, setForm] = useState({ title: '', date: '', time: '', location: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, string> = { title: form.title, date: form.date }
      if (form.time)     body.time     = form.time
      if (form.location) body.location = form.location

      const res = await fetch(`${API_CONFIG.ACCUEIL}/events/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.detail || data?.title?.[0] || `Erreur ${res.status}`)
      onCreated()
      onClose()
      setForm({ title: '', date: '', time: '', location: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ width: '460px', maxWidth: 'calc(100vw - 2rem)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Nouvel événement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Titre *</label>
            <input
              required
              placeholder="Intitulé de l'événement"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Date *</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Heure</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Lieu</label>
            <input
              placeholder="Salle, adresse…"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white">
              {saving
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Enregistrement…</>
                : 'Créer l\'événement'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Modal suppression d'événement ────────────────────────────────────────────

function EventDeleteModal({ event, onClose, onDeleted }: {
  event: Event | null
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!event) return null

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`${API_CONFIG.ACCUEIL}/events/${event.id}/`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok && res.status !== 204) throw new Error(`Erreur ${res.status}`)
      onDeleted()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent style={{ width: '420px', maxWidth: 'calc(100vw - 2rem)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Détail de l'événement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <p className="font-semibold text-slate-800 text-base">{event.title}</p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-rose-400" />
              {event.date_formatted}
            </span>
            {event.time_formatted && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                {event.time_formatted}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                {event.location}
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-slate-500 mb-3">Confirmer la suppression de cet événement ?</p>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={deleting} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {deleting
                  ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Suppression…</>
                  : <><Trash2 className="h-3.5 w-3.5 mr-1.5" />Supprimer</>
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export function EventsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredEvent, setHoveredEvent] = useState<{event: Event, position: {x: number, y: number}} | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  // Utiliser le hook useEvents pour récupérer les données
  const { events, loading, error, fetchEvents } = useEvents()

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Obtenir le premier jour du mois et le nombre de jours
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Générer les jours du calendrier
  const calendarDays = []
  
  // Jours du mois précédent
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = new Date(currentYear, currentMonth, -i)
    calendarDays.push({ date: day, isCurrentMonth: false, isToday: false })
  }
  
  // Jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const isToday = date.toDateString() === new Date().toDateString()
    calendarDays.push({ date, isCurrentMonth: true, isToday })
  }
  
  // Jours du mois suivant pour compléter la grille
  const remainingDays = 42 - calendarDays.length // 6 semaines * 7 jours
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(currentYear, currentMonth + 1, day)
    calendarDays.push({ date, isCurrentMonth: false, isToday: false })
  }

  // Charger les événements au montage du composant
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Obtenir les événements pour le mois actuel
  const monthEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === currentMonth && 
           eventDate.getFullYear() === currentYear
  })

  // Obtenir les événements futurs (aujourd'hui inclus)
  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })

  // Obtenir les événements pour une date spécifique
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Fonction pour calculer le prochain événement et le nombre de jours restants
  const getNextEventInfo = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normaliser à minuit pour la comparaison
    
    // Filtrer les événements futurs (aujourd'hui inclus)
    const futureEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate >= today
    })
    
    if (futureEvents.length === 0) {
      return { event: null, daysRemaining: null }
    }
    
    // Trier par date croissante pour obtenir le prochain
    futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const nextEvent = futureEvents[0]
    
    // Calculer la différence en jours
    const eventDate = new Date(nextEvent.date)
    eventDate.setHours(0, 0, 0, 0)
    const timeDiff = eventDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return { 
      event: nextEvent, 
      daysRemaining
    }
  }

  // Utiliser les fonctions du hook useEvents
  const getEventTypeColorClass = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'training':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'celebration':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'conference':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Fonction pour vérifier si une date a des événements
  const hasEvent = (date: Date) => {
    const events = getEventsForDate(date)
    return events.length > 0
  }

  // Fonction pour obtenir le premier événement d'une date
  const getFirstEvent = (date: Date) => {
    const events = getEventsForDate(date)
    return events[0] || null
  }

  // Fonction pour obtenir l'émoji neutre pour tous les événements
  const getEventEmoji = (event: Event) => {
    return '◉' // Cercle plein plus élégant et neutre
  }

  // Fonction pour obtenir la couleur de fond neutre pour tous les événements
  const getEventColor = (event: Event) => {
    return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' // Couleur neutre pour tous les événements
  }

  // Afficher un état de chargement si nécessaire
  if (loading) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 border-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </Card>
    )
  }

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 border-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erreur lors du chargement</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </Card>
    )
  }

  // Fonctions pour gérer le survol
  const handleMouseEnter = (event: Event, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    setHoveredEvent({
      event,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    })
  }

  const handleMouseLeave = () => {
    setHoveredEvent(null)
  }

  return (
    <div className="contents">
    <EventCreateModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onCreated={fetchEvents}
    />
    <EventDeleteModal
      event={selectedEvent}
      onClose={() => setSelectedEvent(null)}
      onDeleted={fetchEvents}
    />
    <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden relative">
      {/* Effet de brillance subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-200/40 via-transparent to-pink-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg group-hover:shadow-rose-300/50 group-hover:scale-105 transition-all duration-300">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900 leading-tight">
                Événements
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {futureEvents.length} événement{futureEvents.length > 1 ? 's' : ''} à venir
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {(() => {
              const nextEventInfo = getNextEventInfo()
              
              return (
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                    <span className="text-[9px] sm:text-xs text-gray-600 metadata-text">J-{nextEventInfo.daysRemaining}</span>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
        
        {/* Navigation du mois */}
        <div className="flex items-center justify-between mt-2 sm:mt-3 md:mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="p-1 sm:p-1.5 md:p-2 border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 sm:border-rose-200 sm:bg-transparent sm:text-rose-600 sm:hover:bg-rose-50 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all duration-200"
          >
            <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          </Button>
          
          <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800 widget-title">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-1 sm:p-1.5 md:p-2 border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 sm:border-rose-200 sm:bg-transparent sm:text-rose-600 sm:hover:bg-rose-50 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all duration-200"
          >
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0.5 sm:p-1 md:p-0 flex-1 overflow-hidden relative z-10 flex flex-col">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-0.5 px-0.5 sm:px-1 pb-0.5 flex-shrink-0">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[8px] sm:text-[9px] font-bold text-gray-500 py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier - Toutes les cellules ont la même taille */}
        <div className="grid grid-cols-7 gap-0.5 px-0.5 sm:px-1 pb-0.5 sm:pb-1 flex-1 min-h-0 auto-rows-fr">
          {calendarDays.map((dayData, index) => {
            const dayEvents = getEventsForDate(dayData.date)
            const hasEventOnDate = hasEvent(dayData.date)
            const firstEvent = getFirstEvent(dayData.date)
            
            return (
              <div
                key={index}
                className={`
                  flex flex-col h-full p-0.5 border rounded-sm
                  transition-all duration-300 relative group
                  ${!dayData.isCurrentMonth 
                    ? 'bg-gray-50/5 text-gray-200 opacity-5 cursor-default border-gray-200/30' 
                    : 'bg-white/90 cursor-pointer hover:bg-white/70 border-gray-200/30'
                  }
                  ${dayData.isToday ? 'bg-white/90 border-red-300' : ''}
                  ${hasEventOnDate && firstEvent && dayData.isCurrentMonth ? 'bg-gradient-to-br from-rose-100 via-pink-100 to-rose-50 border-2 border-rose-400 shadow-lg hover:shadow-xl hover:scale-105 animate-shimmer-event' : ''}
                `}
                onClick={() => {
                  if (isAdmin && hasEventOnDate && firstEvent) setSelectedEvent(firstEvent)
                }}
                onMouseEnter={dayData.isCurrentMonth && hasEventOnDate && firstEvent ? (e) => handleMouseEnter(firstEvent, e.currentTarget) : undefined}
                onMouseLeave={dayData.isCurrentMonth && hasEventOnDate ? handleMouseLeave : undefined}
              >
                {/* Numéro du jour avec style dynamique pour les événements */}
                <div className={`
                  text-[9px] font-bold mb-0.5 leading-tight flex-shrink-0 relative
                  ${dayData.isToday ? 'text-red-600 font-bold' : ''}
                  ${!dayData.isCurrentMonth ? 'text-gray-200' : 'text-gray-700'}
                  ${hasEventOnDate && firstEvent && dayData.isCurrentMonth ? 'text-rose-600 font-extrabold text-[10px]' : ''}
                `}>
                  {dayData.date.getDate()}
                  {/* Badge lumineux pour les dates avec événements */}
                  {hasEventOnDate && firstEvent && dayData.isCurrentMonth && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full animate-ping opacity-75"></span>
                  )}
                </div>
                
                {/* Point rouge retiré - Plus d'affichage au milieu de la date */}
              </div>
            )
          })}
        </div>


      </CardContent>

      {/* Bouton admin ajout événement */}
      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          title="Ajouter un événement"
          className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-400 hover:text-rose-600 shadow-md"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {/* Tooltip en portail pour éviter les coupures */}
      {hoveredEvent && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: hoveredEvent.position.x,
            top: hoveredEvent.position.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 min-w-[200px] max-w-[300px]">
            {/* Titre + date à droite */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getEventEmoji(hoveredEvent.event)}</span>
                <span className="font-semibold leading-tight">{hoveredEvent.event.title}</span>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-[10px] text-rose-300 font-medium">
                  {hoveredEvent.event.date_formatted}
                </span>
                {hoveredEvent.event.time_formatted && (
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-gray-400">
                    <Clock className="h-2.5 w-2.5" />
                    {hoveredEvent.event.time_formatted}
                  </div>
                )}
              </div>
            </div>
            {hoveredEvent.event.location && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                {hoveredEvent.event.location}
              </div>
            )}
            {/* Flèche du tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>,
        document.body
      )}
    </Card>
    </div>
  )
}
