"use client"

import { AdaptivePublicationCard } from "@/components/adaptive-publication-card"
import { Article } from "@/lib/api"

// Données de démonstration pour tester tous les types de cartes
const demoArticles: Article[] = [
  // 1. Texte seul
  {
    id: 1,
    type: 'news',
    content_type: 'text_only',
    title: 'Mise à jour des procédures RH',
    content: 'Nous mettons à jour nos procédures RH pour améliorer l\'efficacité de nos processus internes. Les nouvelles procédures entreront en vigueur le 1er avril 2024. Tous les employés recevront une formation sur ces changements.',
    date: '2024-03-20',
    time: '09:00',
    author: 'Claire Martin',
    author_role: 'Directrice RH',
    author_avatar: '/placeholder-user.jpg',
    category: 'RH',
    is_pinned: false
  },
  
  // 2. Image seule
  {
    id: 2,
    type: 'news',
    content_type: 'image_only',
    title: 'Nouvelle installation de production terminée',
    content: '',
    date: '2024-03-18',
    time: '14:30',
    author: 'Pierre Moreau',
    author_role: 'Directeur Technique',
    author_avatar: '/placeholder-user.jpg',
    category: 'Production',
    is_pinned: true,
    image: '/modern-oil-refinery-facility.jpg'
  },
  
  // 3. Texte + Image
  {
    id: 3,
    type: 'news',
    content_type: 'text_image',
    title: 'Formation sécurité réussie avec succès',
    content: 'La formation sécurité s\'est déroulée avec succès cette semaine. Tous les participants ont validé les modules théoriques et pratiques. Cette formation renforce notre culture de sécurité et améliore nos performances.',
    date: '2024-03-15',
    time: '16:00',
    author: 'Sophie Laurent',
    author_role: 'Directrice de la Sécurité',
    author_avatar: '/placeholder-user.jpg',
    category: 'Sécurité',
    is_pinned: false,
    image: '/industrial-safety-equipment.png'
  },
  
  // 4. Galerie de photos
  {
    id: 4,
    type: 'news',
    content_type: 'gallery',
    title: 'Voyage d\'équipe à Paris - Retour en images',
    content: 'Retour sur notre voyage d\'équipe à Paris organisé la semaine dernière. Une expérience enrichissante qui a renforcé la cohésion de notre équipe et nous a permis de découvrir de nouvelles perspectives.',
    date: '2024-03-12',
    time: '11:00',
    author: 'Marie Dubois',
    author_role: 'Directrice Générale',
    author_avatar: '/placeholder-user.jpg',
    category: 'RH',
    is_pinned: true,
    gallery_title: 'Photos du voyage d\'équipe',
    gallery_images: [
      '/modern-oil-refinery-facility.jpg',
      '/industrial-safety-equipment.png',
      '/modern-technology-training-session.jpg',
      '/university-partnership-signing.png',
      '/financial-charts-graphs.png',
      '/environmental-awareness-campaign.jpg'
    ]
  },
  
  
  // 6. Événement
  {
    id: 6,
    type: 'event',
    content_type: 'event',
    title: 'Formation aux nouvelles technologies - Session Avril',
    content: 'Une session de formation sur les nouvelles technologies sera organisée en avril. Cette formation est ouverte à tous les employés et couvrira les dernières innovations dans notre secteur d\'activité.',
    date: '2024-03-08',
    time: '14:00',
    author: 'Pierre Moreau',
    author_role: 'Directeur de la Formation',
    author_avatar: '/placeholder-user.jpg',
    category: 'Formation',
    is_pinned: false,
    event_date: '2024-04-15',
    image: '/modern-technology-training-session.jpg'
  }
]

export default function DemoAdaptiveCardsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Démonstration des Cartes Adaptatives
          </h1>
          <p className="text-gray-600">
            Voici tous les types de cartes de publication qui s'adaptent automatiquement au contenu.
          </p>
        </div>
        
        <div className="space-y-6">
          {demoArticles.map((article) => (
            <AdaptivePublicationCard
              key={article.id}
              article={article}
            />
          ))}
        </div>
      </div>
    </div>
  )
}








