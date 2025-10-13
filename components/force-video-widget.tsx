"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

export function ForceVideoWidget() {
  const [isResetting, setIsResetting] = useState(false)
  const [isReset, setIsReset] = useState(false)

  const handleForceReset = () => {
    setIsResetting(true)
    
    // Vider le localStorage pour forcer la réinitialisation
    localStorage.removeItem('dashboard-widgets')
    localStorage.removeItem('dashboard-widgets-version')
    
    // Attendre un peu puis recharger la page
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const checkVideoWidget = () => {
    const savedWidgets = localStorage.getItem('dashboard-widgets')
    if (savedWidgets) {
      try {
        const widgets = JSON.parse(savedWidgets)
        const hasVideo = widgets.some((widget: any) => widget.type === 'video')
        return hasVideo
      } catch {
        return false
      }
    }
    return false
  }

  const hasVideoWidget = checkVideoWidget()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Force Video Widget
        </h1>
        <p className="text-gray-600">
          Outil pour forcer l'affichage de la carte vidéo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasVideoWidget ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
            État du Widget Vidéo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-100">
              <p className="text-sm">
                {hasVideoWidget 
                  ? "✅ Le widget vidéo est présent dans la configuration"
                  : "❌ Le widget vidéo n'est pas présent dans la configuration"
                }
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Actions disponibles :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vider le cache des widgets</li>
                <li>• Forcer la réinitialisation du dashboard</li>
                <li>• Recharger la page avec la nouvelle configuration</li>
              </ul>
            </div>

            <Button
              onClick={handleForceReset}
              disabled={isResetting}
              className="w-full"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Réinitialisation en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Forcer la réinitialisation
                </>
              )}
            </Button>

            {isReset && (
              <div className="p-4 rounded-lg bg-green-100 text-green-800">
                <p className="text-sm">
                  ✅ Réinitialisation effectuée ! La page va se recharger automatiquement.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Attendue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Ordre des widgets :</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Actualités (large)</li>
              <li>Mot du Directeur (medium)</li>
              <li><strong>Vidéo SAR (medium)</strong> ← Nouvelle carte</li>
              <li>Sécurité du Travail (medium)</li>
              <li>Applications (medium)</li>
              <li>Événements (medium)</li>
              <li>Boîte à Idées (medium)</li>
              <li>Menu de la Semaine (full)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
