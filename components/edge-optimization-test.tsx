"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { CheckCircle, XCircle, Monitor, Globe, AlertTriangle } from "lucide-react"

export function EdgeOptimizationTest() {
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
  const isChrome = browserInfo.isChrome

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test d'Optimisation Edge
        </h1>
        <p className="text-gray-600">
          Design optimisé pour Microsoft Edge - Navigateur principal de l'entreprise
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          {isEdge ? (
            <Monitor className="h-6 w-6 text-blue-600" />
          ) : (
            <Globe className="h-6 w-6 text-gray-600" />
          )}
          <span className="font-semibold">
            {isEdge ? "Microsoft Edge (Optimisé)" : isChrome ? "Google Chrome" : "Autre navigateur"}
          </span>
        </div>
      </div>

      {/* Section Hero Optimisée pour Edge */}
      <Card>
        <CardHeader>
          <CardTitle>Section Hero - Optimisée pour Edge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gradient-fallback bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 sm:p-6 lg:p-8 text-white edge-optimized-hero">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 break-words edge-hero-title">
                  Bonjour, Utilisateur ! 👋
                </h1>
                <p className="text-sm sm:text-base opacity-90 mb-3 break-words edge-hero-subtitle">
                  Bienvenue sur votre tableau de bord de l'application intranet de la SAR
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm edge-hero-meta">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Lundi 16 décembre 2024</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 bg-white rounded-full"></div>
                    <span className="font-medium break-words">Directeur IT</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs opacity-75 break-words">Matricule: 12345</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test des Cartes Draggables */}
      <Card>
        <CardHeader>
          <CardTitle>Cartes Draggables - Optimisées pour Edge</CardTitle>
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
                  Contenu de l'article optimisé pour Edge avec des tailles de police harmonisées.
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

      {/* Test des Tailles de Police */}
      <Card>
        <CardHeader>
          <CardTitle>Tailles de Police - Optimisées pour Edge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Tailles de base</h4>
                <div className="space-y-1">
                  <div className="text-xs">text-xs - 12px (optimisé pour Edge)</div>
                  <div className="text-sm">text-sm - 14px (optimisé pour Edge)</div>
                  <div className="text-base">text-base - 16px (optimisé pour Edge)</div>
                  <div className="text-lg">text-lg - 18px (optimisé pour Edge)</div>
                  <div className="text-xl">text-xl - 20px (optimisé pour Edge)</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Composants spécifiques</h4>
                <div className="space-y-1">
                  <div className="widget-title">Titre de widget</div>
                  <div className="widget-subtitle">Sous-titre de widget</div>
                  <div className="flex gap-2">
                    <Badge className="badge-text">Badge</Badge>
                    <Badge variant="outline" className="badge-text">Outline</Badge>
                  </div>
                  <div className="metadata-text">Métadonnées</div>
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
                  {isEdge ? "Optimisé pour Edge" : "Non optimisé"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isEdge 
                    ? "Vous utilisez Microsoft Edge - Design optimisé activé"
                    : "Vous n'utilisez pas Edge - Certaines optimisations peuvent ne pas être visibles"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Tailles de police harmonisées</h4>
                <p className="text-sm text-gray-600">
                  Toutes les tailles de police sont optimisées pour Edge avec des line-height et font-weight appropriés.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Grilles et flexbox optimisés</h4>
                <p className="text-sm text-gray-600">
                  Utilisation des préfixes -ms- pour une compatibilité maximale avec Edge.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Gradients et ombres</h4>
                <p className="text-sm text-gray-600">
                  Fallbacks et préfixes pour un rendu optimal sur Edge.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}








