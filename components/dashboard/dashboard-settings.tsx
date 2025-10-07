"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Eye, EyeOff, Download, Upload, RotateCcw, Palette } from "lucide-react"
import { useDashboardPreferences, DashboardWidget } from "@/hooks/useDashboardPreferences"

const WIDGET_SIZES = [
  { value: 'small', label: 'Petit', description: '3 colonnes' },
  { value: 'medium', label: 'Moyen', description: '4 colonnes' },
  { value: 'large', label: 'Grand', description: '6 colonnes' },
  { value: 'full', label: 'Plein', description: '12 colonnes' }
]

const WIDGET_ICONS: Record<string, string> = {
  calendar: '📅',
  news: '📰',
  countdown: '⏰',
  safety: '🛡️',
  menu: '🍽️'
}

export function DashboardSettings() {
  const {
    preferences,
    toggleWidgetVisibility,
    changeWidgetSize,
    resetToDefault,
    exportPreferences,
    importPreferences
  } = useDashboardPreferences()

  const [isImporting, setIsImporting] = useState(false)

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      await importPreferences(file)
    } catch (error) {
      alert('Erreur lors de l\'importation: ' + (error as Error).message)
    } finally {
      setIsImporting(false)
      event.target.value = '' // Reset input
    }
  }

  const visibleWidgets = preferences.widgets.filter(w => w.isVisible)
  const hiddenWidgets = preferences.widgets.filter(w => !w.isVisible)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configuration
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration du Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vue d'ensemble</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{visibleWidgets.length}</div>
                  <div className="text-sm text-gray-600">Widgets actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{hiddenWidgets.length}</div>
                  <div className="text-sm text-gray-600">Widgets masqués</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {preferences.widgets.filter(w => w.size === 'large' || w.size === 'full').length}
                  </div>
                  <div className="text-sm text-gray-600">Widgets larges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(preferences.lastUpdated).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600">Dernière modification</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widgets visibles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Widgets visibles ({visibleWidgets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visibleWidgets.map((widget) => (
                  <WidgetConfigItem
                    key={widget.id}
                    widget={widget}
                    onToggleVisibility={toggleWidgetVisibility}
                    onChangeSize={changeWidgetSize}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widgets masqués */}
          {hiddenWidgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <EyeOff className="h-5 w-5" />
                  Widgets masqués ({hiddenWidgets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hiddenWidgets.map((widget) => (
                    <WidgetConfigItem
                      key={widget.id}
                      widget={widget}
                      onToggleVisibility={toggleWidgetVisibility}
                      onChangeSize={changeWidgetSize}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Sauvegarde</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportPreferences}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                    <label className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4" />
                          Importer
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                        disabled={isImporting}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Réinitialisation</h4>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={resetToDefault}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WidgetConfigItem({ 
  widget, 
  onToggleVisibility, 
  onChangeSize 
}: { 
  widget: DashboardWidget
  onToggleVisibility: (id: string) => void
  onChangeSize: (id: string, size: DashboardWidget['size']) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="text-lg">{WIDGET_ICONS[widget.type]}</span>
        <div>
          <div className="font-medium">{widget.title}</div>
          <div className="text-sm text-gray-500">
            Taille: {WIDGET_SIZES.find(s => s.value === widget.size)?.label}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={widget.size}
          onValueChange={(value) => onChangeSize(widget.id, value as DashboardWidget['size'])}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WIDGET_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                <div>
                  <div className="font-medium">{size.label}</div>
                  <div className="text-xs text-gray-500">{size.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            id={`visibility-${widget.id}`}
            checked={widget.isVisible}
            onCheckedChange={() => onToggleVisibility(widget.id)}
          />
          <Label htmlFor={`visibility-${widget.id}`} className="text-sm">
            {widget.isVisible ? 'Visible' : 'Masqué'}
          </Label>
        </div>
      </div>
    </div>
  )
}
