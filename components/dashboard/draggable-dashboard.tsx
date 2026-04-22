"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { VideoWidget } from "./video-widget"
import { RecruitmentWidget } from "./recruitment-widget"
import { TRIIndicatorWidget } from "./tri-indicator-widget"
import { PayrollCalendarWidget } from "./payroll-calendar-widget"
import { WidgetManager } from "./widget-manager"
import { DashboardTour, useDashboardTour } from "./dashboard-tour"
import { useToast, ToastContainer } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { GripVertical, Plus, LayoutDashboard } from "lucide-react"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { useTabletDetection } from "@/hooks/useTabletDetection"
import { useAuth } from "@/hooks/useAuth"
import { API_CONFIG } from "@/lib/config"

// Types pour les widgets
export interface DashboardWidget {
  id: string
  type: 'news' | 'ideas' | 'safety' | 'menu' | 'calendar' | 'apps' | 'director' | 'video' | 'recruitment' | 'tri' | 'payroll'
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
  director: { 
    size: 'medium', 
    component: DirectorMessageWidget, 
    title: 'Mot du Directeur' 
  },
  video: { 
    size: 'medium', 
    component: VideoWidget, 
    title: 'Vidéo SAR' 
  },
  safety: { 
    size: 'medium', 
    component: SafetyCounter, 
    title: 'Sécurité du Travail' 
  },
  apps: { 
    size: 'medium', 
    component: AppsWidget, 
    title: 'Accès Rapide' 
  },
  calendar: { 
    size: 'medium', 
    component: EventsCalendar, 
    title: 'Événements' 
  },
  ideas: { 
    size: 'medium', 
    component: IdeaBoxWidget, 
    title: 'Boîte à Idées' 
  },
  menu: { 
    size: 'large', 
    component: RestaurantMenu, 
    title: 'Menu de la Semaine' 
  },
  recruitment: {
    size: 'medium',
    component: RecruitmentWidget,
    title: 'Recrutements Internes'
  },
  tri: {
    size: 'medium',
    component: TRIIndicatorWidget,
    title: 'Indicateur TRI Sécurité'
  },
  payroll: {
    size: 'medium',
    component: PayrollCalendarWidget,
    title: 'Calendrier de Paie'
  },
}

// Configuration des tailles de grille - Responsive avec support tablettes
// Optimisé pour éviter les espaces vides : les cartes moyennes peuvent être 2 par ligne
const getGridSizes = (isTablet: boolean) => ({
  small: isTablet 
    ? 'col-span-1 tablet:col-span-12' 
    : 'col-span-1 sm:col-span-1 md:col-span-3 lg:col-span-3 xl:col-span-3',
  medium: isTablet 
    ? 'col-span-1 tablet:col-span-12' 
    : 'col-span-1 sm:col-span-1 md:col-span-6 lg:col-span-6 xl:col-span-4',
  // Cartes moyennes : 6 colonnes sur 12 = 50% = 2 par ligne sur md et lg
  // Sur xl : 4 colonnes sur 12 = 33% = 3 par ligne
  large: isTablet 
    ? 'col-span-1 tablet:col-span-12' 
    : 'col-span-1 sm:col-span-2 md:col-span-6 lg:col-span-6 xl:col-span-8',
  // Cartes grandes : 6 colonnes sur md/lg = 50% = 2 par ligne (comme les moyennes)
  // Sur xl : 8 colonnes sur 12 = 66% = 1 par ligne avec espace (mais sur xl il y a 3 moyennes par ligne donc ça fonctionne)
  full: isTablet 
    ? 'col-span-1 tablet:col-span-12' 
    : 'col-span-1 sm:col-span-2 md:col-span-12 lg:col-span-12 xl:col-span-12'
  // Cartes pleines : 12 colonnes = 100% = 1 par ligne
})

// Les hauteurs sont maintenant gérées directement dans les composants

