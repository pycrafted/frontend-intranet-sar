"use client"

import { PublicationCard } from "./publication-card"
import { Article } from "@/lib/api"

// Données de démonstration pour montrer les différents types de publications
const demoArticles: Article[] = [
  {
    id: 1,
    type: "news",
    title: "Nouvelle campagne de sécurité : Ensemble pour un environnement plus sûr",
    content: "Nous lançons une nouvelle initiative de sécurité qui implique tous les départements. Cette campagne vise à renforcer nos protocoles et à sensibiliser chaque employé aux bonnes pratiques de sécurité. Votre participation active est essentielle pour le succès de cette initiative.",
    date: "2024-01-15",
    time: "09:30",
    author: "Marie Dubois",
    author_role: "Directrice de la Sécurité",
    author_avatar: "/placeholder-user.jpg",
    category: "Sécurité",
    image: "/modern-oil-refinery-facility.jpg",
    is_pinned: true,
    reactions: [
      { emoji: "👍", count: 12, users: ["user1", "user2"] },
      { emoji: "❤️", count: 8, users: ["user3", "user4"] },
      { emoji: "👏", count: 5, users: ["user5"] }
    ]
  },
  {
    id: 3,
    type: "event",
    title: "Formation sécurité incendie - Session de janvier",
    content: "Nous organisons une session de formation sur la sécurité incendie pour tous les employés. Cette formation est obligatoire et couvrira les procédures d'évacuation, l'utilisation des extincteurs et les consignes de sécurité.",
    date: "2024-01-13",
    time: "11:00",
    author: "Pierre Leroy",
    author_role: "Formateur Sécurité",
    author_avatar: "/placeholder-user.jpg",
    category: "Formation",
    image: "/industrial-safety-equipment.png",
    is_pinned: false,
    event_date: "2024-01-20",
    reactions: [
      { emoji: "📅", count: 8, users: ["user9", "user10"] },
      { emoji: "👍", count: 22, users: ["user11", "user12"] }
    ]
  },
  {
    id: 4,
    type: "gallery",
    title: "Visite de nos nouvelles installations",
    content: "Découvrez en images nos nouvelles installations modernisées. Ces améliorations permettront d'augmenter notre capacité de production de 25% tout en améliorant les conditions de travail.",
    date: "2024-01-12",
    time: "16:45",
    author: "Sophie Bernard",
    author_role: "Directrice Technique",
    author_avatar: "/placeholder-user.jpg",
    category: "Production",
    gallery_images: [
      "/modern-oil-refinery-facility.jpg",
      "/industrial-safety-equipment.png",
      "/modern-technology-training-session.jpg",
      "/university-partnership-signing.png",
      "/financial-charts-graphs.png"
    ],
    is_pinned: false,
    reactions: [
      { emoji: "😍", count: 18, users: ["user13", "user14"] },
      { emoji: "👏", count: 12, users: ["user15"] },
      { emoji: "🔥", count: 7, users: ["user16"] }
    ]
  },
  {
    id: 5,
    type: "checklist",
    title: "Checklist de sécurité pour les opérations de maintenance",
    content: "Voici la checklist à suivre avant toute opération de maintenance. Cette procédure est cruciale pour assurer la sécurité de tous.",
    date: "2024-01-11",
    time: "08:30",
    author: "Michel Roux",
    author_role: "Chef de Maintenance",
    author_avatar: "/placeholder-user.jpg",
    category: "Production",
    image: "/industrial-safety-equipment.png",
    is_pinned: false,
    checklist_items: [
      { id: 1, text: "Vérifier l'arrêt complet des machines", checked: true },
      { id: 2, text: "S'assurer de la déconnexion électrique", checked: true },
      { id: 3, text: "Porter l'équipement de protection individuel", checked: false },
      { id: 4, text: "Informer l'équipe de maintenance", checked: true },
      { id: 5, text: "Placer les panneaux de signalisation", checked: false }
    ],
    reactions: [
      { emoji: "✅", count: 6, users: ["user17"] },
      { emoji: "👍", count: 9, users: ["user18", "user19"] }
    ]
  }
]

interface PublicationDemoProps {
  className?: string
}

export function PublicationDemo({ className }: PublicationDemoProps) {
  const handleLike = (articleId: number) => {
    
  }

  const handleComment = (articleId: number) => {
    
  }

  const handleShare = (articleId: number) => {
    
  }

  const handleBookmark = (articleId: number) => {
    
  }

  const handleReaction = (articleId: number, emoji: string) => {
    
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Démonstration des Publications
        </h2>
        <p className="text-gray-600">
          Découvrez les différents types de publications avec un design professionnel inspiré de Talkspirit
        </p>
      </div>
      
      {demoArticles.map((article) => (
        <PublicationCard
          key={article.id}
          article={article}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
          onReaction={handleReaction}
        />
      ))}
    </div>
  )
}

