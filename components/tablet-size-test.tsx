"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTabletDetection } from "@/hooks/useTabletDetection"
import { CheckCircle, AlertTriangle, Monitor, Tablet } from "lucide-react"

export function TabletSizeTest() {
  const { isTablet, isSpecificTablet, deviceType, screenSize, specificDevice } = useTabletDetection()

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'tablet': return <Tablet className="h-6 w-6 text-green-600" />
      case 'desktop': return <Monitor className="h-6 w-6 text-purple-600" />
      default: return <Monitor className="h-6 w-6 text-gray-600" />
    }
  }

  const getDeviceColor = () => {
    switch (deviceType) {
      case 'tablet': return 'bg-green-100 text-green-800'
      case 'desktop': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test de Taille des Cartes sur Tablette
        </h1>
        <p className="text-gray-600">
          Vérification que toutes les cartes ont la même taille (pleine largeur) sur tablette
        </p>
      </div>

      {/* Informations de détection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getDeviceIcon()}
            Détection de l'Appareil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={getDeviceColor()}>
                  {deviceType.toUpperCase()}
                </Badge>
                <span className="font-semibold">
                  Type d'appareil détecté
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {isTablet ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span>
                  {isTablet ? "Tablette détectée - Toutes les cartes en pleine largeur" : "Desktop - Cartes en grille"}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Résolution d'écran :</h4>
                <div className="text-sm space-y-1">
                  <div>Largeur: {screenSize.width}px</div>
                  <div>Hauteur: {screenSize.height}px</div>
                  <div>Ratio: {(screenSize.width / screenSize.height).toFixed(2)}</div>
                </div>
              </div>
              
              {specificDevice && (
                <div className="bg-green-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Appareil spécifique :</h4>
                  <div className="text-sm">
                    <Badge className="bg-green-500 text-white">
                      {specificDevice.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test des cartes avec les mêmes classes que le dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Cartes - Classes CSS Appliquées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 tablet:grid-cols-1 gap-4">
              {/* Carte Actualités - Large */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    📰
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Actualités (Large)</h3>
                    <p className="text-sm text-blue-200/80">Taille: large</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ col-span-1 tablet:col-span-12" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Mot du Directeur - Medium */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    👑
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Mot du Directeur (Medium)</h3>
                    <p className="text-sm text-red-200/80">Taille: medium</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ col-span-1 tablet:col-span-12" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Sécurité - Medium */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Sécurité du Travail (Medium)</h3>
                    <p className="text-sm text-green-200/80">Taille: medium</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ col-span-1 tablet:col-span-12" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Accès Rapide - Medium */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Accès Rapide (Medium)</h3>
                    <p className="text-sm text-purple-200/80">Taille: medium</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ col-span-1 tablet:col-span-12" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Événements - Medium */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Événements (Medium)</h3>
                    <p className="text-sm text-orange-200/80">Taille: medium</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ col-span-1 tablet:col-span-12" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Boîte à Idées - Medium */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    💡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Boîte à Idées (Medium)</h3>
                    <p className="text-sm text-yellow-200/80">Taille: medium</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ col-span-1 tablet:col-span-12" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Menu Restaurant - Full */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    🍽️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Menu de la Semaine (Full)</h3>
                    <p className="text-sm text-indigo-200/80">Taille: full</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ col-span-1 tablet:col-span-12" : "❌ Taille normale sur desktop"}
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
                <h4 className="font-semibold">1. Test sur Tablette</h4>
                <p className="text-sm text-gray-600">
                  Toutes les cartes doivent avoir la même largeur (pleine largeur de l'écran)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">2. Test sur Desktop</h4>
                <p className="text-sm text-gray-600">
                  Les cartes doivent avoir des tailles différentes selon leur configuration
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">3. Vérification Menu Restaurant</h4>
                <p className="text-sm text-gray-600">
                  Le "Menu de la Semaine" doit maintenant avoir la même largeur que les autres cartes sur tablette
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}







