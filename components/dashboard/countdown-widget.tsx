"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, MapPin, AlertCircle, ChevronRight } from "lucide-react"
import { getNextImportantEvent, getDaysUntilEvent, formatDateFrench, formatTime, type Event } from "@/lib/mock-data"

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownWidget() {
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [nextEvent, setNextEvent] = useState<Event | null>(null)

  useEffect(() => {
    const event = getNextImportantEvent()
    setNextEvent(event)

    if (!event) return

    const updateCountdown = () => {
      const now = new Date()
      const eventDate = new Date(`${event.date}T${event.time}`)
      const diff = eventDate.getTime() - now.getTime()

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-blue-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityGradient = (priority: Event['priority']) => {
    switch (priority) {
      case 'urgent': return 'from-red-500 to-red-600'
      case 'high': return 'from-orange-500 to-orange-600'
      case 'medium': return 'from-blue-500 to-blue-600'
      case 'low': return 'from-gray-500 to-gray-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const isEventToday = () => {
    if (!nextEvent) return false
    const today = new Date()
    const eventDate = new Date(nextEvent.date)
    return today.toDateString() === eventDate.toDateString()
  }

  const isEventSoon = () => {
    return countdown.days <= 1 && countdown.hours <= 6
  }

  if (!nextEvent) {
    return (
      <Card className="h-[28rem] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Prochain Événement
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun événement important prévu</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`h-[28rem] flex flex-col overflow-hidden ${isEventSoon() ? 'ring-2 ring-orange-200' : ''}`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Prochain Événement
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${getPriorityColor(nextEvent.priority)} text-white border-0`}
          >
            {nextEvent.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-6">
        {/* Informations de l'événement */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {nextEvent.title}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDateFrench(nextEvent.date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(nextEvent.time)}</span>
            </div>
            
            {nextEvent.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{nextEvent.location}</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {nextEvent.description}
          </p>
        </div>

        {/* Compte à rebours */}
        <div className="space-y-4">
          {isEventToday() && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Événement aujourd'hui !
              </span>
            </div>
          )}
          
          <div className={`p-6 rounded-lg bg-gradient-to-br ${getPriorityGradient(nextEvent.priority)} text-white`}>
            <div className="text-center">
              <h4 className="text-sm font-medium mb-4 opacity-90">
                {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0
                  ? "L'événement a commencé !"
                  : "Temps restant"
                }
              </h4>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {countdown.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80">Jours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {countdown.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80">Heures</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {countdown.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {countdown.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80">Secondes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => {
              // Ici on pourrait ouvrir un modal avec plus de détails
            }}
          >
            Voir détails
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
