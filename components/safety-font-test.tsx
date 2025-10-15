"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { CheckCircle, Monitor, AlertTriangle } from "lucide-react"

export function SafetyFontTest() {
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
          Test des Tailles de Police - Sécurité
        </h1>
        <p className="text-gray-600">
          Vérification des tailles réduites pour Edge sur les compteurs de sécurité
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Monitor className="h-6 w-6 text-blue-600" />
          <span className="font-semibold">
            {isEdge ? "Microsoft Edge (Tailles optimisées)" : "Autre navigateur"}
          </span>
        </div>
      </div>

      {/* Test des compteurs de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Compteurs de Sécurité - Tailles Optimisées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compteur SAR */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                    🛡️
                  </div>
                  <div>
                    <h3 className="widget-title text-white">Sécurité du Travail</h3>
                    <p className="widget-subtitle text-blue-200/80">
                      Compteurs de jours sans accident
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="safety-counter-number">1</div>
                  <div className="safety-counter-label">Jour</div>
                  <div className="safety-counter-subtitle">sans accident</div>
                  <div className="safety-counter-subtitle">interne</div>
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                  <span className="safety-counter-subtitle">Attention</span>
                </div>
              </div>
            </div>

            {/* Compteur EE */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                    👥
                  </div>
                  <div>
                    <h3 className="widget-title text-white">EE</h3>
                    <p className="widget-subtitle text-emerald-200/80">
                      Employés externes
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="safety-counter-number">1</div>
                  <div className="safety-counter-label">Jour</div>
                  <div className="safety-counter-subtitle">sans accident</div>
                  <div className="safety-counter-subtitle">externe</div>
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                  <span className="safety-counter-subtitle">Attention</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test du numéro vert */}
      <Card>
        <CardHeader>
          <CardTitle>Numéro Vert SAR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                📞
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">800 00 34 34</div>
                <div className="widget-subtitle text-green-200/80">Numéro vert SAR</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison des tailles */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des Tailles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Avant (trop gros)</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="text-2xl">1 (trop gros)</div>
                  <div className="text-lg">Jour (trop gros)</div>
                  <div className="text-base">sans accident (trop gros)</div>
                  <div className="text-sm">interne (trop gros)</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Après (optimisé)</h4>
                <div className="space-y-1">
                  <div className="safety-counter-number text-blue-600">1</div>
                  <div className="safety-counter-label text-gray-600">Jour</div>
                  <div className="safety-counter-subtitle text-gray-500">sans accident</div>
                  <div className="safety-counter-subtitle text-gray-500">interne</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle>Statut d'Optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {isEdge ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <h4 className="font-semibold">
                  {isEdge ? "Tailles optimisées pour Edge" : "Optimisation non visible"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isEdge 
                    ? "Les tailles de police sont maintenant réduites et proportionnées pour Edge"
                    : "Les optimisations ne sont visibles que sur Microsoft Edge"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Compteurs de sécurité</h4>
                <p className="text-sm text-gray-600">
                  Tailles réduites : 1.25rem → 1.75rem (au lieu de 1.5rem → 2.25rem)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Labels et sous-titres</h4>
                <p className="text-sm text-gray-600">
                  Tailles réduites : 0.625rem → 0.875rem (au lieu de 0.75rem → 1rem)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Titres des widgets</h4>
                <p className="text-sm text-gray-600">
                  Tailles réduites : 0.875rem → 1.125rem (au lieu de 1rem → 1.25rem)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




