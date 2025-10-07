"use client"

import { useState, useEffect, useCallback } from 'react'

export interface DashboardWidget {
  id: string
  type: 'calendar' | 'news' | 'ideas' | 'safety' | 'menu'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  order: number
  isVisible: boolean
  position?: {
    x: number
    y: number
  }
}

interface DashboardPreferences {
  widgets: DashboardWidget[]
  layout: 'grid' | 'freeform'
  columns: number
  lastUpdated: string
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  widgets: [
    { id: 'calendar', type: 'calendar', title: 'Calendrier', size: 'medium', order: 1, isVisible: true },
    { id: 'news', type: 'news', title: 'Actualités', size: 'medium', order: 2, isVisible: true },
    { id: 'ideas', type: 'ideas', title: 'Boîte à Idées', size: 'medium', order: 3, isVisible: true },
    { id: 'safety', type: 'safety', title: 'Sécurité', size: 'medium', order: 4, isVisible: true },
    { id: 'menu', type: 'menu', title: 'Menu', size: 'full', order: 7, isVisible: true },
  ],
  layout: 'grid',
  columns: 3,
  lastUpdated: new Date().toISOString()
}

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Charger les préférences depuis localStorage
  useEffect(() => {
    setIsClient(true)
    const loadPreferences = () => {
      try {
        const saved = localStorage.getItem('dashboard-preferences')
        if (saved) {
          const parsed = JSON.parse(saved)
          setPreferences(parsed)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error)
        setPreferences(DEFAULT_PREFERENCES)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Sauvegarder les préférences
  const savePreferences = useCallback((newPreferences: Partial<DashboardPreferences>) => {
    if (!isClient) return

    const updatedPreferences = {
      ...preferences,
      ...newPreferences,
      lastUpdated: new Date().toISOString()
    }

    try {
      localStorage.setItem('dashboard-preferences', JSON.stringify(updatedPreferences))
      setPreferences(updatedPreferences)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error)
    }
  }, [preferences, isClient])

  // Mettre à jour les widgets
  const updateWidgets = useCallback((widgets: DashboardWidget[]) => {
    savePreferences({ widgets })
  }, [savePreferences])

  // Réorganiser les widgets
  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    const newWidgets = [...preferences.widgets]
    const [movedWidget] = newWidgets.splice(fromIndex, 1)
    newWidgets.splice(toIndex, 0, movedWidget)
    
    // Mettre à jour l'ordre
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index + 1
    }))
    
    updateWidgets(updatedWidgets)
  }, [preferences.widgets, updateWidgets])

  // Basculer la visibilité d'un widget
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const updatedWidgets = preferences.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    )
    updateWidgets(updatedWidgets)
  }, [preferences.widgets, updateWidgets])

  // Changer la taille d'un widget
  const changeWidgetSize = useCallback((widgetId: string, size: DashboardWidget['size']) => {
    const updatedWidgets = preferences.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, size }
        : widget
    )
    updateWidgets(updatedWidgets)
  }, [preferences.widgets, updateWidgets])

  // Réinitialiser aux paramètres par défaut
  const resetToDefault = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
    if (isClient) {
      localStorage.setItem('dashboard-preferences', JSON.stringify(DEFAULT_PREFERENCES))
    }
  }, [isClient])

  // Exporter les préférences
  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-preferences-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [preferences])

  // Importer les préférences
  const importPreferences = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          setPreferences(imported)
          if (isClient) {
            localStorage.setItem('dashboard-preferences', JSON.stringify(imported))
          }
          resolve()
        } catch (error) {
          reject(new Error('Format de fichier invalide'))
        }
      }
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
      reader.readAsText(file)
    })
  }, [isClient])

  return {
    preferences,
    isLoading,
    isClient,
    updateWidgets,
    reorderWidgets,
    toggleWidgetVisibility,
    changeWidgetSize,
    resetToDefault,
    exportPreferences,
    importPreferences,
    savePreferences
  }
}
