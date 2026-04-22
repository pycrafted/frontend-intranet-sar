"use client"

import { useState, useEffect } from "react"
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

const WIDGET_META: Record<string, { description: string; icon: string }> = {
  news:        { icon: '📰', description: 'Dernières actualités et publications' },
  ideas:       { icon: '💡', description: 'Soumettre et gérer vos idées' },
  safety:      { icon: '🛡️', description: 'Compteur de sécurité et objectifs' },
  menu:        { icon: '🍽️', description: "Menu du restaurant d'entreprise" },
  director:    { icon: '👑', description: 'Message du Directeur Général' },
  video:       { icon: '🎥', description: 'Contenus vidéos internes' },
  apps:        { icon: '⚡', description: 'Raccourcis vers les applications' },
  recruitment: { icon: '🧑‍💼', description: 'Postes ouverts et candidatures internes' },
  calendar:    { icon: '📅', description: 'Événements et rendez-vous importants' },
  tri:         { icon: '📊', description: 'Taux de Récurrence des Incidents (TRI)' },
  payroll:     { icon: '💳', description: 'Calendrier de paie annuel (acompte & virement)' },
}

const WIDGET_SIZES: { value: DashboardWidget['size']; label: string; description: string; dot: string }[] = [
  { value: 'small',  label: 'Petit',  description: '3 col',  dot: 'bg-blue-400' },
  { value: 'medium', label: 'Moyen',  description: '6 col',  dot: 'bg-green-400' },
  { value: 'large',  label: 'Grand',  description: '8 col',  dot: 'bg-orange-400' },
  { value: 'full',   label: 'Plein',  description: '12 col', dot: 'bg-purple-400' },
]

interface WidgetManagerProps {
  widgets: DashboardWidget[]
  onWidgetsChange: (widgets: DashboardWidget[]) => void
  onReset: () => void
}

export function WidgetManager({ widgets, onWidgetsChange, onReset }: WidgetManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Copie locale — les modifications ne partent vers le backend qu'au clic "Sauvegarder"
  const [local, setLocal] = useState<DashboardWidget[]>([])

  // Réinitialiser la copie locale à chaque ouverture du modal
  useEffect(() => {
    if (isOpen) {
      setLocal([...widgets].sort((a, b) => a.order - b.order))
    }
  }, [isOpen, widgets])

  const toggleVisibility = (id: string) =>
    setLocal(prev => prev.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w))

  const changeSize = (id: string, size: DashboardWidget['size']) =>
    setLocal(prev => prev.map(w => w.id === id ? { ...w, size } : w))

  const moveUp = (id: string) => {
    setLocal(prev => {
      const idx = prev.findIndex(w => w.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next.map((w, i) => ({ ...w, order: i + 1 }))
    })
  }

  const moveDown = (id: string) => {
    setLocal(prev => {
      const idx = prev.findIndex(w => w.id === id)
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next.map((w, i) => ({ ...w, order: i + 1 }))
    })
  }

  const handleSave = () => {
    // Propager au parent → déclenche le save effect → PUT backend
    onWidgetsChange(local)
    setIsOpen(false)
  }

  const handleCancel = () => {
    // Abandonner les modifications locales
    setLocal([...widgets].sort((a, b) => a.order - b.order))
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCancel(); else setIsOpen(true) }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Gérer les cartes
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-3xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="flex flex-col h-full" style={{ maxHeight: '90vh' }}>

          {/* En-tête */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b bg-white flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-blue-600" />
              Gérer les cartes du dashboard
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-0.5">
              Modifiez la taille, la position et la visibilité de chaque carte. Les changements sont appliqués après avoir cliqué sur <strong>Sauvegarder</strong>.
            </p>
          </DialogHeader>

          {/* Corps scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-gray-50" style={{ minHeight: 0 }}>
            {local.map((widget, index) => {
              const meta = WIDGET_META[widget.type] ?? { icon: '📦', description: 'Widget' }
              return (
                <div
                  key={widget.id}
                  className={`flex items-center gap-3 bg-white border rounded-lg px-4 py-3 transition-opacity ${!widget.isVisible ? 'opacity-50' : ''}`}
                >
                  {/* Flèches de position */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => moveUp(widget.id)}
                      disabled={index === 0}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Monter"
                    >
                      <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => moveDown(widget.id)}
                      disabled={index === local.length - 1}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Descendre"
                    >
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  </div>

                  {/* Icône + nom */}
                  <span className="text-xl flex-shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{widget.title}</div>
                    <div className="text-xs text-gray-400 truncate">{meta.description}</div>
                  </div>

                  {/* Sélecteur de taille */}
                  <div className="flex-shrink-0 w-28">
                    <Select
                      value={widget.size}
                      onValueChange={(v) => changeSize(widget.id, v as DashboardWidget['size'])}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WIDGET_SIZES.map(s => (
                          <SelectItem key={s.value} value={s.value}>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                              {s.label}
                              <span className="text-gray-400">{s.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggle visibilité */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {widget.isVisible
                      ? <Eye className="h-3.5 w-3.5 text-emerald-500" />
                      : <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                    }
                    <Switch
                      checked={widget.isVisible}
                      onCheckedChange={() => toggleVisibility(widget.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="border-t bg-white px-5 py-3 flex justify-between items-center flex-shrink-0">
            <button
              onClick={onReset}
              className="text-xs text-gray-400 hover:text-red-500 underline underline-offset-2 transition-colors"
            >
              Réinitialiser les défauts
            </button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5">
                <X className="h-3.5 w-3.5" />
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Sauvegarder
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
