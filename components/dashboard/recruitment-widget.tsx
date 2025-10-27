"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  Calendar,
  Building,
  Target,
  Award,
  CheckCircle,
  ExternalLink,
  Sparkles
} from "lucide-react"

// Types pour les postes
interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance'
  level: 'Junior' | 'Confirmé' | 'Senior' | 'Expert'
  urgency: 'Normal' | 'Urgent' | 'Très urgent'
  description: string
  missions: string[]
  requirements: string[]
  benefits: string[]
  certifications?: string[]
  salary?: string
  startDate: string
  applicationDeadline: string
  contactPerson: string
  contactEmail: string
}

// Données statiques des postes (à remplacer par une API plus tard)
const jobPostings: JobPosting[] = [
  {
    id: "1",
    title: "Chef de Service Réseaux et Systèmes",
    department: "Direction des Systèmes d'Information",
    location: "Dakar, Sénégal",
    type: "CDI",
    level: "Senior",
    urgency: "Normal",
    description: "Poste de management technique pour superviser l'infrastructure réseau et systèmes de la SAR.",
    missions: [
      "Assister le Chef de Département SI dans la gestion opérationnelle et stratégique des infrastructures réseaux et systèmes",
      "Superviser l'administration et l'exploitation du réseau informatique afin d'assurer sa performance, sa sécurité et sa disponibilité",
      "Piloter la gestion de l'infrastructure matérielle (serveurs, équipements réseau, systèmes de stockage, etc.)",
      "Encadrer l'installation, la configuration et la maintenance des réseaux locaux et des services associés (messagerie, DNS, DHCP, etc.)",
      "Garantir la disponibilité et la continuité des services informatiques mis à disposition des utilisateurs"
    ],
    requirements: [
      "Formation : Diplôme de niveau Bac +4/5 (École d'ingénieur en informatique avec spécialisation en systèmes et réseaux ou Master en informatique)",
      "Expérience : Minimum 5 ans dans un poste similaire, idéalement en environnement critique ou industriel",
      "Maîtrise des environnements systèmes (Windows Server, Linux) et des services réseau associés (Active Directory, DNS, DHCP, etc.)",
      "Compétence en scripting pour l'automatisation des tâches (PowerShell, Bash, ou Python)"
    ],
    benefits: [
      "Salaire compétitif selon profil et expérience",
      "Formations techniques et certifications",
      "Environnement de travail moderne et sécurisé",
      "Possibilité d'évolution et de développement professionnel",
      "Assurance santé et avantages sociaux"
    ],
    certifications: [
      "Cisco : CCNP, CCIE (un atout majeur)",
      "Fortinet : NSE4 ou supérieur",
      "VMware : VCP-NV",
      "PMP ou ITIL pour la gestion de projets et des services IT",
      "Toute certification en cybersécurité (CISSP, CISM) serait un plus"
    ],
    salary: "À négocier selon profil",
    startDate: "1er Février 2024",
    applicationDeadline: "29 Septembre 2025",
    contactPerson: "Direction des Systèmes d'Information",
    contactEmail: "rh@sar.sn"
  },
  {
    id: "2",
    title: "Développeur Full Stack",
    department: "Direction des Systèmes d'Information",
    location: "Dakar, Sénégal",
    type: "CDI",
    level: "Confirmé",
    urgency: "Urgent",
    description: "Développement et maintenance des applications web et mobiles de la SAR.",
    missions: [
      "Développement d'applications web et mobiles",
      "Maintenance et évolution des systèmes existants",
      "Collaboration avec les équipes métier",
      "Participation aux projets d'innovation technologique"
    ],
    requirements: [
      "Bac+3 minimum en informatique",
      "3+ ans d'expérience en développement",
      "Maîtrise de React, Node.js, Python",
      "Connaissance des bases de données",
      "Esprit d'équipe et autonomie"
    ],
    benefits: [
      "Salaire compétitif selon profil",
      "Formations techniques régulières",
      "Environnement de travail moderne",
      "Possibilité d'évolution rapide"
    ],
    salary: "À négocier selon profil",
    startDate: "15 Janvier 2024",
    applicationDeadline: "10 Janvier 2024",
    contactPerson: "Idrissa CISSÉ",
    contactEmail: "idrissa.cisse@sar.sn"
  },
  {
    id: "3",
    title: "Stagiaire QHSE",
    department: "Direction QHSE",
    location: "Dakar, Sénégal",
    type: "Stage",
    level: "Junior",
    urgency: "Normal",
    description: "Stage de 6 mois pour découvrir les métiers de la Qualité, Hygiène, Sécurité et Environnement.",
    missions: [
      "Participation aux audits QHSE",
      "Mise à jour de la documentation",
      "Formation du personnel",
      "Analyse des risques"
    ],
    requirements: [
      "Bac+2 minimum en QHSE ou équivalent",
      "Intérêt pour la sécurité au travail",
      "Rigueur et méthode",
      "Bonne communication"
    ],
    benefits: [
      "Indemnité de stage",
      "Formation certifiante",
      "Encadrement personnalisé",
      "Possibilité d'embauche"
    ],
    salary: "Indemnité de stage",
    startDate: "1er Mars 2024",
    applicationDeadline: "15 Février 2024",
    contactPerson: "Cheikh Sidi Yahya LY",
    contactEmail: "cheikh.ly@sar.sn"
  }
]

