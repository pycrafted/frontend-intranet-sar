"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MaiChatbot } from "./saria-chatbot"
import { Monitor, Tablet, Smartphone, RotateCcw } from "lucide-react"

export function ChatbotResponsiveTest() {
  const [currentViewport, setCurrentViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
    return () => window.removeEventListener('resize', updateWindowSize)
  }, [])

  const getViewportInfo = () => {
    const width = windowSize.width
    if (width < 640) return { type: 'mobile', name: 'Mobile', icon: Smartphone, color: 'bg-blue-500' }
    if (width < 1024) return { type: 'tablet', name: 'Tablette', icon: Tablet, color: 'bg-green-500' }
    return { type: 'desktop', name: 'Desktop', icon: Monitor, color: 'bg-purple-500' }
  }

  const viewportInfo = getViewportInfo()
  const Icon = viewportInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Test de Responsivité du Chatbot SARIA
            </h1>
            <div className="flex items-center gap-2">
              <Icon className="h-6 w-6" />
              <span className="font-medium">{viewportInfo.name}</span>
              <div className={`w-3 h-3 rounded-full ${viewportInfo.color}`}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Taille de l'écran</h3>
              <p className="text-sm text-gray-600">
                {windowSize.width} × {windowSize.height}px
              </p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Type d'appareil</h3>
              <p className="text-sm text-gray-600">{viewportInfo.name}</p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Breakpoint actuel</h3>
              <p className="text-sm text-gray-600">
                {windowSize.width < 640 ? '< 640px (Mobile)' : 
                 windowSize.width < 1024 ? '640px - 1024px (Tablette)' : 
                 '> 1024px (Desktop)'}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Instructions de test :</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Redimensionnez votre navigateur pour tester différentes tailles d'écran</li>
              <li>• Testez sur mobile en utilisant les outils de développement</li>
              <li>• Vérifiez que le chatbot s'adapte correctement à chaque taille</li>
              <li>• Testez les interactions tactiles sur mobile/tablette</li>
              <li>• Vérifiez que les animations sont fluides sur tous les appareils</li>
            </ul>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Fonctionnalités Responsives</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Tailles adaptatives selon l'écran</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Positionnement intelligent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Interactions tactiles optimisées</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Animations adaptées</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Mode minimisé sur desktop</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Support orientation paysage</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Breakpoints</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">Mobile</span>
                <span className="text-xs text-gray-600">< 640px</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">Tablette</span>
                <span className="text-xs text-gray-600">640px - 1024px</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="text-sm font-medium">Desktop</span>
                <span className="text-xs text-gray-600">> 1024px</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Le chatbot SARIA apparaît en bas à droite de l'écran
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Recharger la page
          </Button>
        </div>
      </div>

      {/* Le chatbot est rendu ici pour les tests */}
      <MaiChatbot />
    </div>
  )
}
