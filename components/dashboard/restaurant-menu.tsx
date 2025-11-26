"use client"



import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"

import { Utensils, MapPin, Clock, ChefHat, Star, Calendar, Users, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

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

  senegalese: string

  european: string

  dessert?: string | null

  is_active: boolean

  created_at: string

  updated_at: string

}



// Hook pour détecter la taille du widget depuis le localStorage
function useWidgetSize() {
  const [size, setSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium')
  
  useEffect(() => {
    // Lire la taille depuis le localStorage au lieu de la détecter par la largeur
    const updateSize = () => {
      try {
        const savedWidgets = localStorage.getItem('dashboard-widgets')
        console.log('[RestaurantMenu] 🔍 Lecture du localStorage:', savedWidgets ? 'trouvé' : 'vide')
        
        if (savedWidgets) {
          const widgets = JSON.parse(savedWidgets)
          console.log('[RestaurantMenu] 📦 Widgets chargés:', widgets.length, 'widgets')
          
          const menuWidget = widgets.find((w: any) => w.id === 'menu' || w.type === 'menu')
          console.log('[RestaurantMenu] 🍽️ Widget menu trouvé:', menuWidget ? `Oui (size: ${menuWidget.size})` : 'Non')
          
          if (menuWidget && menuWidget.size) {
            console.log('[RestaurantMenu] ✅ Définition de la taille à:', menuWidget.size)
            // Utiliser la fonction callback pour éviter les problèmes de closure
            setSize((prevSize) => {
              if (prevSize !== menuWidget.size) {
                console.log('[RestaurantMenu] 🔄 Changement de taille détecté:', { from: prevSize, to: menuWidget.size })
                return menuWidget.size
              }
              return prevSize
            })
            return
          }
        }
        // Si pas trouvé dans localStorage, utiliser la valeur par défaut depuis WIDGET_CONFIG
        console.log('[RestaurantMenu] ⚠️ Widget menu non trouvé, utilisation de la taille par défaut: medium')
        setSize((prevSize) => prevSize !== 'medium' ? 'medium' : prevSize)
      } catch (error) {
        console.error('[RestaurantMenu] ❌ Erreur lors de la lecture de la taille du widget:', error)
        setSize((prevSize) => prevSize !== 'medium' ? 'medium' : prevSize)
      }
    }
    
    // Lire la taille initiale
    console.log('[RestaurantMenu] 🚀 Initialisation du hook useWidgetSize')
    updateSize()
    
    // Écouter les changements dans le localStorage (entre onglets)
    const handleStorageChange = () => {
      console.log('[RestaurantMenu] 📡 Événement storage détecté')
      updateSize()
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Écouter les changements dans la même fenêtre via un événement personnalisé
    const handleWidgetChange = (event?: Event) => {
      console.log('[RestaurantMenu] 🔔 Événement dashboard-widgets-changed détecté', event)
      // Petit délai pour s'assurer que le localStorage est bien mis à jour
      setTimeout(() => {
        console.log('[RestaurantMenu] ⏳ Mise à jour différée après événement')
        updateSize()
      }, 50)
    }
    window.addEventListener('dashboard-widgets-changed', handleWidgetChange)
    
    // Vérifier périodiquement (fallback si les événements ne fonctionnent pas)
    // Utiliser une ref pour éviter les problèmes de closure
    const interval = setInterval(() => {
      try {
        const currentSaved = localStorage.getItem('dashboard-widgets')
        if (currentSaved) {
          const currentMenuWidget = JSON.parse(currentSaved).find((w: any) => w.id === 'menu' || w.type === 'menu')
          const currentSize = currentMenuWidget?.size || 'medium'
          // Utiliser setSize avec callback pour comparer avec la valeur actuelle
          setSize((prevSize) => {
            if (prevSize !== currentSize) {
              console.log('[RestaurantMenu] ⏰ Vérification périodique: taille différente détectée', { currentSize, prevSize })
              return currentSize
            }
            return prevSize
          })
        }
      } catch (error) {
        console.error('[RestaurantMenu] ❌ Erreur dans la vérification périodique:', error)
      }
    }, 1000)
    
    return () => {
      console.log('[RestaurantMenu] 🧹 Nettoyage des event listeners')
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('dashboard-widgets-changed', handleWidgetChange)
      clearInterval(interval)
    }
  }, [])
  
  console.log('[RestaurantMenu] 📊 Taille actuelle du widget:', size)
  return size
}



export function RestaurantMenu() {

  const { weekMenu, loading, error, fetchWeekMenu } = useMenu()

  const [currentDayIndex, setCurrentDayIndex] = useState(0)

  const widgetSize = useWidgetSize()

  // Gestion du swipe pour mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Distance minimale pour déclencher un swipe
  const minSwipeDistance = 50



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
    const days = ['monday', 'tuesday', 'wednesday', 'thursday']
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi']
    
    // Obtenir la date d'aujourd'hui
    const today = new Date()

    const todayString = today.toISOString().split('T')[0]

    

    return days.map((day, index) => {

      const date = new Date(weekStart)

      date.setDate(weekStart.getDate() + index)

      const dateString = date.toISOString().split('T')[0]

      

      return {

        day,

        dayName: dayNames[index],

        date: dateString,

        isToday: dateString === todayString

      }

    })

  }



  // Fonctions de navigation pour la pagination mobile

  const goToNextDay = () => {

    const weekDays = getWeekDays()

    setCurrentDayIndex((prevIndex) => 

      prevIndex === weekDays.length - 1 ? 0 : prevIndex + 1

    )

  }



  const goToPreviousDay = () => {

    const weekDays = getWeekDays()

    setCurrentDayIndex((prevIndex) => 

      prevIndex === 0 ? weekDays.length - 1 : prevIndex - 1

    )

  }



  const goToDay = (index: number) => {

    setCurrentDayIndex(index)

  }

  // Gestion du swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNextDay()
    }
    if (isRightSwipe) {
      goToPreviousDay()
    }
  }



  // Initialiser l'index sur le jour d'aujourd'hui si disponible

  useEffect(() => {

    if (weekMenu && weekMenu.days && weekMenu.week_start) {
      const weekStart = new Date(weekMenu.week_start)
      const days = ['monday', 'tuesday', 'wednesday', 'thursday']
    const today = new Date()

    const todayString = today.toISOString().split('T')[0]

    

    const todayIndex = days.findIndex((_, index) => {

      const date = new Date(weekStart)

      date.setDate(weekStart.getDate() + index)

      const dateString = date.toISOString().split('T')[0]

      return dateString === todayString

    })

    

    if (todayIndex !== -1) {

      setCurrentDayIndex(todayIndex)

      }
    }

  }, [weekMenu])



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



  // Fonction pour obtenir un nom de dessert selon le jour
  const getDessertName = (day: string) => {
    const desserts: { [key: string]: string } = {
      'monday': 'Tiramisu',
      'tuesday': 'Mousse au chocolat',
      'wednesday': 'Tarte aux pommes',
      'thursday': 'Crème brûlée',
    }
    return desserts[day] || 'Dessert du jour'
  }

  // Configuration responsive basée sur la taille du widget et l'écran
  const getResponsiveConfig = () => {
    const baseConfig = {
      small: {
        cardHeight: 'h-[20rem] sm:h-[22rem]',
        headerPadding: 'pb-2 sm:pb-3',
        contentPadding: 'p-1 sm:p-2',
        titleSize: 'text-sm sm:text-base',
        subtitleSize: 'text-xs sm:text-sm',
        dayTitleSize: 'text-xs sm:text-sm',
        dayDateSize: 'text-[10px] sm:text-xs',
        platTextSize: 'text-[10px] sm:text-xs',
        platLabelSize: 'text-[10px] sm:text-xs',
        gapSize: 'gap-1 sm:gap-1.5',
        paddingSize: 'p-1 sm:p-1.5'
      },
      medium: {
        cardHeight: 'h-[26rem] sm:h-[28rem] lg:h-[28rem]',
        headerPadding: 'pb-2 sm:pb-3 lg:pb-4',
        contentPadding: 'p-1 sm:p-2 md:p-2',
        titleSize: 'text-base sm:text-lg lg:text-xl',
        subtitleSize: 'text-xs sm:text-sm',
        dayTitleSize: 'text-sm sm:text-base lg:text-lg',
        dayDateSize: 'text-xs sm:text-sm',
        platTextSize: 'text-xs sm:text-sm',
        platLabelSize: 'text-[10px] sm:text-xs',
        gapSize: 'gap-2 sm:gap-2.5',
        paddingSize: 'p-1.5 sm:p-2 md:p-3'
      },
      large: {
        cardHeight: 'h-[26rem] sm:h-[28rem] lg:h-[28rem]',
        headerPadding: 'pb-3 sm:pb-4 lg:pb-6',
        contentPadding: 'p-2 sm:p-3 lg:p-4',
        titleSize: 'text-lg sm:text-xl',
        subtitleSize: 'text-sm',
        dayTitleSize: 'text-base sm:text-lg lg:text-xl',
        dayDateSize: 'text-sm sm:text-base',
        platTextSize: 'text-sm sm:text-base',
        platLabelSize: 'text-xs sm:text-sm',
        gapSize: 'gap-2.5 sm:gap-3',
        paddingSize: 'p-2 sm:p-3 lg:p-4'
      },
      full: {
        cardHeight: 'h-[24rem] sm:h-[28rem] lg:h-[32rem]',
        headerPadding: 'pb-4 sm:pb-6 lg:pb-8',
        contentPadding: 'p-3 sm:p-4 lg:p-6 xl:p-8',
        titleSize: 'text-xl sm:text-2xl',
        subtitleSize: 'text-sm sm:text-base',
        dayTitleSize: 'text-lg sm:text-xl lg:text-2xl',
        dayDateSize: 'text-sm sm:text-base lg:text-lg',
        platTextSize: 'text-base sm:text-lg lg:text-xl',
        platLabelSize: 'text-sm sm:text-base lg:text-lg',
        gapSize: 'gap-3 sm:gap-4 lg:gap-6',
        paddingSize: 'p-3 sm:p-4 lg:p-6'
      }
    }
    
    return baseConfig[widgetSize] || baseConfig.medium
  }

  const config = getResponsiveConfig()
  
  console.log('[RestaurantMenu] 🎨 Configuration responsive appliquée:', {
    widgetSize,
    cardHeight: config.cardHeight,
    titleSize: config.titleSize
  })

  // Gestion des états de chargement et d'erreur

  if (loading) {

    return (

      <Card className={`${config.cardHeight} bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative`} data-widget-id="menu">

        {/* Effet de brillance subtil */}

        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        

        {/* Icônes décoratives - Responsive */}

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">

          <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />

        </div>

        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">

          <Utensils className="h-4 w-4 sm:h-6 sm:w-6 text-white" />

        </div>

        

        <CardHeader className="pb-2 sm:pb-4 flex-shrink-0 relative z-10 p-2 sm:p-3 md:p-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-2 sm:space-x-3">

              <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">

                <ChefHat className="h-4 w-4 sm:h-6 sm:w-6 text-white" />

              </div>

              <div>

                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">

                  <span className="hidden sm:inline">Menu de la Semaine</span>

                  <span className="sm:hidden">Menu</span>

                </CardTitle>

                <p className="text-xs sm:text-sm text-gray-600 font-medium">

                  Préparation en cours...

                </p>

              </div>

            </div>

          </div>

        </CardHeader>

        

        <CardContent className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">

          <div className="text-center">

            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">

              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>

            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50 shadow-sm">

              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">🍳 Cuisine en action</h3>

              <p className="text-xs sm:text-sm text-gray-600">Nos chefs préparent le menu de la semaine...</p>

            </div>

          </div>

        </CardContent>

      </Card>

    )

  }



  if (error) {

    return (

      <Card className={`${config.cardHeight} bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative`} data-widget-id="menu">

        {/* Effet de brillance subtil */}

        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        

        {/* Icônes décoratives - Responsive */}

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">

          <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />

        </div>

        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">

          <Utensils className="h-4 w-4 sm:h-6 sm:w-6 text-white" />

        </div>

        

        <CardHeader className="pb-2 sm:pb-4 flex-shrink-0 relative z-10 p-2 sm:p-3 md:p-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-2 sm:space-x-3">

              <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">

                <ChefHat className="h-4 w-4 sm:h-6 sm:w-6 text-white" />

              </div>

              <div>

                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">

                  <span className="hidden sm:inline">Menu de la Semaine</span>

                  <span className="sm:hidden">Menu</span>

                </CardTitle>

                <p className="text-xs sm:text-sm text-gray-600 font-medium">

                  Problème de connexion

                </p>

              </div>

            </div>

          </div>

        </CardHeader>

        

        <CardContent className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">

          <div className="text-center">

            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">

              <span className="text-2xl sm:text-4xl">⚠️</span>

            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50 shadow-sm">

              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">❌ Erreur de chargement</h3>

              <p className="text-xs sm:text-sm text-gray-600 mb-4">{error}</p>

              <Button 

                onClick={() => fetchWeekMenu()}

                className="bg-gradient-to-r from-slate-500 to-blue-600 hover:from-slate-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2"

                size="sm"

              >

                <span className="flex items-center gap-1 sm:gap-2">

                  🔄 <span className="hidden sm:inline">Réessayer</span>

                  <span className="sm:hidden">Retry</span>

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

      <Card className={`${config.cardHeight} bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative`} data-widget-id="menu">
      {/* Effet de brillance subtil */}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      

      {/* Icônes décoratives - Responsive */}

      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">

        <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />

      </div>

        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <Utensils className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
      

        <CardHeader className="pb-2 sm:pb-4 flex-shrink-0 relative z-10 p-2 sm:p-3 md:p-6">
        <div className="flex items-center justify-between">

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                <ChefHat className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>

            <div>

              <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">

                <span className="hidden sm:inline">Menu de la Semaine</span>

                <span className="sm:hidden">Menu</span>

              </CardTitle>

                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Aucun menu disponible
              </p>

            </div>

          </div>

        </div>

      </CardHeader>

      

        <CardContent className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl sm:text-4xl">🍽️</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Menu en préparation</h3>
              <p className="text-xs sm:text-sm text-gray-600">Aucun menu disponible pour cette semaine. Revenez bientôt !</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${config.cardHeight} bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative`} data-widget-id="menu">
      {/* Effet de brillance subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="flex-1 overflow-hidden relative z-10 p-0 sm:p-2 md:p-2 flex items-center justify-center">
        {/* Design responsive : Pagination sur mobile, grille sur desktop */}
        <div className="block sm:hidden w-full h-full">
          {/* Version mobile : Pagination avec un jour à la fois avec swipe */}
          <div 
            className="relative w-full h-full flex flex-col"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Carte du jour actuel - Optimisée pour l'espace mobile */}
            {getWeekDays().length > 0 && (() => {
              const weekDays = getWeekDays()
              const safeIndex = Math.min(currentDayIndex, weekDays.length - 1)
              const dayInfo = weekDays[safeIndex]
              const dayMenu = weekMenu.days.find(menu => menu.day === dayInfo.day)
              const senegaleseInfo = getCuisineInfo('senegalese')
              const europeanInfo = getCuisineInfo('european')
              
              return (
                <div 
                  key={dayInfo.day} 
                  className="w-full h-full backdrop-blur-sm rounded-lg border border-slate-300 bg-white/90 hover:bg-white hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* En-tête du jour compact - Optimisé pour mobile */}
                  <div className="flex-shrink-0 p-2 text-gray-900 bg-gradient-to-r from-slate-100 to-blue-100">
                    <h3 className="font-bold text-sm text-center">
                      {dayInfo.dayName}
                    </h3>
                    <p className="text-xs text-center text-gray-600">
                      {formatDate(dayInfo.date)}
                    </p>
                  </div>

                  {/* Contenu du jour compact - Optimisé pour exploiter tout l'espace */}
                  <div className="flex-1 flex flex-col p-2 gap-2 min-h-0">
                    {dayMenu ? (
                      <>
                        {/* Plat sénégalais compact - Optimisé pour mobile */}
                        <div className={`flex-1 flex flex-col justify-center ${senegaleseInfo.bgColor} ${senegaleseInfo.borderColor} border rounded p-2.5 min-h-0`}>
                          <div className="flex items-center justify-start gap-1.5 mb-1.5">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${senegaleseInfo.color}`}></div>
                            <span className={`text-xs font-bold ${senegaleseInfo.textColor} flex items-center gap-1`}>
                              <span className="text-xs">{senegaleseInfo.emoji}</span>
                              {senegaleseInfo.name}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug text-center px-1">
                            {dayMenu.senegalese}
                          </p>
                        </div>

                        {/* Plat européen compact - Optimisé pour mobile */}
                        <div className={`flex-1 flex flex-col justify-center ${europeanInfo.bgColor} ${europeanInfo.borderColor} border rounded p-2.5 min-h-0`}>
                          <div className="flex items-center justify-start gap-1.5 mb-1.5">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${europeanInfo.color}`}></div>
                            <span className={`text-xs font-bold ${europeanInfo.textColor} flex items-center gap-1`}>
                              <span className="text-xs">{europeanInfo.emoji}</span>
                              {europeanInfo.name}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug text-center px-1">
                            {dayMenu.european}
                          </p>
                        </div>

                        {/* Dessert compact - Optimisé pour mobile */}
                        <div className="flex-1 flex flex-col justify-center bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200 border rounded p-2.5 min-h-0">
                          <div className="flex items-center justify-start gap-1.5 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                            <span className="text-xs font-bold text-pink-700 flex items-center gap-1">
                              Dessert
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug text-center px-1">
                            {getDessertName(dayInfo.day)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded p-3 text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-sm">📝</span>
                        </div>
                        <p className="text-xs text-slate-600">Menu en attente</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Indicateurs de pagination (dots) et compteur - Masqués sur mobile */}
            {getWeekDays().length > 1 && (
              <div className="hidden sm:flex flex-col items-center gap-2 mt-3">
                {/* Compteur de position */}
                <div className="text-xs font-semibold text-gray-600">
                  {currentDayIndex + 1} / {getWeekDays().length}
                </div>
                {/* Dots de pagination */}
                <div className="flex justify-center items-center gap-2">
                  {getWeekDays().map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToDay(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentDayIndex
                          ? 'w-2.5 h-2.5 bg-blue-600 shadow-md'
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Aller au jour ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Version desktop : Grille classique */}
        <div className="hidden sm:block w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 h-full items-stretch overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
          {getWeekDays().map((dayInfo, index) => {

            const dayMenu = weekMenu.days.find(menu => menu.day === dayInfo.day)
            const senegaleseInfo = getCuisineInfo('senegalese')

            const europeanInfo = getCuisineInfo('european')

            

            return (

              <div 

                key={dayInfo.day} 

                className={`backdrop-blur-sm rounded-xl border-2 transition-all duration-300 group/day overflow-hidden h-full flex flex-col ${

                  dayInfo.isToday 

                    ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-400 shadow-xl ring-4 ring-red-100' 

                    : 'bg-white/80 border-slate-400 hover:bg-white/90 hover:shadow-lg'

                }`}

              >

                {/* En-tête du jour avec gradient */}

                <div className={`p-2 sm:p-2.5 text-gray-900 relative overflow-hidden flex-shrink-0 ${
                  dayInfo.isToday 

                    ? 'bg-gradient-to-br from-red-100 via-orange-100 to-red-100' 

                    : 'bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100'

                }`}>

                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>
                  <div className="relative z-10">

                    <h3 className={`font-bold text-base sm:text-lg text-center group-hover/day:scale-105 transition-transform duration-300 ${
                      dayInfo.isToday ? 'text-red-800' : ''

                    }`}>

                      {dayInfo.dayName}

                    </h3>

                    <p className={`text-xs sm:text-sm text-center font-medium ${
                      dayInfo.isToday ? 'text-red-600' : 'text-gray-600'

                    }`}>

                      {formatFullDate(dayInfo.date)}

                    </p>

                  </div>

                </div>



                {/* Trait de séparation */}

                <div className={`border-t-2 ${

                  dayInfo.isToday ? 'border-red-300' : 'border-slate-400'

                }`}></div>



                {/* Contenu du jour */}

                <div className="flex-1 flex flex-col p-2 sm:p-3 gap-2 sm:gap-2.5 min-h-0">
                  {dayMenu ? (

                    // Restaurant ouvert - Afficher les plats

                    <>

                      {/* Plat sénégalais */}

                      <div className={`flex-1 flex flex-col justify-center min-h-0 ${senegaleseInfo.bgColor} ${senegaleseInfo.borderColor} border rounded-lg p-2 sm:p-3 group-hover/day:scale-105 transition-transform duration-300`}>
                        <div className="flex items-center justify-start gap-2 mb-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${senegaleseInfo.color} shadow-sm`}></div>
                          <span className={`text-[10px] sm:text-xs font-bold ${senegaleseInfo.textColor} flex items-center gap-1`}>
                            <span className="text-xs sm:text-sm">{senegaleseInfo.emoji}</span>
                            {senegaleseInfo.name}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight text-center px-1">

                          {dayMenu.senegalese}

                        </p>

                      </div>



                      {/* Plat européen */}

                      <div className={`flex-1 flex flex-col justify-center min-h-0 ${europeanInfo.bgColor} ${europeanInfo.borderColor} border rounded-lg p-2 sm:p-3 group-hover/day:scale-105 transition-transform duration-300`}>
                        <div className="flex items-center justify-start gap-2 mb-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${europeanInfo.color} shadow-sm`}></div>
                            <span className={`text-[10px] sm:text-xs font-bold ${europeanInfo.textColor} flex items-center gap-1`}>
                            <span className="text-xs sm:text-sm">{europeanInfo.emoji}</span>
                              {europeanInfo.name}
                            </span>
                          </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight text-center px-1">

                          {dayMenu.european}

                        </p>

                      </div>



                      {/* Dessert */}

                      <div className="flex-1 flex flex-col justify-center min-h-0 bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200 border rounded-lg p-2 sm:p-3 group-hover/day:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-start gap-2 mb-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-sm"></div>
                          <span className="text-[10px] sm:text-xs font-bold text-pink-700 flex items-center gap-1">
                            Dessert
                          </span>
                        </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight text-center px-1">

                          {getDessertName(dayInfo.day)}
                          </p>

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



                      {/* Dessert placeholder */}
                      <div className="flex-1 flex flex-col justify-center min-h-0 bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200 border rounded-lg p-2 sm:p-3 group-hover/day:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-start gap-2 mb-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-sm"></div>
                          <span className="text-[10px] sm:text-xs font-bold text-pink-700 flex items-center gap-1">
                            Dessert
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight text-center px-1">
                          {getDessertName(dayInfo.day)}
                        </p>
                      </div>
                    </div>

                  )}

                </div>

              </div>

            )

          })}

          </div>

        </div>

      </CardContent>

    </Card>

  )

}