// Composant pour afficher un poste dans la liste
function JobCard({ job, onViewDetails }: { job: JobPosting, onViewDetails: (job: JobPosting) => void }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CDI': return 'bg-blue-100 text-blue-800'
      case 'CDD': return 'bg-purple-100 text-purple-800'
      case 'Stage': return 'bg-green-100 text-green-800'
      case 'Freelance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-3 cursor-pointer"
         onClick={() => onViewDetails(job)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">{job.department}</p>
        </div>
        <div className="flex flex-col gap-1 ml-2">
          <Badge className={`text-xs ${getTypeColor(job.type)}`}>
            {job.type}
          </Badge>
          <Badge className="text-xs bg-gray-100 text-gray-700">
            {job.level}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        <span>Clôture: {job.applicationDeadline}</span>
      </div>
    </div>
  )
}

// Composant pour le modal de détails
function JobDetailsModal({ job, isOpen, onClose }: { job: JobPosting | null, isOpen: boolean, onClose: () => void }) {
  if (!job) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {job.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              Description du poste
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
              {job.description}
            </p>
          </div>

          {/* Informations pratiques */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              Informations pratiques
            </h3>
            <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Début:</span>
                  <span className="ml-2 text-gray-600">{job.startDate}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Clôture candidatures:</span>
                  <span className="ml-2 text-gray-600">{job.applicationDeadline}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Missions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              Missions
            </h3>
            <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
              <ul className="space-y-3">
                {job.missions.map((mission, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-orange-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{mission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Profil recherché */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              Profil
            </h3>
            <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
              <ul className="space-y-3">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-orange-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Certifications */}
          {job.certifications && job.certifications.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                Certifications requises / appréciées
              </h3>
              <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
                <ul className="space-y-3">
                  {job.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-orange-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-orange-200 flex justify-center">
            <Button className="w-full max-w-[150px] bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <ExternalLink className="h-4 w-4 mr-2" />
              Postuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Composant principal
export function RecruitmentWidget() {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (job: JobPosting) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
  }


  return (
    <>
      <Card className="h-[28rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 hover:shadow-2xl transition-all duration-500 group">
        {/* Motifs décoratifs élégants */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-red-100/15 to-pink-100/20" />
          {/* Motifs décoratifs - Couleurs claires attrayantes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300/30 rounded-full -translate-y-16 translate-x-16 group-hover:bg-orange-200/40 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-300/30 rounded-full translate-y-12 -translate-x-12 group-hover:bg-red-200/40 transition-colors duration-500" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-pink-300/20 rounded-full -translate-x-8 -translate-y-8 group-hover:bg-pink-200/30 transition-colors duration-500" />
        </div>

        <CardHeader className="relative pb-4 flex-shrink-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-orange-300/50 group-hover:scale-105 transition-all duration-300">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-orange-700 transition-colors duration-300">
                  Recrutements Internes
                </CardTitle>
                <p className="text-sm text-slate-600 font-medium">
                  Opportunités de carrière
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50 font-semibold shadow-sm hover:shadow-md transition-all duration-300 group/btn"
              onClick={() => window.open('/recrutement', '_blank')}
            >
              Voir tous les postes
              <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="relative flex-1 flex flex-col justify-center p-6 pt-2 z-10">
          <div className="space-y-2">
            {/* Liste des postes */}
            {jobPostings.length > 0 && (
              <div className="space-y-2">
                {jobPostings.map((job) => (
                  <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />
                ))}
              </div>
            )}

            {/* Message si aucun poste */}
            {jobPostings.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun poste ouvert actuellement</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <JobDetailsModal 
        job={selectedJob} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  )
}
