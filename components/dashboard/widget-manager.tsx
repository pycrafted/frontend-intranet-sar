"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { DashboardWidget } from "./draggable-dashboard"

type AvailableWidgetMeta = {
  id: string
  name: string
  description: string
  icon: string
  category: string
  size: 'small' | 'medium' | 'large' | 'full'
  isDefault: boolean
}

// Configuration des widgets disponibles
const AVAILABLE_WIDGETS: Record<string, AvailableWidgetMeta> = {
  news: { 
    id: 'news',
    name: 'Actualités Récentes', 
    description: 'Dernières actualités et publications',
    icon: '📰',
    category: 'Information',
    size: 'medium' as const,
    isDefault: true
  },
  ideas: { 
    id: 'ideas',
    name: 'Boîte à Idées', 
    description: 'Soumettre et gérer vos idées',
    icon: '💡',
    category: 'Collaboration',
    size: 'medium' as const,
    isDefault: true
  },
  safety: { 
    id: 'safety',
    name: 'Sécurité au Travail', 
    description: 'Compteur de sécurité et objectifs',
    icon: '🛡️',
    category: 'Sécurité',
    size: 'medium' as const,
    isDefault: true
  },
  menu: { 
    id: 'menu',
    name: 'Menu de la Semaine', 
    description: 'Menu du restaurant d\'entreprise',
    icon: '🍽️',
    category: 'Services',
    size: 'full' as const,
    isDefault: true
  },
  director: { 
    id: 'director',
    name: 'Mot du Directeur', 
    description: 'Message du Directeur Général',
    icon: '👑',
    category: 'Direction',
    size: 'small' as const,
    isDefault: true
  },
  video: {
    id: 'video',
    name: 'Vidéo SAR',
    description: 'Contenus vidéos internes et messages clés',
    icon: '🎥',
    category: 'Communication',
    size: 'medium' as const,
    isDefault: true,
  },
  apps: {
    id: 'apps',
    name: 'Accès Rapide',
    description: 'Raccourcis vers les applications critiques',
    icon: '⚡',
    category: 'Productivité',
    size: 'medium' as const,
    isDefault: true,
  },
  projects: {
    id: 'projects',
    name: 'Projets',
    description: 'Suivi des projets stratégiques et statuts',
    icon: '🚀',
    category: 'Stratégie',
    size: 'medium' as const,
    isDefault: true,
  },
  recruitment: {
    id: 'recruitment',
    name: 'Recrutements Internes',
    description: 'Postes ouverts et candidats internes',
    icon: '🧑‍💼',
    category: 'Ressources humaines',
    size: 'medium' as const,
    isDefault: true,
  },
  calendar: {
    id: 'calendar',
    name: 'Calendrier',
    description: 'Événements et rendez-vous importants',
    icon: '📅',
    category: 'Organisation',
    size: 'medium' as const,
    isDefault: true,
  }
}

