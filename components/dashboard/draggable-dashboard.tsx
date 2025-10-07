"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { NewsCarousel } from "./news-carousel"
import { IdeaBoxWidget } from "./idea-box-widget"
import { SafetyCounter } from "./safety-counter"
import { RestaurantMenu } from "./restaurant-menu"
import { EventsCalendar } from "./events-calendar"
import { AppsWidget } from "./apps-widget"
import { DirectorMessageWidget } from "./director-message-widget"
import { WidgetManager } from "./widget-manager"
import { DashboardTour, useDashboardTour } from "./dashboard-tour"
import { useToast, ToastContainer } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GripVertical, Plus, HelpCircle } from "lucide-react"

// Types pour les widgets
export interface DashboardWidget {
  id: string
  type: 'news' | 'ideas' | 'safety' | 'menu' | 'calendar' | 'apps' | 'director'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  order: number
  isVisible: boolean
}

// Configuration des widgets avec leurs tailles par défaut
const WIDGET_CONFIG: Record<string, { size: string; component: React.ComponentType; title: string }> = {
  news: { 
    size: 'large', 
    component: NewsCarousel, 
    title: 'Actualités Récentes' 
  },
  ideas: { 
    size: 'small', 
    component: IdeaBoxWidget, 
    title: 'Boîte à Idées' 
  },
  safety: { 
    size: 'medium', 
    component: SafetyCounter, 
    title: 'Sécurité du Travail' 
  },
  menu: { 
    size: 'full', 
    component: RestaurantMenu, 
    title: 'Menu de la Semaine' 
  },
  calendar: { 
    size: 'small', 
    component: EventsCalendar, 
    title: 'Événements' 
  },
  apps: { 
    size: 'small', 
    component: AppsWidget, 
    title: 'Applications' 
  },
  director: { 
    size: 'small', 
    component: DirectorMessageWidget, 
    title: 'Mot du Directeur' 
  }
}

// Configuration des tailles de grille
const GRID_SIZES = {
  small: 'xl:col-span-3',
  medium: 'xl:col-span-4', 
  large: 'xl:col-span-8', // 2x la taille medium (4 x 2 = 8)
  full: 'xl:col-span-12'
}

// Les hauteurs sont maintenant gérées directement dans les composants

