"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { Monitor, AlertTriangle, CheckCircle } from "lucide-react"

export function EdgeDebugTest() {
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

  const isEdge = browserInfo.isEdge

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Debug Edge - Test des Styles CSS
        </h1>
        <p className="text-gray-600">
          Vérification de l'application des styles CSS sur Edge
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Monitor className="h-6 w-6 text-blue-600" />
          <span className="font-semibold">
            {isEdge ? "Microsoft Edge détecté" : "Autre navigateur"}
          </span>
        </div>
      </div>

      {/* Test de détection Edge */}
      <Card>
        <CardHeader>
          <CardTitle>Détection du Navigateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {isEdge ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <h4 className="font-semibold">
                  {isEdge ? "Edge détecté" : "Edge non détecté"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isEdge 
                    ? "Les styles CSS spécifiques à Edge devraient s'appliquer"
                    : "Les styles CSS spécifiques à Edge ne s'appliqueront pas"
                  }
                </p>
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Informations du navigateur :</h5>
              <div className="text-sm space-y-1">
                <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) + '...' : 'N/A'}</div>
                <div>Est Edge: {isEdge ? 'Oui' : 'Non'}</div>
                <div>Version: {browserInfo.version}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test des tailles de police */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Tailles de Police</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mot du Directeur */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  👑 Mot du Directeur
                </h3>
                <p className="text-sm text-red-200/80">
                  Directeur Général
                </p>
              </div>

              {/* Sécurité du Travail */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-2 safety-widget-title">
                  🛡️ Sécurité du Travail
                </h3>
                <p className="text-sm text-blue-200/80 safety-widget-subtitle">
                  Compteurs de jours sans accident
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Les deux titres devraient avoir la même taille sur Edge
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test des classes Tailwind */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Classes Tailwind</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-lg">text-lg - Devrait être 0.875rem sur Edge</div>
            <div className="text-xl">text-xl - Devrait être 1rem sur Edge</div>
            <div className="text-2xl">text-2xl - Devrait être 1.125rem sur Edge</div>
            <div className="text-sm">text-sm - Devrait être 0.625rem sur Edge</div>
            <div className="text-xs">text-xs - Devrait être 0.5rem sur Edge</div>
          </div>
        </CardContent>
      </Card>

      {/* Test des compteurs */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Compteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">365</div>
              <div className="text-sm text-gray-600">text-4xl</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600">365</div>
              <div className="text-sm text-gray-600">text-5xl</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-purple-600">365</div>
              <div className="text-sm text-gray-600">text-6xl</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions de debug */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">1. Vérifier la détection Edge</h4>
                <p className="text-sm text-gray-600">
                  S'assurer que "Edge détecté" est affiché ci-dessus
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">2. Vérifier les tailles</h4>
                <p className="text-sm text-gray-600">
                  "Mot du Directeur" et "Sécurité du Travail" doivent avoir la même taille
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">3. Vérifier les classes Tailwind</h4>
                <p className="text-sm text-gray-600">
                  Les tailles doivent être réduites par rapport à Chrome
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">4. Si les styles ne s'appliquent pas</h4>
                <p className="text-sm text-gray-600">
                  Vérifier que le fichier globals.css est bien chargé et que les media queries Edge fonctionnent
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






