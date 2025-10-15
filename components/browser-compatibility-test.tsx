"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { CheckCircle, XCircle, AlertTriangle, Monitor, Globe } from "lucide-react"

export function BrowserCompatibilityTest() {
  const { browserInfo, compatibleClasses, useFallbacks, isClient } = useBrowserDetection()

  if (!isClient) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Détection du navigateur...</span>
        </div>
      </Card>
    )
  }

  const getBrowserIcon = () => {
    if (browserInfo.isEdge) return <Monitor className="h-6 w-6 text-blue-600" />
    if (browserInfo.isChrome) return <Globe className="h-6 w-6 text-green-600" />
    if (browserInfo.isFirefox) return <Globe className="h-6 w-6 text-orange-600" />
    if (browserInfo.isSafari) return <Globe className="h-6 w-6 text-blue-500" />
    return <Globe className="h-6 w-6 text-gray-600" />
  }

  const getBrowserName = () => {
    if (browserInfo.isEdge) return "Microsoft Edge"
    if (browserInfo.isChrome) return "Google Chrome"
    if (browserInfo.isFirefox) return "Mozilla Firefox"
    if (browserInfo.isSafari) return "Safari"
    if (browserInfo.isIE) return "Internet Explorer"
    return "Navigateur inconnu"
  }

  const getCompatibilityScore = () => {
    let score = 0
    if (browserInfo.supportsBackdropFilter) score += 25
    if (browserInfo.supportsCSSGrid) score += 25
    if (browserInfo.supportsFlexbox) score += 25
    if (!useFallbacks) score += 25
    return score
  }

  const score = getCompatibilityScore()
  const getScoreColor = () => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = () => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test de Compatibilité Cross-Browser
        </h1>
        <p className="text-gray-600">
          Vérification de la compatibilité entre Chrome et Edge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations du navigateur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getBrowserIcon()}
              Informations du Navigateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Navigateur :</span>
              <Badge variant="outline">{getBrowserName()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Version :</span>
              <span className="text-sm text-gray-600">{browserInfo.version}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Score de compatibilité :</span>
              <Badge className={getScoreBadge()}>
                <span className={getScoreColor()}>{score}%</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Support des fonctionnalités */}
        <Card>
          <CardHeader>
            <CardTitle>Support des Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Backdrop Filter</span>
              {browserInfo.supportsBackdropFilter ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">CSS Grid</span>
              {browserInfo.supportsCSSGrid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Flexbox</span>
              {browserInfo.supportsFlexbox ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fallbacks activés</span>
              {useFallbacks ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes compatibles appliquées */}
      <Card>
        <CardHeader>
          <CardTitle>Classes Compatibles Appliquées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Gradient :</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                {compatibleClasses.gradient || 'Aucune classe spéciale'}
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Backdrop Blur :</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                {compatibleClasses.backdropBlur}
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Grid :</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                {compatibleClasses.grid}
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Animation :</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                {compatibleClasses.animation}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test visuel */}
      <Card>
        <CardHeader>
          <CardTitle>Test Visuel des Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test de gradient */}
            <div>
              <h4 className="font-semibold mb-2">Test de Gradient :</h4>
              <div className={`h-16 rounded-lg ${compatibleClasses.gradient} bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold`}>
                Gradient Test
              </div>
            </div>

            {/* Test de backdrop-filter */}
            <div>
              <h4 className="font-semibold mb-2">Test de Backdrop Filter :</h4>
              <div className="relative h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                <div className={`absolute inset-0 ${compatibleClasses.backdropBlur} flex items-center justify-center text-gray-800 font-bold`}>
                  Backdrop Filter Test
                </div>
              </div>
            </div>

            {/* Test de grille */}
            <div>
              <h4 className="font-semibold mb-2">Test de CSS Grid :</h4>
              <div className={`${compatibleClasses.grid} grid-cols-3 gap-2`}>
                <div className="h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm">1</div>
                <div className="h-8 bg-green-500 rounded flex items-center justify-center text-white text-sm">2</div>
                <div className="h-8 bg-purple-500 rounded flex items-center justify-center text-white text-sm">3</div>
              </div>
            </div>

            {/* Test d'animation */}
            <div>
              <h4 className="font-semibold mb-2">Test d'Animation :</h4>
              <div className={`h-8 w-8 bg-red-500 rounded-full ${compatibleClasses.animation} animate-spin`}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          {score >= 90 ? (
            <div className="text-green-600">
              <CheckCircle className="h-5 w-5 inline mr-2" />
              Excellent ! Votre navigateur supporte toutes les fonctionnalités modernes.
            </div>
          ) : score >= 70 ? (
            <div className="text-yellow-600">
              <AlertTriangle className="h-5 w-5 inline mr-2" />
              Bon ! Quelques fonctionnalités peuvent être limitées, mais l'expérience reste fluide.
            </div>
          ) : (
            <div className="text-red-600">
              <XCircle className="h-5 w-5 inline mr-2" />
              Attention ! Certaines fonctionnalités ne sont pas supportées. Les fallbacks sont activés.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




