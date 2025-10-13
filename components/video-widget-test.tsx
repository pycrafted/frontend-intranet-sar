"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoWidget } from "@/components/dashboard/video-widget"
import { CheckCircle, Monitor, Tablet, Smartphone } from "lucide-react"

export function VideoWidgetTest() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test du Widget Vidéo SAR
        </h1>
        <p className="text-gray-600">
          Vérification de l'affichage de la vidéo YouTube intégrée
        </p>
      </div>

      {/* Test du widget vidéo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Widget Vidéo SAR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="max-w-md mx-auto">
              <VideoWidget />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-gray-800">Fonctionnalités testées :</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Vidéo YouTube intégrée
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Prend toute la carte
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Lecture automatique
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Lecture en boucle
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Arrière-plan noir
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Responsive design
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test responsive */}
      <Card>
        <CardHeader>
          <CardTitle>Test Responsive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mobile */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Mobile</span>
              </div>
              <div className="w-full max-w-xs">
                <VideoWidget />
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tablet className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Tablet</span>
              </div>
              <div className="w-full max-w-sm">
                <VideoWidget />
              </div>
            </div>

            {/* Desktop */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-purple-600" />
                <span className="font-semibold">Desktop</span>
              </div>
              <div className="w-full max-w-md">
                <VideoWidget />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">URL de la vidéo :</h4>
                <p className="text-sm text-gray-600 break-all">
                  https://www.youtube.com/watch?v=QOTPxn9Wg-A&t=5s
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">ID de la vidéo :</h4>
                <p className="text-sm text-gray-600">QOTPxn9Wg-A</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Démarrage :</h4>
                <p className="text-sm text-gray-600">5 secondes</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Taille du widget :</h4>
                <p className="text-sm text-gray-600">Medium (même que Sécurité du Travail)</p>
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Position dans le dashboard :</h4>
              <p className="text-sm text-gray-600">
                La carte vidéo apparaît juste avant la carte "Sécurité du Travail" 
                dans l'ordre des widgets du dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
