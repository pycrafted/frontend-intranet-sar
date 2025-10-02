"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, Timer } from "lucide-react"
import { useEvents, Event } from "@/hooks/useEvents"


const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

export function EventsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredEvent, setHoveredEvent] = useState<{event: Event, position: {x: number, y: number}} | null>(null)
  
  // Utiliser le hook useEvents pour récupérer les données
  const { 
    events, 
    loading, 
    error, 
    fetchEvents, 
    fetchNextEvent, 
    formatEventDate, 
    formatEventTime, 
    getEventTypeIcon, 
    getEventTypeColor,
    getDaysUntilNextEvent
  } = useEvents()

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
      return { event: null, daysRemaining: null, message: "Aucun événement prévu" }
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
      daysRemaining, 
      message: daysRemaining === 0 ? "Aujourd'hui" : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
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
      <Card className="h-[28rem] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 border-0 flex items-center justify-center">
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
      <Card className="h-[28rem] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 border-0 flex items-center justify-center">
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
    <Card className="h-[28rem] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden relative">
      {/* Effet de brillance subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-200/40 via-transparent to-pink-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="pb-4 flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-rose-200 group-hover:scale-110 transition-all duration-300">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-rose-700 transition-colors duration-300">
                📅 Événements
              </CardTitle>
              <p className="text-sm text-gray-600 font-medium">
                {futureEvents.length} événement{futureEvents.length > 1 ? 's' : ''} à venir
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {(() => {
              const nextEventInfo = getNextEventInfo()
              const isUrgent = nextEventInfo.daysRemaining !== null && nextEventInfo.daysRemaining <= 3
              const isToday = nextEventInfo.daysRemaining === 0
              
              return (
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Timer className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">Prochain événement</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`text-sm font-bold px-2 py-1 rounded-full ${
                      isToday 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : isUrgent 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      {nextEventInfo.message}
                    </div>
                    {nextEventInfo.event && (
                      <div className="text-xs text-gray-500 max-w-40 truncate bg-white/50 px-2 py-1 rounded border border-gray-200">
                        {nextEventInfo.event.title}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
        
        {/* Navigation du mois */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="p-2 border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold text-gray-800">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-2 border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden relative z-10 flex flex-col">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-0.5 px-1 pb-0.5 flex-shrink-0">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[9px] font-bold text-gray-500 py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-0.5 px-1 pb-1 flex-1 min-h-0">
          {calendarDays.map((dayData, index) => {
            const dayEvents = getEventsForDate(dayData.date)
            const hasEventOnDate = hasEvent(dayData.date)
            const firstEvent = getFirstEvent(dayData.date)
            
            return (
              <div
                key={index}
                className={`
                  flex flex-col min-h-[1.8rem] p-0.5 border border-gray-200/30 rounded-sm
                  transition-all duration-200 relative group
                  ${!dayData.isCurrentMonth 
                    ? 'bg-gray-50/5 text-gray-200 opacity-5 cursor-default' 
                    : 'bg-white/90 cursor-pointer hover:bg-white/70'
                  }
                  ${dayData.isToday ? 'bg-red-100 border-red-300' : ''}
                  ${hasEventOnDate && firstEvent ? getEventColor(firstEvent) : ''}
                `}
                onClick={() => {}}
                onMouseEnter={dayData.isCurrentMonth && hasEventOnDate && firstEvent ? (e) => handleMouseEnter(firstEvent, e.currentTarget) : undefined}
                onMouseLeave={dayData.isCurrentMonth && hasEventOnDate ? handleMouseLeave : undefined}
              >
                {/* Numéro du jour */}
                <div className={`
                  text-[9px] font-bold mb-0.5 leading-tight flex-shrink-0
                  ${dayData.isToday ? 'text-red-600 font-bold' : ''}
                  ${!dayData.isCurrentMonth ? 'text-gray-200' : 'text-gray-700'}
                `}>
                  {dayData.date.getDate()}
                </div>
                
                {/* Émoji d'événement */}
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  {hasEventOnDate && firstEvent && (
                    <span className={`text-sm flex items-center justify-center w-full h-full ${
                      !dayData.isCurrentMonth ? 'opacity-5' : 'opacity-80'
                    }`}>
                      {getEventEmoji(firstEvent)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>


      </CardContent>

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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{getEventEmoji(hoveredEvent.event)}</span>
              <span className="font-semibold">{hoveredEvent.event.title}</span>
            </div>
            <div className="text-gray-300 text-[10px] leading-tight">
              {hoveredEvent.event.description}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
              {!hoveredEvent.event.is_all_day && hoveredEvent.event.time_formatted && (
                <span>🕐 {hoveredEvent.event.time_formatted}</span>
              )}
              <span>📍 {hoveredEvent.event.location}</span>
            </div>
            {/* Flèche du tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>,
        document.body
      )}
    </Card>
  )
}
