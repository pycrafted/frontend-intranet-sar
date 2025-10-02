// Données mockées pour le dashboard personnel SAR-Connect


export interface SafetyData {
  daysWithoutIncidentSAR: number;
  daysWithoutIncidentEE: number;
  lastIncidentDateSAR: string;
  lastIncidentDateEE: string;
  lastIncidentTypeSAR: string;
  lastIncidentTypeEE: string;
  safetyScore: number;
  lastIncidentDescriptionSAR: string;
  lastIncidentDescriptionEE: string;
  // Données pour compatibilité avec l'ancien système
  daysWithoutIncident: number;
  lastIncidentDate: string;
  lastIncidentType: string;
  lastIncidentDescription: string;
}


export interface Questionnaire {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  endDate: string;
  isCompleted: boolean;
  category: string;
  progress: number;
}

export interface Question {
  id: number;
  text: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale';
  options?: string[];
  required: boolean;
  answer?: string | string[] | number;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  department: string;
  category: string;
  benefits?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  submittedBy: string;
  submittedAt: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  estimatedCost: 'low' | 'medium' | 'high';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}



// Données de sécurité mockées
export const MOCK_SAFETY_DATA: SafetyData = {
  daysWithoutIncidentSAR: 127,
  daysWithoutIncidentEE: 89,
  lastIncidentDateSAR: "2024-07-15",
  lastIncidentDateEE: "2024-08-28",
  lastIncidentTypeSAR: "Incident mineur - Zone de production",
  lastIncidentTypeEE: "Accident de trajet - Employé externe",
  safetyScore: 98.5,
  lastIncidentDescriptionSAR: "Petite fuite de vapeur dans la zone de production A, rapidement maîtrisée par l'équipe de maintenance. Aucun blessé, dégâts matériels minimes.",
  lastIncidentDescriptionEE: "Accident de circulation impliquant un employé d'entreprise externe lors du trajet vers le site. Blessures légères, procédures de sécurité renforcées.",
  // Données pour compatibilité avec l'ancien système
  daysWithoutIncident: 127,
  lastIncidentDate: "2024-07-15",
  lastIncidentType: "Incident mineur - Zone de production",
  lastIncidentDescription: "Petite fuite de vapeur dans la zone de production A, rapidement maîtrisée par l'équipe de maintenance. Aucun blessé, dégâts matériels minimes."
};


