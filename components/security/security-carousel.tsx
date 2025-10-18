"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, HardHat, Heart, X, ZoomIn } from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// 6 cartes de sécurité uniques (celles qui étaient à droite + celles du bas)
const allSecurityTopics = [
  {
    icon: Shield,
    title: "Équipements de Protection",
    description: "Port obligatoire des EPI selon votre poste de travail",
    color: "text-red-600",
    bgColor: "bg-black",
    borderColor: "border-red-200/50",
    image: "/interdit.png",
    imageAlt: "Les Interdictions",
  },
  {
    icon: AlertTriangle,
    title: "Signalement des Dangers",
    description: "Signalez immédiatement toute situation dangereuse",
    color: "text-amber-600",
    bgColor: "bg-black",
    borderColor: "border-amber-200/50",
    image: "/laborantain.jpg",
    imageAlt: "Laborantain",
  },
  {
    icon: Shield,
    title: "Vidéo Surveillance",
    description: "Système de surveillance 24h/24 pour la sécurité",
    color: "text-red-600",
    bgColor: "bg-black",
    borderColor: "border-red-200/50",
    image: "/video_surveillance.png",
    imageAlt: "Vidéo Surveillance",
  },
  {
    icon: AlertTriangle,
    title: "Sapeurs Pompiers",
    description: "Intervention d'urgence et formation incendie",
    color: "text-amber-600",
    bgColor: "bg-black",
    borderColor: "border-amber-200/50",
    image: "/sapeur.png",
    imageAlt: "Sapeurs Pompiers",
  },
  {
    icon: HardHat,
    title: "Zones à Risques",
    description: "Respectez les zones délimitées et la signalétique",
    color: "text-indigo-600",
    bgColor: "bg-black",
    borderColor: "border-indigo-200/50",
    image: "/zoneB.jpg",
    imageAlt: "Zone B",
  },
  {
    icon: Heart,
    title: "Infirmerie",
    description: "Premiers secours et soins médicaux d'urgence",
    color: "text-green-600",
    bgColor: "bg-black",
    borderColor: "border-green-200/50",
    image: "/infirmerie.png",
    imageAlt: "Infirmerie",
  },
]

export function SecurityCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null)

  // Auto-play du carousel
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % allSecurityTopics.length)
      }, 2000) // Change toutes les 2 secondes

      return () => clearInterval(interval)
    }
  }, [isHovered])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allSecurityTopics.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allSecurityTopics.length) % allSecurityTopics.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageClick = (imageSrc: string, imageAlt: string, title: string) => {
    setSelectedImage({ src: imageSrc, alt: imageAlt, title })
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  // Calculer les cartes visibles (3-4 cartes selon la taille d'écran)
  const getVisibleCards = () => {
    const cards = []
    for (let i = 0; i < 4; i++) {
      const index = (currentIndex + i) % allSecurityTopics.length
      cards.push(allSecurityTopics[index])
    }
    return cards
  }

  const visibleCards = getVisibleCards()

  return (
    <div className="w-full">
      {/* Indicateur de progression automatique - Responsive */}
      <div className="w-full bg-slate-200 rounded-full h-1 mb-4 sm:mb-6 md:mb-8">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-200 ease-out"
          style={{
            width: `${((currentIndex + 1) / allSecurityTopics.length) * 100}%`
          }}
        />
      </div>

      {/* Carousel Container - Responsive */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Boutons de navigation - Responsive */}
        <Button
          onClick={prevSlide}
          variant="ghost"
          size="sm"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 sm:left-4 h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <ChevronLeft className="h-3 w-3 sm:h-5 sm:w-5" />
        </Button>

        <Button
          onClick={nextSlide}
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <ChevronRight className="h-3 w-3 sm:h-5 sm:w-5" />
        </Button>

        {/* Cartes du carousel - Responsive */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-8 sm:px-12">
          {visibleCards.map((topic, index) => {
            const Icon = topic.icon
            const isHovered = hoveredCardIndex === index
            const isAdjacent = hoveredCardIndex !== null && Math.abs(hoveredCardIndex - index) === 1

            return (
              <Card
                key={`${currentIndex}-${index}`}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                className={`hover:shadow-2xl hover:shadow-${topic.color.split("-")[1]}-500/20 transition-all duration-300 border-2 ${topic.borderColor} bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-xl hover:-translate-y-2 hover:scale-[1.02] group relative overflow-hidden ${
                  isAdjacent ? "scale-[1.01] -translate-y-1" : ""
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className={`absolute inset-0 ${topic.bgColor} ${topic.image ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-300`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {topic.image ? (
                  <div 
                    className="relative h-32 sm:h-40 md:h-48 flex items-center justify-center p-1 sm:p-2 cursor-pointer group/image"
                    onClick={() => handleImageClick(topic.image, topic.imageAlt, topic.title)}
                  >
                    <img
                      src={topic.image}
                      alt={topic.imageAlt}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 rounded-lg"
                    />
                    {/* Overlay avec icône zoom - Responsive */}
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center rounded-lg">
                      <ZoomIn className="h-6 w-6 sm:h-8 sm:w-8 text-white opacity-0 group-hover/image:opacity-100 transition-all duration-300" />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardHeader className="pb-2 sm:pb-4 relative z-10 p-3 sm:p-6">
                      <div className="flex items-start gap-2 sm:gap-4">
                        <div
                          className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl ${topic.bgColor} ${topic.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl relative flex-shrink-0`}
                        >
                          <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={2.5} />
                          {isHovered && <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-current opacity-10 animate-pulse" />}
                        </div>
                        <CardTitle className="text-sm sm:text-lg md:text-xl leading-tight text-balance font-bold text-slate-800 group-hover:text-slate-900 transition-all duration-300">
                          {topic.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10 p-3 sm:p-6">
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                        {topic.description}
                      </p>
                    </CardContent>
                  </>
                )}

                <div
                  className={`absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-transparent ${topic.color.replace("text-", "border-r-")} opacity-0 group-hover:opacity-10 transition-all duration-300`}
                />
              </Card>
            )
          })}
        </div>

        {/* Indicateurs de pagination - Responsive */}
        <div className="flex justify-center mt-4 sm:mt-6 gap-2 sm:gap-3 relative z-10">
          {allSecurityTopics.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 shadow-lg hover:scale-110 relative ${
                index === currentIndex
                  ? "bg-blue-600 scale-125 shadow-blue-600/50"
                  : "bg-slate-400 hover:bg-slate-500 shadow-slate-400/30"
              }`}
            />
          ))}
        </div>

      </div>

      {/* Modal pour afficher l'image en grand - Responsive */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] w-full">
            {/* Bouton fermer - Responsive */}
            <Button
              onClick={closeModal}
              className="absolute -top-8 sm:-top-12 right-0 bg-white/20 hover:bg-white/30 text-white border-0 rounded-full p-1.5 sm:p-2 z-10"
            >
              <X className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            
            {/* Image en grand - Responsive */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[90vh] sm:max-h-[85vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
