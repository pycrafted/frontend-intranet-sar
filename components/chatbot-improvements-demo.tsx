"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Smartphone, Tablet, Monitor, Zap, Shield, Palette } from "lucide-react"

export function ChatbotImprovementsDemo() {
  const improvements = [
    {
      category: "Responsive Design",
      icon: Smartphone,
      color: "bg-blue-500",
      items: [
        "Adaptation automatique à toutes les tailles d'écran",
        "Breakpoints optimisés (Mobile < 640px, Tablette 640-1024px, Desktop > 1024px)",
        "Positionnement intelligent selon l'appareil",
        "Support orientation paysage et portrait"
      ]
    },
    {
      category: "Interactions Tactiles",
      icon: Tablet,
      color: "bg-green-500",
      items: [
        "Boutons optimisés pour le touch (min 44px)",
        "Animations adaptées aux appareils tactiles",
        "Gestion du clavier virtuel mobile",
        "Touch-action optimisé pour les performances"
      ]
    },
    {
      category: "Performance",
      icon: Zap,
      color: "bg-yellow-500",
      items: [
        "Animations fluides sur tous les appareils",
        "Will-change et contain CSS pour l'optimisation",
        "Animations réduites pour les utilisateurs préférant moins de mouvement",
        "Rendu optimisé pour les écrans haute résolution"
      ]
    },
    {
      category: "Accessibilité",
      icon: Shield,
      color: "bg-purple-500",
      items: [
        "Support du mode sombre automatique",
        "Respect des préférences d'accessibilité",
        "Labels ARIA appropriés",
        "Navigation au clavier optimisée"
      ]
    },
    {
      category: "Expérience Utilisateur",
      icon: Palette,
      color: "bg-pink-500",
      items: [
        "Mode minimisé sur desktop",
        "Tailles de police adaptatives",
        "Espacement optimisé selon l'écran",
        "Transitions fluides entre les états"
      ]
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Améliorations du Chatbot SARIA
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Le chatbot SARIA a été entièrement repensé pour offrir une expérience utilisateur 
          optimale sur tous les appareils, de l'écran de smartphone aux grands écrans desktop.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {improvements.map((improvement, index) => {
          const Icon = improvement.icon
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${improvement.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {improvement.category}
                </h3>
              </div>
              <ul className="space-y-2">
                {improvement.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Détails Techniques</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Breakpoints CSS</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm font-medium">Mobile</span>
                <Badge variant="secondary">@media (max-width: 640px)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm font-medium">Tablette</span>
                <Badge variant="secondary">@media (640px - 1024px)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm font-medium">Desktop</span>
                <Badge variant="secondary">@media (min-width: 1024px)</Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Fonctionnalités Clés</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Détection de taille d'écran en temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Redimensionnement adaptatif des composants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Gestion intelligente de l'espace</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Optimisations de performance</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          Testez le chatbot responsive en visitant la page de test
        </p>
        <a 
          href="/test-chatbot-responsive" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Monitor className="h-4 w-4" />
          Tester la Responsivité
        </a>
      </div>
    </div>
  )
}
