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
      <Card className="h-[20rem] sm:h-[24rem] lg:h-[28rem] bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
        {/* Effet de brillance en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Icônes décoratives d'enveloppe et boîte aux lettres - Responsive */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <svg className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        {/* Icône de boîte aux lettres en bas à gauche - Responsive */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        
        {/* Header avec design amélioré - Responsive */}
        <CardHeader className="pb-2 sm:pb-3 lg:pb-4 flex-shrink-0 relative z-10 p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-orange-200 group-hover:scale-110 transition-all duration-300">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <span className="hidden sm:inline">Boîte à Idées</span>
            <span className="sm:hidden">Idées</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center relative z-10 p-3 sm:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Icône d'ampoule scintillante - Responsive */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 animate-pulse">
                <Lightbulb className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white drop-shadow-lg" />
              </div>
              {/* Effet de scintillement */}
              <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 rounded-full mx-auto opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
            </div>
            
            {/* Texte principal - Responsive */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">
                <span className="hidden sm:inline">Une suggestion ?</span>
                <span className="sm:hidden">Suggestion ?</span>
              </h3>
              
              {/* Bouton cliquable - Responsive */}
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <span className="hidden sm:inline">→</span>
                  <span className="sm:hidden">→</span>
                  <span className="hidden lg:inline">Renseignez la boîte à idées anonyme</span>
                  <span className="hidden sm:inline lg:hidden">Renseigner la boîte à idées</span>
                  <span className="sm:hidden">Boîte à idées</span>
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
