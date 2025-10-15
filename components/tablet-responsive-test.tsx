"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTabletDetection } from "@/hooks/useTabletDetection"
import { Monitor, Tablet, Smartphone, CheckCircle, AlertTriangle } from "lucide-react"

export function TabletResponsiveTest() {
  const { isTablet, isSpecificTablet, deviceType, screenSize, specificDevice } = useTabletDetection()

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-6 w-6 text-blue-600" />
      case 'tablet': return <Tablet className="h-6 w-6 text-green-600" />
      case 'desktop': return <Monitor className="h-6 w-6 text-purple-600" />
      default: return <Monitor className="h-6 w-6 text-gray-600" />
    }
  }

  const getDeviceColor = () => {
    switch (deviceType) {
      case 'mobile': return 'bg-blue-100 text-blue-800'
      case 'tablet': return 'bg-green-100 text-green-800'
      case 'desktop': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test de Responsivité Tablettes
        </h1>
        <p className="text-gray-600">
          Vérification de l'affichage en taille pleine sur les tablettes spécifiées
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
                  {isTablet ? "Tablette détectée" : "Pas une tablette"}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {isSpecificTablet ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span>
                  {isSpecificTablet ? "Tablette spécifique détectée" : "Tablette générique"}
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

      {/* Test des cartes en taille pleine */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Cartes en Taille Pleine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 tablet:grid-cols-1 gap-4">
              {/* Carte Actualités */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    📰
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Actualités</h3>
                    <p className="text-sm text-blue-200/80">Dernières nouvelles</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ Taille pleine sur tablette" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Mot du Directeur */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    👑
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Mot du Directeur</h3>
                    <p className="text-sm text-red-200/80">Directeur Général</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ Taille pleine sur tablette" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Sécurité */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Sécurité du Travail</h3>
                    <p className="text-sm text-green-200/80">Compteurs de jours</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ Taille pleine sur tablette" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Accès Rapide */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Accès Rapide</h3>
                    <p className="text-sm text-purple-200/80">Applications & Services</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ Taille pleine sur tablette" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Événements */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Événements</h3>
                    <p className="text-sm text-orange-200/80">Calendrier des événements</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ Taille pleine sur tablette" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Boîte à Idées */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    💡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Boîte à Idées</h3>
                    <p className="text-sm text-yellow-200/80">Soumettre des idées</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ Taille pleine sur tablette" : "❌ Taille normale sur desktop"}
                </div>
              </div>

              {/* Carte Menu Restaurant */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    🍽️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Menu de la Semaine</h3>
                    <p className="text-sm text-indigo-200/80">Restaurant d'entreprise</p>
                  </div>
                </div>
                <div className="text-sm">
                  {isTablet ? "✅ Taille pleine sur tablette" : "❌ Taille normale sur desktop"}
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
                <h4 className="font-semibold">1. Test sur iPad Mini (768x1024)</h4>
                <p className="text-sm text-gray-600">
                  Toutes les cartes doivent s'afficher en taille pleine (une par ligne)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">2. Test sur iPad Air (820x1180)</h4>
                <p className="text-sm text-gray-600">
                  Même comportement que iPad Mini
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">3. Test sur iPad Pro (1024x1366)</h4>
                <p className="text-sm text-gray-600">
                  Cartes en taille pleine avec plus d'espace
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">4. Test sur Surface Pro 7 (912x1368)</h4>
                <p className="text-sm text-gray-600">
                  Comportement tablette activé
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">5. Test sur ASUS ZenBook Fold (853x1280)</h4>
                <p className="text-sm text-gray-600">
                  Détection tablette et affichage pleine largeur
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">6. Test sur Nest Hub (1024x600)</h4>
                <p className="text-sm text-gray-600">
                  Format paysage avec cartes pleine largeur
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