// Questionnaires mockés
export const MOCK_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 1,
    title: "Satisfaction au travail",
    description: "Évaluez votre niveau de satisfaction dans votre environnement de travail",
    endDate: "2024-10-15",
    isCompleted: false,
    category: "Ressources Humaines",
    progress: 0,
    questions: [
      {
        id: 1,
        text: "Comment évaluez-vous votre niveau de satisfaction au travail ?",
        type: "scale",
        required: true,
        answer: undefined
      },
      {
        id: 2,
        text: "Quels sont les aspects que vous appréciez le plus dans votre travail ?",
        type: "checkbox",
        options: ["Autonomie", "Équipe", "Défis techniques", "Formation", "Reconnaissance"],
        required: true,
        answer: []
      },
      {
        id: 3,
        text: "Avez-vous des suggestions d'amélioration ?",
        type: "textarea",
        required: false,
        answer: ""
      }
    ]
  },
  {
    id: 2,
    title: "Formation continue",
    description: "Besoin en formation et développement professionnel",
    endDate: "2024-10-20",
    isCompleted: true,
    category: "Formation",
    progress: 100,
    questions: [
      {
        id: 4,
        text: "Quel type de formation souhaitez-vous suivre ?",
        type: "radio",
        options: ["Technique", "Management", "Sécurité", "Informatique"],
        required: true,
        answer: "Technique"
      },
      {
        id: 5,
        text: "Préférez-vous la formation en présentiel ou en ligne ?",
        type: "radio",
        options: ["Présentiel", "En ligne", "Mixte"],
        required: true,
        answer: "Mixte"
      }
    ]
  },
  {
    id: 3,
    title: "Sécurité et environnement",
    description: "Évaluation des conditions de sécurité et de l'environnement de travail",
    endDate: "2024-11-01",
    isCompleted: false,
    category: "Sécurité",
    progress: 33,
    questions: [
      {
        id: 6,
        text: "Comment jugez-vous les conditions de sécurité actuelles ?",
        type: "scale",
        required: true,
        answer: 7
      },
      {
        id: 7,
        text: "Avez-vous identifié des risques dans votre environnement ?",
        type: "radio",
        options: ["Oui", "Non", "Peut-être"],
        required: true,
        answer: undefined
      },
      {
        id: 8,
        text: "Décrivez les risques identifiés (si applicable)",
        type: "textarea",
        required: false,
        answer: ""
      }
    ]
  },
  {
    id: 4,
    title: "Évaluation des équipements",
    description: "Votre avis sur les équipements et outils de travail",
    endDate: "2024-10-25",
    isCompleted: false,
    category: "Production",
    progress: 0,
    questions: [
      {
        id: 9,
        text: "Quel est votre nom complet ?",
        type: "text",
        required: true,
        answer: ""
      },
      {
        id: 10,
        text: "Dans quel département travaillez-vous ?",
        type: "text",
        required: true,
        answer: ""
      },
      {
        id: 11,
        text: "Quels équipements utilisez-vous quotidiennement ?",
        type: "textarea",
        required: true,
        answer: ""
      },
      {
        id: 12,
        text: "Décrivez les problèmes techniques rencontrés cette semaine",
        type: "textarea",
        required: false,
        answer: ""
      },
      {
        id: 13,
        text: "Quel est votre email professionnel ?",
        type: "text",
        required: true,
        answer: ""
      }
    ]
  },
  {
    id: 5,
    title: "Retour d'expérience projet",
    description: "Évaluation d'un projet récemment terminé",
    endDate: "2024-11-10",
    isCompleted: false,
    category: "Management",
    progress: 0,
    questions: [
      {
        id: 14,
        text: "Nom du projet évalué",
        type: "text",
        required: true,
        answer: ""
      },
      {
        id: 15,
        text: "Votre rôle dans ce projet",
        type: "text",
        required: true,
        answer: ""
      },
      {
        id: 16,
        text: "Décrivez les points positifs du projet",
        type: "textarea",
        required: true,
        answer: ""
      },
      {
        id: 17,
        text: "Quelles difficultés avez-vous rencontrées ?",
        type: "textarea",
        required: true,
        answer: ""
      },
      {
        id: 18,
        text: "Suggestions pour améliorer les futurs projets similaires",
        type: "textarea",
        required: true,
        answer: ""
      },
      {
        id: 19,
        text: "Durée du projet (en semaines)",
        type: "text",
        required: true,
        answer: ""
      }
    ]
  },
  {
    id: 6,
    title: "Suggestion d'amélioration",
    description: "Proposez vos idées pour améliorer l'entreprise",
    endDate: "2024-12-01",
    isCompleted: false,
    category: "Innovation",
    progress: 0,
    questions: [
      {
        id: 20,
        text: "Votre nom et prénom",
        type: "text",
        required: true,
        answer: ""
      },
      {
        id: 21,
        text: "Domaine de votre suggestion (ex: processus, équipement, organisation)",
        type: "text",
        required: true,
        answer: ""
      },
      {
        id: 22,
        text: "Décrivez votre suggestion en détail",
        type: "textarea",
        required: true,
        answer: ""
      },
      {
        id: 23,
        text: "Quels bénéfices attendez-vous de cette amélioration ?",
        type: "textarea",
        required: true,
        answer: ""
      },
      {
        id: 24,
        text: "Avez-vous des idées sur la mise en œuvre ?",
        type: "textarea",
        required: false,
        answer: ""
      }
    ]
  }
];