// Composant pour charger progressivement un widget
function LazyWidget({ 
  widget,
  delay = 0,
  children
}: { 
  widget: DashboardWidget
  delay?: number
  children: React.ReactNode
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Charger le widget après un délai progressif
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!isLoaded) {
    // Skeleton loader pendant le chargement
    return (
      <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4 sm:p-6 h-full">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Composant pour une card draggable
function DraggableWidget({ 
  widget,
  isTablet,
  canEdit,
  loadDelay = 0
}: { 
  widget: DashboardWidget
  isTablet: boolean
  canEdit: boolean
  loadDelay?: number
}) {
  const sortable = useSortable({ id: widget.id })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = canEdit ? sortable : {
    attributes: {},
    listeners: {},
    setNodeRef: undefined,
    transform: undefined,
    transition: undefined,
    isDragging: false,
  } as any

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = WIDGET_CONFIG[widget.type]
  const gridSizes = getGridSizes(isTablet)
  
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
        ${gridSizes[widget.size as keyof typeof gridSizes]}
        ${isDragging ? 'opacity-50 z-50' : ''}
        group relative w-full
      `}
    >
      {/* Handle de drag - Responsive */}
      {canEdit && (
      <div
        id="drag-handle"
        {...attributes}
        {...listeners}
        className="
          absolute top-1 right-1 sm:top-2 sm:right-2 z-10
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          cursor-grab active:cursor-grabbing
          p-1 sm:p-1.5 rounded-md bg-white/90 backdrop-blur-sm
          shadow-sm border border-gray-200
          hover:bg-gray-50
        "
      >
        <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
      </div>
      )}

      
      <div className={`
        ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}
        transition-all duration-200 ease-in-out
        hover:shadow-lg rounded-lg overflow-hidden
        w-full h-full
      `}>
        <LazyWidget widget={widget} delay={loadDelay}>
          <Component />
        </LazyWidget>
      </div>
    </div>
  )
}

// Composant de prévisualisation pendant le drag
function DragOverlayContent({ 
  widget, 
  isTablet 
}: { 
  widget: DashboardWidget
  isTablet: boolean
}) {
  const config = WIDGET_CONFIG[widget.type]
  const gridSizes = getGridSizes(isTablet)
  
  // Vérification de sécurité pour éviter les erreurs
  if (!config) {
    console.warn(`Configuration non trouvée pour le type de widget: ${widget.type}`)
    return null
  }
  
  const Component = config.component

  return (
    <div className={`
      ${gridSizes[widget.size as keyof typeof gridSizes]}
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
  const [initialized, setInitialized] = useState(false)
  const [showWidgetManager, setShowWidgetManager] = useState(false)
  const { toasts, success, error } = useToast()
  const { hasSeenTour, isTourOpen, completeTour } = useDashboardTour()
  const { browserInfo, compatibleClasses, useFallbacks } = useBrowserDetection()
  const { isTablet, isSpecificTablet, deviceType, screenSize, specificDevice } = useTabletDetection()
  const { user } = useAuth()
  // Réservé au groupe "administrateur" uniquement (is_superuser est forcé à true pour tous)
  const canEdit = !!(user?.is_superuser)
  // Empêche le save-effect de s'exécuter lors du chargement initial depuis le backend
  const skipNextSave = useRef(false)

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

  // Fonction de migration pour convertir les anciens types et s'assurer que tous les widgets existent
  // Configuration par défaut des widgets (tailles et ordres)
  const DEFAULT_WIDGET_CONFIG = {
    video:       { size: 'medium' as const, order: 1  },
    director:    { size: 'medium' as const, order: 2  },
    news:        { size: 'medium' as const, order: 3  },
    apps:        { size: 'large'  as const, order: 4  },
    recruitment: { size: 'medium' as const, order: 5  },
    tri:         { size: 'medium' as const, order: 6  },
    safety:      { size: 'medium' as const, order: 7  },
    calendar:    { size: 'medium' as const, order: 8  },
    menu:        { size: 'large'  as const, order: 9  },
    ideas:       { size: 'medium' as const, order: 10 },
    payroll:     { size: 'medium' as const, order: 11 },
  }

  function getDefaultWidgets(): DashboardWidget[] {
    const c = DEFAULT_WIDGET_CONFIG
    return [
      { id: 'video',       type: 'video',       title: 'Vidéo SAR',               size: c.video.size,       order: c.video.order,       isVisible: true },
      { id: 'director',    type: 'director',    title: 'Mot du Directeur',         size: c.director.size,    order: c.director.order,    isVisible: true },
      { id: 'news',        type: 'news',        title: 'Actualités',               size: c.news.size,        order: c.news.order,        isVisible: true },
      { id: 'apps',        type: 'apps',        title: 'Accès Rapide',             size: c.apps.size,        order: c.apps.order,        isVisible: true },
      { id: 'recruitment', type: 'recruitment', title: 'Recrutements Internes',    size: c.recruitment.size, order: c.recruitment.order, isVisible: true },
      { id: 'tri',         type: 'tri',         title: 'Indicateur TRI Sécurité',  size: c.tri.size,         order: c.tri.order,         isVisible: true },
      { id: 'safety',      type: 'safety',      title: 'Sécurité du Travail',      size: c.safety.size,      order: c.safety.order,      isVisible: true },
      { id: 'calendar',    type: 'calendar',    title: 'Événements',               size: c.calendar.size,    order: c.calendar.order,    isVisible: true },
      { id: 'menu',        type: 'menu',        title: 'Menu de la Semaine',       size: c.menu.size,        order: c.menu.order,        isVisible: true },
      { id: 'ideas',       type: 'ideas',       title: 'Boîte à Idées',            size: c.ideas.size,       order: c.ideas.order,       isVisible: true },
      { id: 'payroll',     type: 'payroll',     title: 'Calendrier de Paie',        size: c.payroll.size,     order: c.payroll.order,     isVisible: true },
    ]
  }

  const migrateWidgets = (widgets: any[]): DashboardWidget[] => {
    const defaultWidgets = getDefaultWidgets()
    const defaultWidgetsMap = new Map(defaultWidgets.map(w => [w.id, w]))
    
    // Migrer les widgets existants
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

    // Créer un map des widgets migrés par ID
    const migratedMap = new Map(migratedWidgets.map(w => [w.id, w]))

    // Pour chaque widget par défaut, s'assurer qu'il existe avec la bonne configuration
    const finalWidgets: DashboardWidget[] = []
    
    defaultWidgets.forEach(defaultWidget => {
      const existingWidget = migratedMap.get(defaultWidget.id)
      
      if (existingWidget) {
        // Widget existe : conserver l'ordre, la taille et la visibilité sauvegardés par l'utilisateur
        finalWidgets.push({
          ...existingWidget,
          title: defaultWidget.title  // seul le titre suit la config (traduit/renommé)
        })
      } else {
        // Widget n'existe pas : l'ajouter avec la configuration par défaut
        finalWidgets.push(defaultWidget)
      }
    })

    // Trier par ordre pour s'assurer que l'ordre est correct
    finalWidgets.sort((a, b) => a.order - b.order)

    return finalWidgets
  }

  // Charger le layout depuis le backend au montage.
  // Le backend crée automatiquement les défauts si aucun layout n'existe (get_or_create).
  useEffect(() => {
    setIsClient(true)

    const initLayout = async () => {
      try {
        const res = await fetch(`${API_CONFIG.ACCUEIL}/dashboard/layout/`, {
          credentials: 'include',
        })
        if (!res.ok) {
          // Non authentifié ou erreur serveur : afficher les defaults locaux
          setWidgets(getDefaultWidgets())
          setInitialized(true)
          return
        }
        const data = await res.json()
        // Le backend retourne toujours un layout (défauts créés automatiquement)
        skipNextSave.current = true
        setWidgets(migrateWidgets(data.widgets))
        setInitialized(true)
      } catch {
        // Réseau indisponible : afficher les defaults locaux
        setWidgets(getDefaultWidgets())
        setInitialized(true)
      }
    }

    initLayout()
  }, [])

  // Sauvegarde directe vers le backend (utilisée par le modal et le drag-and-drop)
  const saveToBackend = async (widgetsToSave: DashboardWidget[], showFeedback = false) => {
    try {
      const res = await fetch(`${API_CONFIG.ACCUEIL}/dashboard/layout/`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: widgetsToSave }),
      })
      if (!res.ok) {
        console.error('[Dashboard] Erreur sauvegarde backend:', res.status)
        if (showFeedback) error('Erreur de sauvegarde', `Impossible de sauvegarder la disposition (${res.status})`)
      } else if (showFeedback) {
        success('Disposition sauvegardée', 'Les modifications ont été appliquées avec succès')
      }
    } catch (e) {
      console.error('[Dashboard] Erreur réseau:', e)
      if (showFeedback) error('Erreur réseau', 'Impossible de contacter le serveur')
    }
  }

  // Sauvegarder dans le backend à chaque drag-and-drop (debouncé 800 ms)
  useEffect(() => {
    if (!isClient || widgets.length === 0) return

    // Ignorer le premier déclenchement quand on vient de charger depuis le backend
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    window.dispatchEvent(new Event('dashboard-widgets-changed'))

    const timer = setTimeout(() => saveToBackend(widgets), 800)
    return () => clearTimeout(timer)
  }, [widgets, isClient])

  // Fonction pour gérer les changements depuis le WidgetManager (modal)
  // Applique immédiatement l'état ET sauvegarde sans debounce
  const handleWidgetsChange = (newWidgets: DashboardWidget[]) => {
    // skipNextSave = true pour ne pas doubler la sauvegarde avec le useEffect
    skipNextSave.current = true
    setWidgets(newWidgets)
    // Sauvegarde directe avec feedback utilisateur visible
    saveToBackend(newWidgets, true)
  }


  // Fonction pour réinitialiser le dashboard
  const handleReset = () => {
    const defaults = getDefaultWidgets()
    skipNextSave.current = true
    setWidgets(defaults)
    saveToBackend(defaults, true)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-12 gap-3 sm:gap-3 md:gap-4 lg:gap-6">
          {getDefaultWidgets().map((widget) => {
            const config = WIDGET_CONFIG[widget.type]
            const Component = config.component
            const gridSizes = getGridSizes(isTablet)
            return (
              <div key={widget.id} className={gridSizes[widget.size as keyof typeof gridSizes]}>
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
    <div className={`${canEdit ? 'space-y-6' : 'space-y-2'} relative`}>
      {/* Barre d'outils du dashboard */}
      {canEdit && (
        <div id="dashboard-header" className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <div id="widget-manager">
              <WidgetManager
                widgets={widgets}
                onWidgetsChange={handleWidgetsChange}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dashboard draggable - Responsive */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={canEdit ? handleDragStart : undefined as any}
        onDragEnd={canEdit ? handleDragEnd : undefined as any}
      >
        <div className="min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-14rem)] lg:min-h-[calc(100vh-16rem)]">
          <div className={`${compatibleClasses.grid} grid-cols-1 sm:grid-cols-2 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-12 tablet:grid-cols-1 gap-3 sm:gap-3 md:gap-4 lg:gap-6 tablet:gap-4`}>
            <SortableContext 
              items={visibleWidgets.map(w => w.id)}
              strategy={rectSortingStrategy}
            >
              {visibleWidgets
                .sort((a, b) => a.order - b.order)
                .map((widget, index) => (
                  <DraggableWidget 
                    key={widget.id} 
                    widget={widget}
                    isTablet={isTablet}
                    canEdit={canEdit}
                    loadDelay={index * 100} // Délai progressif de 100ms par widget
                  />
                ))}
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {activeWidget ? (
            <DragOverlayContent widget={activeWidget} isTablet={isTablet} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* État vide */}
      {initialized && visibleWidgets.length === 0 && (
        <Card className="max-w-4xl mx-auto p-8 xs:p-12 text-center rounded-lg">
          <div className="space-y-3 xs:space-y-4">
            <div className="w-12 h-12 xs:w-16 xs:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <LayoutDashboard className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base xs:text-lg font-semibold">Votre dashboard est vide</h3>
              <p className="text-sm text-gray-500 mt-1">Commencez par ajouter des cartes pour personnaliser votre espace de travail</p>
            </div>
            {canEdit && (
              <div className="pt-2">
                <WidgetManager widgets={widgets} onWidgetsChange={handleWidgetsChange} onReset={handleReset} />
              </div>
            )}
          </div>
        </Card>
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