const WIDGET_SIZES = [
  { value: 'small', label: 'Petit', description: '3 colonnes', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Moyen', description: '4 colonnes', color: 'bg-green-100 text-green-800' },
  { value: 'large', label: 'Grand', description: '6 colonnes', color: 'bg-orange-100 text-orange-800' },
  { value: 'full', label: 'Plein', description: '12 colonnes', color: 'bg-purple-100 text-purple-800' }
]

interface WidgetManagerProps {
  widgets: DashboardWidget[]
  onWidgetsChange: (widgets: DashboardWidget[]) => void
  onReset: () => void
}

export function WidgetManager({ widgets, onWidgetsChange, onReset }: WidgetManagerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Widgets actuellement actifs
  const activeWidgets = widgets


  // Basculer la visibilité
  const toggleVisibility = (widgetId: string) => {
    onWidgetsChange(widgets.map(w => 
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    ))
  }

  // Changer la taille
  const changeSize = (widgetId: string, size: DashboardWidget['size']) => {
    console.log('[WidgetManager] 🔄 Changement de taille demandé:', { widgetId, size })
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, size } : w
    )
    console.log('[WidgetManager] 📋 Widgets mis à jour:', updatedWidgets.find(w => w.id === widgetId))
    onWidgetsChange(updatedWidgets)
  }

  // Changer l'ordre (monter)
  const moveUp = (widgetId: string) => {
    const currentIndex = widgets.findIndex(w => w.id === widgetId)
    if (currentIndex > 0) {
      const updatedWidgets = [...widgets]
      const temp = updatedWidgets[currentIndex]
      updatedWidgets[currentIndex] = updatedWidgets[currentIndex - 1]
      updatedWidgets[currentIndex - 1] = temp
      // Mettre à jour les ordres
      const reorderedWidgets = updatedWidgets.map((w, index) => ({
        ...w,
        order: index + 1
      }))
      onWidgetsChange(reorderedWidgets)
    }
  }

  // Changer l'ordre (descendre)
  const moveDown = (widgetId: string) => {
    const currentIndex = widgets.findIndex(w => w.id === widgetId)
    if (currentIndex < widgets.length - 1) {
      const updatedWidgets = [...widgets]
      const temp = updatedWidgets[currentIndex]
      updatedWidgets[currentIndex] = updatedWidgets[currentIndex + 1]
      updatedWidgets[currentIndex + 1] = temp
      // Mettre à jour les ordres
      const reorderedWidgets = updatedWidgets.map((w, index) => ({
        ...w,
        order: index + 1
      }))
      onWidgetsChange(reorderedWidgets)
    }
  }

  // Fonction pour sauvegarder la disposition comme nouvelle disposition par défaut
  const handleSave = () => {
    try {
      console.log('[WidgetManager] 💾 Sauvegarde de la disposition par défaut')
      
      // Sauvegarder les widgets dans localStorage
      localStorage.setItem('dashboard-widgets', JSON.stringify(widgets))
      
      // Extraire la configuration par défaut (tailles et ordres) et la sauvegarder
      const defaultConfig: Record<string, { size: DashboardWidget['size'], order: number }> = {}
      widgets.forEach(widget => {
        defaultConfig[widget.id] = {
          size: widget.size,
          order: widget.order
        }
      })
      localStorage.setItem('dashboard-default-config', JSON.stringify(defaultConfig))
      
      // Mettre à jour la version pour que cette disposition devienne la nouvelle disposition par défaut
      const currentVersion = '6.0'
      localStorage.setItem('dashboard-widgets-version', currentVersion)
      
      // Déclencher l'événement pour notifier les autres composants
      window.dispatchEvent(new Event('dashboard-widgets-changed'))
      
      console.log('[WidgetManager] ✅ Disposition sauvegardée avec succès')
      
      // Fermer le modal
      setIsOpen(false)
    } catch (error) {
      console.error('[WidgetManager] ❌ Erreur lors de la sauvegarde:', error)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Gérer les cartes
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="flex flex-col h-full" style={{ maxHeight: '90vh' }}>
          <DialogHeader className="pb-4 pt-4 px-4 sm:px-6 border-b bg-white sticky top-0 z-10 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5 text-blue-600" />
              Configuration du Dashboard
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Personnalisez l'affichage de vos cartes en ajustant leur taille et visibilité.
              Masquez les cartes que vous n'utilisez pas temporairement.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 space-y-6 bg-gray-50 custom-scrollbar" style={{ minHeight: 0 }}>
            {/* Liste des cartes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-gray-500" />
                Vos cartes ({activeWidgets.length})
              </h3>
              
              <div className="space-y-3">
                {activeWidgets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune carte configurée</p>
                    <p className="text-sm">Les cartes apparaîtront ici une fois ajoutées</p>
                  </div>
                ) : (
                  activeWidgets
                    .sort((a, b) => a.order - b.order)
                    .map((widget, index) => (
                      <ActiveWidgetCard
                        key={widget.id}
                        widget={widget}
                        index={index}
                        total={activeWidgets.length}
                        onToggleVisibility={toggleVisibility}
                        onChangeSize={changeSize}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                      />
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Footer avec boutons Fermer et Sauvegarder */}
          <div className="border-t bg-white px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2 sticky bottom-0 z-10 flex-shrink-0">
            <Button 
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Fermer
            </Button>
            <Button 
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Composant pour une carte active
function ActiveWidgetCard({ 
  widget, 
  index,
  total,
  onToggleVisibility, 
  onChangeSize,
  onMoveUp,
  onMoveDown
}: {
  widget: DashboardWidget
  index: number
  total: number
  onToggleVisibility: (id: string) => void
  onChangeSize: (id: string, size: DashboardWidget['size']) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}) {
  const widgetConfig = AVAILABLE_WIDGETS[widget.type] ?? {
    id: widget.id,
    name: widget.title,
    description: 'Widget personnalisé',
    icon: '📦',
    category: 'Personnalisé',
    size: widget.size,
    isDefault: false,
  }
  const sizeConfig = WIDGET_SIZES.find(s => s.value === widget.size) ?? {
    value: widget.size,
    label: widget.size,
    description: '',
    color: 'bg-gray-100 text-gray-700',
  }
  
  return (
    <Card className={`p-3 h-full transition-all duration-200 hover:shadow-md bg-white ${!widget.isVisible ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          {/* Boutons de réorganisation */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(widget.id)}
              disabled={index === 0}
              className="h-6 w-6 p-0"
              title="Monter"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(widget.id)}
              disabled={index === total - 1}
              className="h-6 w-6 p-0"
              title="Descendre"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm sm:text-base">{widget.title}</div>
            <div className="text-xs sm:text-sm text-gray-500">{widgetConfig.description}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Contrôle de taille */}
          <div className="flex flex-col gap-0.5 flex-1">
            <Label htmlFor={`size-${widget.id}`} className="text-xs text-gray-500">
              Taille
            </Label>
            <Select
              value={widget.size}
              onValueChange={(value) => onChangeSize(widget.id, value as DashboardWidget['size'])}
            >
              <SelectTrigger id={`size-${widget.id}`} className="w-full sm:w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIDGET_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${size.color.split(' ')[0]}`} />
                      {size.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contrôle de visibilité */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <div className="flex flex-col gap-0.5 text-right">
              <Label htmlFor={`visibility-${widget.id}`} className="text-xs text-gray-500">
                {widget.isVisible ? 'Visible' : 'Masquée'}
              </Label>
              <div className="flex items-center justify-end gap-1.5 text-sm text-gray-600">
                {widget.isVisible ? <Eye className="h-3.5 w-3.5 text-emerald-500" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
                <Switch
                  id={`visibility-${widget.id}`}
                  checked={widget.isVisible}
                  onCheckedChange={() => onToggleVisibility(widget.id)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

