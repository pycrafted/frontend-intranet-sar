// Réponses de fallback pour SARIA quand l'API Claude n'est pas disponible

export interface FallbackResponse {
  keywords: string[]
  response: string
  category: string
}

export const fallbackResponses: FallbackResponse[] = [
  {
    keywords: ['salut', 'bonjour', 'hello', 'hi', 'coucou'],
    response: "Bonjour. Je suis SARIA, votre assistant virtuel d'entreprise. Mon système d'intelligence artificielle principal est temporairement indisponible, mais je peux vous fournir des informations de base concernant nos systèmes internes.",
    category: 'greeting'
  },
  {
    keywords: ['aide', 'help', 'assistance', 'support'],
    response: "Je suis à votre disposition pour vous assister. Voici les services que je peux vous fournir :\n• Assistance concernant les fonctionnalités de l'intranet\n• Orientation dans l'utilisation des modules\n• Fourniture d'informations générales sur nos systèmes\n\nComment puis-je vous être utile ?",
    category: 'help'
  },
  {
    keywords: ['actualités', 'news', 'article', 'publication'],
    response: "Concernant les actualités, vous disposez des fonctionnalités suivantes :\n• Consultation de la section Actualités\n• Filtrage par catégorie\n• Recherche d'articles spécifiques\n• Publication d'articles internes",
    category: 'news'
  },
  {
    keywords: ['annuaire', 'contact', 'employé', 'collègue', 'personne'],
    response: "L'annuaire d'entreprise vous offre les capacités suivantes :\n• Recherche de collaborateurs\n• Consultation des informations de contact\n• Filtrage par département\n• Accès aux profils professionnels détaillés",
    category: 'directory'
  },
  {
    keywords: ['document', 'fichier', 'pdf', 'télécharger'],
    response: "Concernant la gestion documentaire :\n• Consultation de la section Documents\n• Utilisation de l'outil de recherche pour localiser les fichiers\n• Filtrage par type de document\n• Téléchargement des ressources nécessaires",
    category: 'documents'
  },
  {
    keywords: ['centre', 'contrôle', 'admin', 'administration'],
    response: "Le centre de contrôle administratif propose les fonctionnalités suivantes :\n• Tableaux de bord de gestion\n• Administration des utilisateurs\n• Génération de statistiques et rapports\n• Outils de configuration système",
    category: 'admin'
  },
  {
    keywords: ['idée', 'suggestion', 'proposition', 'amélioration'],
    response: "Le système de suggestions d'amélioration permet de :\n• Soumettre des propositions d'optimisation\n• Partager des recommandations\n• Évaluer les suggestions des collaborateurs\n• Contribuer à l'évolution de nos systèmes",
    category: 'ideas'
  },
  {
    keywords: ['problème', 'bug', 'erreur', 'dysfonctionnement'],
    response: "Pour signaler un dysfonctionnement technique :\n• Décrivez le problème de manière détaillée\n• Indiquez les étapes de reproduction\n• Précisez votre environnement technique\n• Contactez le service informatique si nécessaire",
    category: 'bug'
  },
  {
    keywords: ['merci', 'thanks', 'parfait', 'super', 'génial'],
    response: "Je vous en prie. C'est mon rôle de vous assister dans vos tâches professionnelles. N'hésitez pas à me solliciter pour toute autre question.",
    category: 'thanks'
  }
]

export function findFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Chercher une correspondance par mots-clés
  for (const fallback of fallbackResponses) {
    for (const keyword of fallback.keywords) {
      if (lowerMessage.includes(keyword)) {
        return fallback.response
      }
    }
  }
  
  // Réponse par défaut si aucune correspondance
  return "Je suis SARIA, votre assistant virtuel d'entreprise. Mon système d'intelligence artificielle principal est temporairement indisponible, mais je peux vous fournir des informations générales concernant nos systèmes internes. Comment puis-je vous assister ?"
}
