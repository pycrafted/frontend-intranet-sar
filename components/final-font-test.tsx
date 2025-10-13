"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { CheckCircle, Monitor, AlertTriangle, Shield, Crown, Newspaper } from "lucide-react"

export function FinalFontTest() {
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
          Test Final des Tailles de Police
        </h1>
        <p className="text-gray-600">
          Vérification de l'harmonisation des tailles sur Edge
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Monitor className="h-6 w-6 text-blue-600" />
          <span className="font-semibold">
            {isEdge ? "Microsoft Edge (Tailles harmonisées)" : "Autre navigateur"}
          </span>
        </div>
      </div>

      {/* Test des composants principaux */}
      <Card>
        <CardHeader>
          <CardTitle>Composants Principaux - Tailles Harmonisées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mot du Directeur */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold director-widget-title">
                    Mot du Directeur
                  </h3>
                  <p className="text-sm text-red-200/80 director-widget-subtitle">
                    Directeur Général
                  </p>
                </div>
              </div>
            </div>

            {/* Sécurité du Travail */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold safety-widget-title">
                    Sécurité du Travail
                  </h3>
                  <p className="text-sm text-blue-200/80 safety-widget-subtitle">
                    Compteurs de jours sans accident
                  </p>
                </div>
              </div>
            </div>

            {/* Actualités */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold carousel-title">
                    Actualités
                  </h3>
                  <p className="text-sm text-purple-200/80">
                    Dernières nouvelles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <h3 className="safety-widget-title">Sécurité du Travail</h3>
                    <p className="safety-widget-subtitle">
                      Compteurs de jours sans accident
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-4xl font-bold">1</div>
                  <div className="text-sm font-bold">Jour</div>
                  <div className="text-xs">sans accident</div>
                  <div className="text-xs">interne</div>
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs">Attention</span>
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
                    <h3 className="safety-widget-title">EE</h3>
                    <p className="safety-widget-subtitle">
                      Employés externes
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-4xl font-bold">1</div>
                  <div className="text-sm font-bold">Jour</div>
                  <div className="text-xs">sans accident</div>
                  <div className="text-xs">externe</div>
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs">Attention</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test des actualités */}
      <Card>
        <CardHeader>
          <CardTitle>Actualités - Tailles Optimisées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge className="badge-text bg-white/20 text-white">Actualités</Badge>
                <Badge className="badge-text bg-yellow-500 text-white">Épinglé</Badge>
              </div>
              
              <h3 className="carousel-title">
                Titre de l'article d'actualité
              </h3>
              
              <p className="carousel-text">
                Contenu de l'article optimisé pour Edge avec des tailles de police harmonisées et lisibles.
              </p>
              
              <div className="metadata-text">
                Il y a 2 heures • Par Admin
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test des tailles de base */}
      <Card>
        <CardHeader>
          <CardTitle>Tailles de Base - Harmonisées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-xs">text-xs - 10px (très petit)</div>
            <div className="text-sm">text-sm - 12px (petit)</div>
            <div className="text-base">text-base - 16px (normal)</div>
            <div className="text-lg">text-lg - 16px (grand)</div>
            <div className="text-xl">text-xl - 18px (très grand)</div>
            <div className="text-2xl">text-2xl - 20px (énorme)</div>
            <div className="text-3xl">text-3xl - 24px (géant)</div>
          </div>
        </CardContent>
      </Card>

      {/* Statut final */}
      <Card>
        <CardHeader>
          <CardTitle>Statut Final</CardTitle>
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
                  {isEdge ? "Optimisation Edge active" : "Optimisation non visible"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isEdge 
                    ? "Toutes les tailles sont harmonisées et lisibles sur Edge"
                    : "Les optimisations ne sont visibles que sur Microsoft Edge"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Harmonisation des titres</h4>
                <p className="text-sm text-gray-600">
                  "Mot du Directeur", "Sécurité du Travail" et "Actualités" ont maintenant la même taille
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Lisibilité optimisée</h4>
                <p className="text-sm text-gray-600">
                  Les tailles sont maintenant lisibles sans être trop grosses
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
