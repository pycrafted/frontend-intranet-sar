"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { CheckCircle, XCircle, Monitor, Globe } from "lucide-react"

export function FontSizeTest() {
  const { browserInfo, isClient } = useBrowserDetection()

  if (!isClient) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      </Card>
    )
  }

  const getBrowserIcon = () => {
    if (browserInfo.isEdge) return <Monitor className="h-6 w-6 text-blue-600" />
    if (browserInfo.isChrome) return <Globe className="h-6 w-6 text-green-600" />
    return <Globe className="h-6 w-6 text-gray-600" />
  }

  const getBrowserName = () => {
    if (browserInfo.isEdge) return "Microsoft Edge"
    if (browserInfo.isChrome) return "Google Chrome"
    return "Autre navigateur"
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test des Tailles de Police Cross-Browser
        </h1>
        <p className="text-gray-600">
          Comparaison des tailles de police entre Chrome et Edge
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          {getBrowserIcon()}
          <span className="font-semibold">{getBrowserName()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test des tailles de base */}
        <Card>
          <CardHeader>
            <CardTitle>Tailles de Police de Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs">text-xs - 12px</div>
              <div className="text-sm">text-sm - 14px</div>
              <div className="text-base">text-base - 16px</div>
              <div className="text-lg">text-lg - 18px</div>
              <div className="text-xl">text-xl - 20px</div>
              <div className="text-2xl">text-2xl - 24px</div>
              <div className="text-3xl">text-3xl - 30px</div>
            </div>
          </CardContent>
        </Card>

        {/* Test des composants de cartes */}
        <Card>
          <CardHeader>
            <CardTitle>Composants de Cartes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800 widget-title">Titre de Widget</h3>
                <p className="text-sm text-gray-600 widget-subtitle">Sous-titre de widget</p>
              </div>
              
              <div className="flex gap-2">
                <Badge className="badge-text">Badge</Badge>
                <Badge variant="outline" className="badge-text">Badge Outline</Badge>
              </div>
              
              <div className="text-xs text-gray-500 metadata-text">
                Métadonnées et informations
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test des cartes draggables simulées */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation des Cartes Draggables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Carte Actualités */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge className="badge-text bg-white/20 text-white">Actualités</Badge>
                  <Badge className="badge-text bg-yellow-500 text-white">Épinglé</Badge>
                </div>
                <h3 className="text-base sm:text-lg font-bold carousel-title">
                  Titre de l'article
                </h3>
                <p className="text-xs sm:text-sm text-white/90 carousel-text">
                  Contenu de l'article avec du texte qui peut être long et qui doit s'afficher correctement sur tous les navigateurs.
                </p>
                <div className="text-xs text-white/80 metadata-text">
                  Il y a 2 heures
                </div>
              </div>
            </div>

            {/* Carte Sécurité */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-lg p-4 text-white">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold widget-title">Sécurité du Travail</h3>
                    <p className="text-sm text-blue-200/80 widget-subtitle">
                      Compteurs de jours sans accident
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black safety-counter-number">365</div>
                  <div className="text-sm font-bold safety-counter-label">Jours</div>
                  <div className="text-xs safety-counter-subtitle">sans accident</div>
                </div>
              </div>
            </div>

            {/* Carte Événements */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg p-4 text-white">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <h3 className="text-lg font-bold widget-title">Événements</h3>
                    <p className="text-sm text-rose-200/80 widget-subtitle">
                      Calendrier des événements
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                    <span className="text-xs metadata-text">Événement à venir dans 5 jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions de test */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Test 1 : Tailles de Police</h4>
                <p className="text-sm text-gray-600">
                  Vérifiez que les tailles de police sont identiques entre Chrome et Edge.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Test 2 : Cartes Draggables</h4>
                <p className="text-sm text-gray-600">
                  Comparez l'affichage des cartes simulées entre les deux navigateurs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Test 3 : Responsive</h4>
                <p className="text-sm text-gray-600">
                  Testez sur différentes tailles d'écran pour vérifier la cohérence.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




