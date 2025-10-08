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

// Idées mockées
export const MOCK_IDEAS: Idea[] = [
  {
    id: 1,
    title: "Système de notification mobile",
    description: "Développer une application mobile pour les notifications urgentes et les alertes de sécurité",
    department: "it",
    category: "Technologie",
    benefits: "Amélioration de la communication et réactivité en cas d'urgence",
    priority: "high",
    status: "under_review",
    submittedBy: "Ahmed Diallo",
    submittedAt: "2024-10-01",
    estimatedImpact: "high",
    estimatedCost: "medium"
  },
  {
    id: 2,
    title: "Formation sécurité virtuelle",
    description: "Créer des modules de formation en réalité virtuelle pour les procédures de sécurité",
    department: "safety",
    category: "Formation",
    benefits: "Formation plus immersive et efficace",
    priority: "medium",
    status: "pending",
    submittedBy: "Fatou Sarr",
    submittedAt: "2024-09-28",
    estimatedImpact: "high",
    estimatedCost: "high"
  },
  {
    id: 3,
    title: "Optimisation des horaires",
    description: "Réorganiser les horaires de travail pour réduire la congestion aux heures de pointe",
    department: "hr",
    category: "Organisation",
    benefits: "Réduction du stress et amélioration de la productivité",
    priority: "medium",
    status: "approved",
    submittedBy: "Moussa Ba",
    submittedAt: "2024-09-25",
    estimatedImpact: "medium",
    estimatedCost: "low"
  }
];

// Départements mockés
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "production",
    name: "Production",
    description: "Gestion de la production et des opérations",
    icon: "🏭",
    color: "blue"
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Maintenance des équipements et installations",
    icon: "🔧",
    color: "orange"
  },
  {
    id: "quality",
    name: "Qualité",
    description: "Contrôle qualité et assurance",
    icon: "✅",
    color: "green"
  },
  {
    id: "safety",
    name: "Sécurité",
    description: "Sécurité du travail et environnement",
    icon: "🛡️",
    color: "red"
  },
  {
    id: "logistics",
    name: "Logistique",
    description: "Gestion des stocks et approvisionnements",
    icon: "🚛",
    color: "purple"
  },
  {
    id: "it",
    name: "Informatique",
    description: "Technologies de l'information",
    icon: "💻",
    color: "cyan"
  },
  {
    id: "hr",
    name: "Ressources Humaines",
    description: "Gestion du personnel et formation",
    icon: "👥",
    color: "pink"
  },
  {
    id: "finance",
    name: "Finance",
    description: "Gestion financière et comptabilité",
    icon: "💰",
    color: "yellow"
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Communication et marketing",
    icon: "📢",
    color: "indigo"
  }
];

