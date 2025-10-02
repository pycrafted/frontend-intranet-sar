  "use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Utensils, MapPin, Clock, ChefHat, Star, Calendar, Users, Sparkles, ArrowRight } from "lucide-react"
import { useMenu } from "@/hooks/useMenu"

interface MenuItem {
  id: number
  name: string
  type: 'senegalese' | 'european'
  type_display?: string
  description?: string
  is_available: boolean
  created_at: string
  updated_at: string
}

interface DayMenu {
  id: number
  day: string
  day_display: string
  date: string
  senegalese: MenuItem
  european: MenuItem
  is_active: boolean
  created_at: string
  updated_at: string
}

export function RestaurantMenu() {
  const { weekMenu, loading, error, fetchWeekMenu } = useMenu()
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  // Charger le menu de la semaine au montage du composant
  useEffect(() => {
    fetchWeekMenu()
  }, [fetchWeekMenu])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  // Fonction pour générer tous les jours de la semaine
  const getWeekDays = () => {
    if (!weekMenu) return []
    
    const weekStart = new Date(weekMenu.week_start)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
    
    return days.map((day, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      
      return {
        day,
        dayName: dayNames[index],
        date: date.toISOString().split('T')[0]
      }
    })
  }

  // Obtenir le type de cuisine avec emoji et couleur
  const getCuisineInfo = (type: string) => {
    switch (type) {
      case 'senegalese':
        return {
          emoji: '🇸🇳',
          name: 'Sénégalais',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          icon: '🍽️'
        }
      case 'european':
        return {
          emoji: '🇪🇺',
          name: 'Européen',
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: '🥘'
        }
      default:
        return {
          emoji: '🍽️',
          name: 'Cuisine',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: '🍽️'
        }
    }
  }

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <Card className="min-h-[24rem] max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
        {/* Effet de brillance subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Icônes décoratives */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <ChefHat className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <Utensils className="h-6 w-6 text-white" />
        </div>
        
        <CardHeader className="pb-4 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  🍽️ Menu de la Semaine
                </CardTitle>
                <p className="text-sm text-gray-600 font-medium">
                  Préparation en cours...
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🍳 Cuisine en action</h3>
              <p className="text-sm text-gray-600">Nos chefs préparent le menu de la semaine...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="min-h-[24rem] max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
        {/* Effet de brillance subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Icônes décoratives */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <ChefHat className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <Utensils className="h-6 w-6 text-white" />
        </div>
        
        <CardHeader className="pb-4 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  🍽️ Menu de la Semaine
                </CardTitle>
                <p className="text-sm text-gray-600 font-medium">
                  Problème de connexion
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">⚠️</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">❌ Erreur de chargement</h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => fetchWeekMenu()}
                className="bg-gradient-to-r from-slate-500 to-blue-600 hover:from-slate-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="sm"
              >
                <span className="flex items-center gap-2">
                  🔄 Réessayer
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weekMenu || !weekMenu.days || weekMenu.days.length === 0) {
    return (
      <Card className="min-h-[24rem] max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
        {/* Effet de brillance subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Icônes décoratives */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <ChefHat className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <Utensils className="h-6 w-6 text-white" />
        </div>
        
        <CardHeader className="pb-4 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  🍽️ Menu de la Semaine
                </CardTitle>
                <p className="text-sm text-gray-600 font-medium">
                  Aucun menu disponible
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🍽️</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📅 Menu en préparation</h3>
              <p className="text-sm text-gray-600">Aucun menu disponible pour cette semaine. Revenez bientôt !</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="min-h-[24rem] max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
      {/* Effet de brillance subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Icônes décoratives */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
        <ChefHat className="h-8 w-8 text-white" />
      </div>
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
        <Utensils className="h-6 w-6 text-white" />
      </div>
      
      <CardHeader className="pb-4 flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                🍽️ Menu de la Semaine
              </CardTitle>
              <p className="text-sm text-gray-600 font-medium">
                Restaurant SAR • 12h-14h
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 h-full overflow-y-auto custom-scrollbar pr-2">
          {getWeekDays().map((dayInfo, index) => {
            const dayMenu = weekMenu.days.find(menu => menu.day === dayInfo.day)
            const senegaleseInfo = getCuisineInfo('senegalese')
            const europeanInfo = getCuisineInfo('european')
            
            return (
              <div 
                key={dayInfo.day} 
                className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-slate-400 hover:bg-white/90 hover:shadow-lg transition-all duration-300 group/day overflow-hidden"
              >
                {/* En-tête du jour avec gradient */}
                <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 p-4 text-gray-900 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg text-center group-hover/day:scale-105 transition-transform duration-300">
                      {dayInfo.dayName}
                    </h3>
                    <p className="text-gray-600 text-sm text-center font-medium">
                      {formatFullDate(dayInfo.date)}
                    </p>
                  </div>
                </div>

                {/* Trait de séparation */}
                <div className="border-t-2 border-slate-400"></div>

                {/* Contenu du jour */}
                <div className="p-4 space-y-4">
                  {dayMenu ? (
                    // Restaurant ouvert - Afficher les plats
                    <>
                      {/* Plat sénégalais */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${senegaleseInfo.color} shadow-sm`}></div>
                          <span className={`text-xs font-bold ${senegaleseInfo.textColor} flex items-center gap-1`}>
                            <span className="text-sm">{senegaleseInfo.emoji}</span>
                            {senegaleseInfo.name}
                          </span>
                        </div>
                        <div className={`${senegaleseInfo.bgColor} ${senegaleseInfo.borderColor} border rounded-lg p-3 group-hover/day:scale-105 transition-transform duration-300`}>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">
                            {dayMenu.senegalese.name}
                          </p>
                          {dayMenu.senegalese.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {dayMenu.senegalese.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Plat européen */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${europeanInfo.color} shadow-sm`}></div>
                          <span className={`text-xs font-bold ${europeanInfo.textColor} flex items-center gap-1`}>
                            <span className="text-sm">{europeanInfo.emoji}</span>
                            {europeanInfo.name}
                          </span>
                        </div>
                        <div className={`${europeanInfo.bgColor} ${europeanInfo.borderColor} border rounded-lg p-3 group-hover/day:scale-105 transition-transform duration-300`}>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">
                            {dayMenu.european.name}
                          </p>
                          {dayMenu.european.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {dayMenu.european.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Menu non renseigné - Afficher l'indicateur
                    <div className="space-y-4">
                      {/* Indicateur de menu non renseigné */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 shadow-sm"></div>
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            <span className="text-sm">📝</span>
                            Menu non renseigné
                          </span>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded-lg p-4 group-hover/day:scale-105 transition-transform duration-300">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center">
                              <span className="text-lg">📝</span>
                            </div>
                            <div className="text-center">
                              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                                Menu en attente
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Le menu de ce jour n'a pas encore été saisi
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
