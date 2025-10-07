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

  const shortMessage = "Au service de l'économie sénégalaise, la SAR contribue activement à assurer la sécurité d'approvisionnement en énergie du Sénégal..."

  return (
    <>
      <Card 
        className="h-[28rem] border-0 hover:shadow-2xl transition-all duration-700 group flex flex-col overflow-hidden relative"
        style={{ 
          backgroundImage: 'url(/directeur.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow: '0 4px 6px -1px rgba(238, 0, 9, 0.1), 0 2px 4px -1px rgba(238, 0, 9, 0.06)'
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.85) 100%)'
          }}
        ></div>
        
        {/* Effet de brillance en arrière-plan subtil */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            background: 'linear-gradient(135deg, rgba(238, 0, 9, 0.1) 0%, transparent 50%, rgba(238, 0, 9, 0.1) 100%)'
          }}
        ></div>
        
        {/* Icônes décoratives avec couleur diluée */}
        <div 
          className="absolute top-4 right-4 w-16 h-16 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:scale-110"
          style={{ background: 'rgba(238, 0, 9, 0.7)' }}
        >
          <Crown className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
        
        {/* Icône de citation en bas à gauche */}
        <div 
          className="absolute bottom-4 left-4 w-12 h-12 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
          style={{ background: 'rgba(238, 0, 9, 0.6)' }}
        >
          <Quote className="h-6 w-6 text-white" />
        </div>
        
        {/* Header avec design SAR */}
        <CardHeader className="pb-4 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:transition-colors duration-500 flex items-center gap-3">
              <div 
                className="p-3 rounded-xl shadow-2xl group-hover:scale-110 transition-all duration-500"
                style={{ 
                  background: 'rgba(238, 0, 9, 0.8)',
                  boxShadow: '0 8px 20px rgba(238, 0, 9, 0.2)'
                }}
              >
                <Crown className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div className="flex flex-col">
                <span 
                  className="text-lg group-hover:transition-colors duration-500"
                  style={{ color: 'rgba(238, 0, 9, 0.8)' }}
                >
                  👑 Mot du Directeur
                </span>
                <span className="text-sm font-normal text-gray-600 group-hover:transition-colors duration-500">
                  Directeur Général
                </span>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center relative z-10 pt-4">
          <div className="space-y-6 w-full">
            {/* Citation résumée avec design SAR */}
            <div 
              className="backdrop-blur-sm rounded-xl p-6 border transition-all duration-500 shadow-lg mx-4"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(238, 0, 9, 0.2)',
                boxShadow: '0 8px 30px rgba(238, 0, 9, 0.15)'
              }}
            >
              <p className="text-gray-800 group-hover:text-gray-900 text-base leading-relaxed italic font-medium">
                "{shortMessage}"
              </p>
            </div>
            
            {/* Bouton d'action SAR */}
            <div className="pt-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="text-white rounded-xl shadow-2xl transition-all duration-500 transform hover:scale-105 px-8 py-4 text-lg font-semibold border-0"
                style={{ 
                  background: 'rgba(238, 0, 9, 0.9)',
                  boxShadow: '0 10px 25px rgba(238, 0, 9, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(238, 0, 9, 1)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(238, 0, 9, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(238, 0, 9, 0.9)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(238, 0, 9, 0.4)'
                }}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6" />
                  Lire le message complet
                </span>
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Effet de lueur au survol */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </Card>

      {/* Modal avec le message complet */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="max-w-4xl max-h-[80vh] overflow-y-auto border-0 shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #ffffff 100%)',
            boxShadow: '0 25px 50px rgba(238, 0, 9, 0.2)'
          }}
        >
          <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </DialogClose>
          <DialogHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div 
                className="p-4 rounded-full shadow-xl"
                style={{ 
                  background: 'rgba(238, 0, 9, 0.8)',
                  boxShadow: '0 8px 20px rgba(238, 0, 9, 0.3)'
                }}
              >
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Crown className="h-8 w-8" style={{ color: 'rgba(238, 0, 9, 0.8)' }} />
                  Message du Directeur Général
                </DialogTitle>
                <p className="text-gray-600 mt-2">Société Africaine de Raffinage (SAR)</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Photo du directeur dans le modal */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-40 h-40 relative">
                  <div 
                    className="absolute inset-0 rounded-full p-2 shadow-2xl"
                    style={{ 
                      background: 'rgba(238, 0, 9, 0.8)',
                      boxShadow: '0 15px 30px rgba(238, 0, 9, 0.3)'
                    }}
                  >
                    <div className="w-full h-full bg-white rounded-full p-1 shadow-inner">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                        <Image
                          src="/directeur.jpg"
                          alt="Directeur Général SAR"
                          width={140}
                          height={140}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message complet avec style élégant */}
            <div 
              className="rounded-2xl p-8 shadow-xl border"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: 'rgba(238, 0, 9, 0.08)',
                boxShadow: '0 8px 25px rgba(238, 0, 9, 0.08)'
              }}
            >
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed space-y-4">
                  {fullMessage.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Signature élégante */}
            <div className="text-center pt-4">
              <div 
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full shadow-lg"
                style={{ 
                  background: 'rgba(238, 0, 9, 0.9)',
                  boxShadow: '0 8px 20px rgba(238, 0, 9, 0.3)'
                }}
              >
                <Award className="h-5 w-5" />
                <span className="font-semibold">Le Directeur Général</span>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