// Départements SAR
export const SAR_DEPARTMENTS: Department[] = [
  {
    id: 'production',
    name: 'Production',
    description: 'Unités de production et transformation',
    icon: '🏭',
    color: 'blue'
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Entretien et réparation des équipements',
    icon: '🔧',
    color: 'orange'
  },
  {
    id: 'quality',
    name: 'Qualité',
    description: 'Contrôle qualité et assurance',
    icon: '✅',
    color: 'green'
  },
  {
    id: 'safety',
    name: 'Sécurité',
    description: 'Sécurité au travail et environnement',
    icon: '🛡️',
    color: 'red'
  },
  {
    id: 'logistics',
    name: 'Logistique',
    description: 'Transport et stockage',
    icon: '🚛',
    color: 'purple'
  },
  {
    id: 'it',
    name: 'Informatique',
    description: 'Systèmes d\'information et technologies',
    icon: '💻',
    color: 'cyan'
  },
  {
    id: 'hr',
    name: 'Ressources Humaines',
    description: 'Gestion du personnel et formation',
    icon: '👥',
    color: 'pink'
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Gestion financière et comptabilité',
    icon: '💰',
    color: 'yellow'
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Service de restauration d\'entreprise',
    icon: '🍽️',
    color: 'emerald'
  },
  {
    id: 'management',
    name: 'Direction',
    description: 'Direction générale et stratégie',
    icon: '👔',
    color: 'gray'
  }
];

// Catégories d'idées
export const IDEA_CATEGORIES = [
  { id: 'process', name: 'Amélioration des processus', icon: '⚙️' },
  { id: 'equipment', name: 'Équipements et outils', icon: '🔧' },
  { id: 'safety', name: 'Sécurité et environnement', icon: '🛡️' },
  { id: 'restaurant', name: 'Restaurant et restauration', icon: '🍽️' },
  { id: 'communication', name: 'Communication interne', icon: '📢' },
  { id: 'training', name: 'Formation et développement', icon: '🎓' },
  { id: 'technology', name: 'Technologie et innovation', icon: '💡' },
  { id: 'workplace', name: 'Conditions de travail', icon: '🏢' },
  { id: 'other', name: 'Autre', icon: '💭' }
];

// Idées soumises (exemples)
export const MOCK_IDEAS: Idea[] = [
  {
    id: 1,
    title: 'Système de notification mobile pour les alertes sécurité',
    description: 'Implémenter une application mobile pour notifier en temps réel les employés des alertes sécurité et des procédures d\'évacuation.',
    department: 'safety',
    category: 'technology',
    benefits: 'Amélioration de la réactivité en cas d\'urgence, réduction des risques d\'accidents',
    priority: 'high',
    status: 'under_review',
    submittedBy: 'Ahmed Diallo',
    submittedAt: '2024-09-10',
    estimatedImpact: 'high',
    estimatedCost: 'medium'
  },
  {
    id: 2,
    title: 'Menu végétarien quotidien au restaurant',
    description: 'Ajouter une option végétarienne complète au menu quotidien du restaurant d\'entreprise pour répondre aux besoins alimentaires diversifiés.',
    department: 'restaurant',
    category: 'restaurant',
    benefits: 'Amélioration de la satisfaction des employés, promotion d\'une alimentation saine',
    priority: 'medium',
    status: 'approved',
    submittedBy: 'Fatou Sarr',
    submittedAt: '2024-09-08',
    estimatedImpact: 'medium',
    estimatedCost: 'low'
  },
  {
    id: 3,
    title: 'Formation en ligne sur les nouvelles technologies',
    description: 'Créer une plateforme d\'apprentissage en ligne pour former le personnel aux nouvelles technologies utilisées dans l\'entreprise.',
    department: 'it',
    category: 'training',
    benefits: 'Amélioration des compétences, réduction des coûts de formation, flexibilité d\'apprentissage',
    priority: 'high',
    status: 'pending',
    submittedBy: 'Moussa Diop',
    submittedAt: '2024-09-12',
    estimatedImpact: 'high',
    estimatedCost: 'medium'
  }
];
