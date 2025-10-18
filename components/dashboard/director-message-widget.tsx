"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Crown, Quote, Star, Sparkles, Users, Building2, Award, X } from "lucide-react"
import Image from "next/image"

export function DirectorMessageWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fullMessage = `Chers clients et partenaires

Au service de l'économie sénégalaise, la Société Africaine de Raffinage (SAR) a pour mission d'approvisionner en produits pétroliers les entreprises et les distributeurs du pays de manière régulière et aux moindres coûts. Ainsi la SAR contribue activement à assurer la sécurité d'approvisionnement en énergie du Sénégal.

Cette fonction s'amplifie avec les perspectives de valorisation du pétrole brut de Sangomar. La SAR prendra toutes les dispositions pour relever les nouveaux défis ainsi posés et ceci avec le soutien et l'accompagnement des pouvoirs publics.

La transparence, la responsabilité sociale, la forte exigence de qualité, et la sécurité sont au cœur de la gouvernance de la SAR. La plateforme sur laquelle nous nous réjouissons de vous accueillir est une porte ouverte sur nos activités, les services et les opportunités de stages et d'emplois. N'hésitez pas à transmettre vos suggestions et à tirer le meilleur profit de cet outil.

Nous prenons l'engagement d'améliorer de façon continue le site pour vous servir toujours mieux.

Visitez-le régulièrement, communiquez avec nous et partagez dans vos réseaux sociaux les informations sur l'actualité des hydrocarbures au Sénégal; vous contribuerez ainsi à faire de la SAR une entreprise ouverte sur la société, un instrument précieux des transformations économiques et sociales en cours.

Le Directeur Général`

  const shortMessage = "Au service de l'économie sénégalaise, la SAR contribue activement à assurer la sécurité d'approvisionnement en énergie au Sénégal"

  return (
    <>
      <Card 
        className="h-[20rem] sm:h-[24rem] lg:h-[28rem] border-0 hover:shadow-2xl transition-all duration-700 group flex flex-col overflow-hidden relative"
        style={{ 
          backgroundImage: 'url(/directeur.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          imageRendering: 'crisp-edges',
          WebkitImageRendering: 'crisp-edges',
          imageRendering: 'high-quality',
          WebkitImageRendering: 'high-quality',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          boxShadow: '0 4px 6px -1px rgba(238, 0, 9, 0.1), 0 2px 4px -1px rgba(238, 0, 9, 0.06)'
        }}
      >
        {/* Overlay minimal pour préserver la netteté de l'image */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.15) 100%)'
          }}
        ></div>
        
        {/* Effet de brillance en arrière-plan subtil */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(59, 130, 246, 0.1) 100%)'
          }}
        ></div>
        
        {/* Icônes décoratives avec couleur diluée - Responsive */}
        <div 
          className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:scale-110"
          style={{ background: 'rgba(238, 0, 9, 0.7)' }}
        >
          <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-lg" />
        </div>
        
        {/* Icône de citation en bas à gauche - Responsive */}
        <div 
          className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
          style={{ background: 'rgba(238, 0, 9, 0.6)' }}
        >
          <Quote className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
        
        {/* Header avec design SAR - Responsive */}
        <CardHeader className="pb-2 sm:pb-4 flex-shrink-0 relative z-10 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:transition-colors duration-500 flex items-center gap-2 sm:gap-3">
              <div 
                className="p-2 sm:p-3 rounded-xl shadow-2xl group-hover:scale-110 transition-all duration-500"
                style={{ 
                  background: 'rgba(238, 0, 9, 0.9)',
                  boxShadow: '0 8px 20px rgba(238, 0, 9, 0.3)'
                }}
              >
                <Crown className="h-4 w-4 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
              </div>
              <div className="flex flex-col min-w-0">
                <span 
                  className="text-sm sm:text-lg group-hover:transition-colors duration-500 break-words director-widget-title font-bold"
                  style={{ color: 'rgba(0, 0, 0, 0.9)' }}
                >
                  Mot du Directeur
                </span>
                <span className="text-xs sm:text-sm font-normal text-gray-700 group-hover:transition-colors duration-500 director-widget-subtitle">
                  Directeur Général
                </span>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center relative z-10 pt-2 sm:pt-4 p-3 sm:p-6">
          <div className="space-y-4 sm:space-y-6 w-full">
            {/* Citation professionnelle avec design corporate - Responsive */}
            <div 
              className="relative overflow-hidden transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-2xl mx-2 sm:mx-4"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(238, 0, 9, 0.1)',
                borderRadius: '16px'
              }}
            >
              {/* Barre de couleur SAR en haut */}
              <div 
                className="h-1 w-full"
                style={{ 
                  background: 'linear-gradient(90deg, #ee0009 0%, #c41e3a 50%, #ee0009 100%)'
                }}
              ></div>
              
              {/* Contenu principal */}
              <div className="p-4 sm:p-5">
                {/* Texte de citation avec typographie professionnelle */}
                <blockquote className="text-center">
                  <p 
                    className="text-gray-800 text-sm sm:text-base leading-relaxed font-medium italic"
                    style={{ 
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      lineHeight: '1.5',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    "{shortMessage}"
                  </p>
                </blockquote>
              </div>
              
              {/* Effet de brillance subtil */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ 
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)'
                }}
              ></div>
            </div>
            
            {/* Bouton d'action professionnel - Responsive */}
            <div className="pt-3 sm:pt-4">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="group relative overflow-hidden rounded-lg px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white border-0 transition-all duration-300 hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, #ee0009 0%, #c41e3a 100%)',
                  boxShadow: '0 6px 20px rgba(238, 0, 9, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(238, 0, 9, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(238, 0, 9, 0.3)'
                }}
              >
                <span className="flex items-center gap-2 relative z-10">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Lire le message complet</span>
                  <span className="sm:hidden">Lire plus</span>
                </span>
                {/* Effet de brillance au survol */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                ></div>
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Effet de lueur au survol */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </Card>

      {/* Modal avec le message complet - Design élégant */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="max-w-5xl lg:max-w-6xl max-h-[95vh] border-0 shadow-2xl mx-2 sm:mx-4 p-0 rounded-2xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Barre de couleur SAR en haut */}
          <div 
            className="h-2 w-full"
            style={{ 
              background: 'linear-gradient(90deg, #ee0009 0%, #c41e3a 50%, #ee0009 100%)'
            }}
          ></div>
          
          <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </DialogClose>
          
          {/* Header élégant avec photo et informations */}
          <div className="relative p-6 pb-4">
            {/* Motifs décoratifs */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100/30 to-orange-100/30 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="flex flex-col items-center gap-4 relative z-10">
              {/* Photo du directeur avec design sophistiqué */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
                  <div 
                    className="absolute inset-0 rounded-full p-1 shadow-2xl"
                    style={{ 
                      background: 'linear-gradient(135deg, #ee0009 0%, #c41e3a 100%)',
                      boxShadow: '0 15px 30px rgba(238, 0, 9, 0.3)'
                    }}
                  >
                    <div className="w-full h-full bg-white rounded-full p-1 shadow-inner">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                        <Image
                          src="/directeur.jpg"
                          alt="Directeur Général SAR"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Icône de couronne */}
                <div 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #ee0009 0%, #c41e3a 100%)',
                    boxShadow: '0 8px 20px rgba(238, 0, 9, 0.3)'
                  }}
                >
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              
              {/* Informations du directeur */}
              <div className="text-center">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  M. Mamadou Abib Diop
                </DialogTitle>
                <div 
                  className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-medium"
                  style={{ 
                    background: 'linear-gradient(135deg, #ee0009 0%, #c41e3a 100%)',
                    boxShadow: '0 8px 20px rgba(238, 0, 9, 0.3)'
                  }}
                >
                  <Award className="h-4 w-4" />
                  <span>Le Directeur Général</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenu du message avec design élégant */}
          <div className="px-6 pb-6">
            <div 
              className="rounded-2xl p-6 shadow-xl border"
              style={{ 
                background: '#344256',
                borderColor: 'rgba(238, 0, 9, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="prose max-w-none">
                <div className="text-gray-100 leading-relaxed space-y-4 text-sm sm:text-base">
                  {fullMessage.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-justify font-normal">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Signature en bas */}
            <div className="text-center pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Building2 className="h-4 w-4" />
                <p className="text-base font-semibold">Société Africaine de Raffinage (SAR)</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
