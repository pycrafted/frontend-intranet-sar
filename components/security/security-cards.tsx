"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, HardHat } from "lucide-react"
import { useState } from "react"

// Cartes pour la section de droite (stacked) - avec images
const securityTopicsRight = [
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
]

// Cartes pour la section du bas (grid)
const securityTopicsBottom = [
  {
    icon: Shield,
    title: "Équipements de Protection",
    description: "Port obligatoire des EPI selon votre poste de travail",
    color: "text-red-600",
    bgColor: "bg-black",
    borderColor: "border-red-200/50",
    image: "/video_surveillance.png",
    imageAlt: "Vidéo Surveillance",
  },
  {
    icon: AlertTriangle,
    title: "Signalement des Dangers",
    description: "Signalez immédiatement toute situation dangereuse",
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
    icon: Shield,
    title: "Infirmerie",
    description: "Premiers secours et soins médicaux d'urgence",
    color: "text-green-600",
    bgColor: "bg-black",
    borderColor: "border-green-200/50",
    image: "/infirmerie.png",
    imageAlt: "Infirmerie",
  },
]

export function SecurityCards({ variant = "grid" }: { variant?: "stacked" | "grid" }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Utiliser les bonnes cartes selon le variant
  const topicsToShow = variant === "stacked" ? securityTopicsRight : securityTopicsBottom

  return (
    <div>
      <div
        className={
          variant === "stacked" ? "flex flex-col gap-5" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        }
      >
        {topicsToShow.map((topic, index) => {
          const Icon = topic.icon
          const isHovered = hoveredIndex === index
          const isAdjacent = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1

          return (
            <Card
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`hover:shadow-2xl hover:shadow-${topic.color.split("-")[1]}-500/20 transition-all duration-500 border-2 ${topic.borderColor} bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-xl hover:-translate-y-2 hover:scale-[1.02] group relative overflow-hidden ${
                isAdjacent ? "scale-[1.01] -translate-y-1" : ""
              }`}
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              <div
                className={`absolute inset-0 ${topic.bgColor} ${topic.image ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-500`}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              />

              {topic.image ? (
                <div className="relative h-full flex items-center justify-center p-2">
                  <img
                    src={topic.image}
                    alt={topic.imageAlt}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <>
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-4 rounded-2xl ${topic.bgColor} ${topic.color} group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl relative`}
                      >
                        <Icon className="h-7 w-7" strokeWidth={2.5} />
                        {isHovered && <div className="absolute inset-0 rounded-2xl bg-current opacity-20 animate-ping" />}
                      </div>
                      <CardTitle className="text-xl leading-tight text-balance font-bold text-slate-800 group-hover:text-slate-900 transition-all duration-300">
                        {topic.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 relative z-10">
                    <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                      {topic.description}
                    </p>
                  </CardContent>
                </>
              )}

              <div
                className={`absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-transparent ${topic.color.replace("text-", "border-r-")} opacity-0 group-hover:opacity-20 transition-all duration-500`}
              />
            </Card>
          )
        })}
        
        {/* Carte invisible pour maintenir la taille des autres cartes */}
        {variant === "grid" && topicsToShow.length === 4 && (
          <div className="hidden lg:block"></div>
        )}
      </div>
    </div>
  )
}