// Composant pour une card draggable
function DraggableWidget({ 
  widget
}: { 
  widget: DashboardWidget
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = WIDGET_CONFIG[widget.type]
  
  
  // Vérification de sécurité pour éviter les erreurs
  if (!config) {
    console.warn(`Configuration non trouvée pour le type de widget: ${widget.type}`)
    return null
  }
  
  const Component = config.component

  if (!widget.isVisible) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${GRID_SIZES[widget.size as keyof typeof GRID_SIZES]}
        ${isDragging ? 'opacity-50 z-50' : ''}
        group relative
      `}
    >
      {/* Handle de drag */}
      <div
        id="drag-handle"
        {...attributes}
        {...listeners}
        className="
          absolute top-2 right-2 z-10
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          cursor-grab active:cursor-grabbing
          p-1 rounded-md bg-white/90 backdrop-blur-sm
          shadow-sm border border-gray-200
          hover:bg-gray-50
        "
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
      </div>

      
      <div className={`
        ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}
        transition-all duration-200 ease-in-out
        hover:shadow-lg rounded-lg overflow-hidden
      `}>
        <Component />
      </div>
    </div>
  )
}

// Composant de prévisualisation pendant le drag
function DragOverlayContent({ widget }: { widget: DashboardWidget }) {
  const config = WIDGET_CONFIG[widget.type]
  
  // Vérification de sécurité pour éviter les erreurs
  if (!config) {
    console.warn(`Configuration non trouvée pour le type de widget: ${widget.type}`)
    return null
  }
  
  const Component = config.component

  return (
    <div className={`
      ${GRID_SIZES[widget.size as keyof typeof GRID_SIZES]}
      opacity-90
    `}>
      <div className={`
        shadow-2xl ring-2 ring-blue-500
        transform rotate-2 rounded-lg overflow-hidden
      `}>
        <Component />
      </div>
    </div>
  )
}

// Détection de collision personnalisée pour un meilleur comportement
const customCollisionDetection: CollisionDetection = (args) => {
  // Utiliser la détection par intersection de rectangles
  const intersections = rectIntersection(args)
  
  // Si on trouve des intersections, les retourner
  if (intersections.length > 0) {
    return intersections
  }
  
  // Sinon, retourner l'élément le plus proche du centre
  return closestCenter(args)
}

export function DraggableDashboard() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [showWidgetManager, setShowWidgetManager] = useState(false)
  const { toasts, success, error } = useToast()
  const { hasSeenTour, isTourOpen, startTour, completeTour } = useDashboardTour()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fonction de migration pour convertir les anciens types
  const migrateWidgets = (widgets: any[]): DashboardWidget[] => {
    const migratedWidgets = widgets.map(widget => {
      // Migrer countdown vers ideas
      if (widget.type === 'countdown') {
        return {
          ...widget,
          type: 'ideas' as const,
          title: 'Boîte à Idées'
        }
      }
      return widget
    })

    // S'assurer que le widget directeur existe
    const hasDirectorWidget = migratedWidgets.some(widget => widget.type === 'director')
    if (!hasDirectorWidget) {
      // Trouver le plus petit ordre existant et placer le directeur avant
      const minOrder = Math.min(...migratedWidgets.map(w => w.order), 1)
      migratedWidgets.push({
        id: 'director',
        type: 'director',
        title: 'Mot du Directeur',
        size: 'small',
        order: minOrder,
        isVisible: true
      })
      
      // Ajuster l'ordre des autres widgets
      migratedWidgets.forEach(widget => {
        if (widget.type !== 'director') {
          widget.order = widget.order + 1
        }
      })
    }



    // S'assurer que le widget calendrier existe
    const hasCalendarWidget = migratedWidgets.some(widget => widget.type === 'calendar')
    if (!hasCalendarWidget) {
      const maxOrder = Math.max(...migratedWidgets.map(w => w.order), 0)
      migratedWidgets.push({
        id: 'calendar',
        type: 'calendar',
        title: 'Calendrier des Événements',
        size: 'medium',
        order: maxOrder + 1,
        isVisible: true
      })
    }

    return migratedWidgets
  }

  // Initialiser les widgets au montage
  useEffect(() => {
    setIsClient(true)
    
    // Vérifier la version des widgets et forcer la migration si nécessaire
    const widgetVersion = localStorage.getItem('dashboard-widgets-version')
    const currentVersion = '2.0' // Version avec widget directeur
    
    // Charger la configuration sauvegardée ou utiliser la configuration par défaut
    const savedWidgets = localStorage.getItem('dashboard-widgets')
    if (savedWidgets && widgetVersion === currentVersion) {
      try {
        const parsed = JSON.parse(savedWidgets)
        const migratedWidgets = migrateWidgets(parsed)
        setWidgets(migratedWidgets)
      } catch (error) {
        console.error('Erreur lors du chargement des widgets:', error)
        setWidgets(getDefaultWidgets())
        localStorage.setItem('dashboard-widgets-version', currentVersion)
      }
    } else {
      // Utiliser les widgets par défaut et marquer la version
      setWidgets(getDefaultWidgets())
      localStorage.setItem('dashboard-widgets-version', currentVersion)
    }
  }, [])


  // Sauvegarder les widgets quand ils changent
  useEffect(() => {
    if (isClient && widgets.length > 0) {
      localStorage.setItem('dashboard-widgets', JSON.stringify(widgets))
    }
  }, [widgets, isClient])

  // Fonction pour gérer les changements de widgets avec notifications
  const handleWidgetsChange = (newWidgets: DashboardWidget[]) => {
    const oldCount = widgets.length
    const newCount = newWidgets.length
    
    if (newCount > oldCount) {
      success('Carte ajoutée', 'La nouvelle carte a été ajoutée à votre dashboard')
    } else if (newCount < oldCount) {
      success('Carte supprimée', 'La carte a été retirée de votre dashboard')
    }
    
    setWidgets(newWidgets)
  }


  // Fonction pour réinitialiser le dashboard
  const handleReset = () => {
    setWidgets(getDefaultWidgets())
    success('Dashboard réinitialisé', 'Votre dashboard a été remis à zéro')
  }

  function getDefaultWidgets(): DashboardWidget[] {
    return [
      { id: 'director', type: 'director', title: 'Mot du Directeur', size: 'small', order: 1, isVisible: true },
      { id: 'news', type: 'news', title: 'Actualités', size: 'large', order: 2, isVisible: true },
      { id: 'safety', type: 'safety', title: 'Sécurité du Travail', size: 'medium', order: 3, isVisible: true },
      { id: 'calendar', type: 'calendar', title: 'Événements', size: 'small', order: 4, isVisible: true },
      { id: 'ideas', type: 'ideas', title: 'Boîte à Idées', size: 'small', order: 5, isVisible: true },
      { id: 'apps', type: 'apps', title: 'Applications', size: 'small', order: 6, isVisible: true },
      { id: 'menu', type: 'menu', title: 'Menu de la Semaine', size: 'full', order: 7, isVisible: true },
    ]
  }


  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Mettre à jour l'ordre
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1
        }))
      })
    }

    setActiveId(null)
  }



  if (!isClient) {
    // Rendu côté serveur - afficher les widgets par défaut
    return (
      <div className="min-h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {getDefaultWidgets().map((widget) => {
            const config = WIDGET_CONFIG[widget.type]
            const Component = config.component
            return (
              <div key={widget.id} className={GRID_SIZES[widget.size as keyof typeof GRID_SIZES]}>
                <Component />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const visibleWidgets = widgets.filter(widget => widget.isVisible)
  const activeWidget = widgets.find(widget => widget.id === activeId)

  return (
    <div className="space-y-6 relative">
      {/* Barre d'outils du dashboard */}
      <div id="dashboard-header" className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem('dashboard-widgets')
              window.location.reload()
            }}
            className="flex items-center gap-2"
          >
            🔄 Reset
          </Button>
          <div id="widget-manager">
            <WidgetManager
              widgets={widgets}
              onWidgetsChange={handleWidgetsChange}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>

      {/* Dashboard draggable */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-[calc(100vh-16rem)]">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <SortableContext 
              items={visibleWidgets.map(w => w.id)}
              strategy={rectSortingStrategy}
            >
              {visibleWidgets
                .sort((a, b) => a.order - b.order)
                .map((widget) => (
                  <DraggableWidget 
                    key={widget.id} 
                    widget={widget} 
                  />
                ))}
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {activeWidget ? (
            <DragOverlayContent widget={activeWidget} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Bouton flottant pour ajouter des cartes */}
      {visibleWidgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Votre dashboard est vide</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter des cartes pour personnaliser votre espace de travail</p>
          <WidgetManager
            widgets={widgets}
            onWidgetsChange={handleWidgetsChange}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Container des notifications */}
      <ToastContainer toasts={toasts} />
      
      {/* Tour guidé */}
      <DashboardTour
        isOpen={isTourOpen}
        onClose={completeTour}
        onComplete={completeTour}
      />
    </div>
  )
}
