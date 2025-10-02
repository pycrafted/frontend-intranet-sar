"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"
import { IdeaBoxModal } from "@/components/idea-box-modal"

export function IdeaBoxWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="h-[28rem] bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
        {/* Effet de brillance en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Icônes décoratives d'enveloppe et boîte aux lettres */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        {/* Icône de boîte aux lettres en bas à gauche */}
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        
        {/* Header avec design amélioré */}
        <CardHeader className="pb-4 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-orange-200 group-hover:scale-110 transition-all duration-300">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              💡 Boîte à Idées
            </CardTitle>
            <div className="text-right mr-24">
              <div className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                🔒 Anonyme
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
          <div className="space-y-8">
            {/* Icône d'ampoule scintillante */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 animate-pulse">
                <Lightbulb className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
              {/* Effet de scintillement */}
              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 rounded-full mx-auto opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
            </div>
            
            {/* Texte principal */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">
                Une suggestion ?
              </h3>
              
              {/* Bouton cliquable */}
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
              >
                <span className="flex items-center gap-3">
                  → Renseignez la boîte à idées anonyme
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <IdeaBoxModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
