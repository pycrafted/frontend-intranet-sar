"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Clock, ChevronRight, ArrowUpRight, Users, Star } from "lucide-react"

interface JobOffer {
  id: string
  title: string
  department: string
  location: string
  type: string
  postedDate: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  applicationProcess: string
  salary?: string
  experience?: string
  urgency?: "normal" | "urgent" | "très urgent"
}

const jobOffers: JobOffer[] = [
  {
    id: "1",
    title: "Développeur Full Stack Senior",
    department: "Direction Informatique",
    location: "Dakar, Sénégal",
    type: "CDI",
    postedDate: "2024-01-15",
    salary: "1 500 000 - 2 200 000 FCFA",
    experience: "5+ années",
    urgency: "urgent",
    description:
      "Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe de développement produit. Vous travaillerez sur des projets innovants utilisant les dernières technologies pour moderniser nos systèmes internes.",
    responsibilities: [
      "Développer et maintenir des applications web modernes pour la SAR",
      "Collaborer avec les équipes produit et design pour créer des solutions efficaces",
      "Participer aux revues de code et au mentorat des développeurs juniors",
      "Optimiser les performances des applications existantes",
      "Intégrer les nouvelles technologies dans l'écosystème SAR"
    ],
    qualifications: [
      "5+ années d'expérience en développement web",
      "Maîtrise de React, Node.js et TypeScript",
      "Expérience avec les bases de données SQL et NoSQL",
      "Excellentes compétences en communication",
      "Connaissance du secteur pétrolier (un plus)"
    ],
    applicationProcess: "Envoyez votre CV et lettre de motivation via le portail RH interne ou contactez directement le service RH.",
  },
  {
    id: "2",
    title: "Chef de Projet Digital",
    department: "Direction Marketing & Communication",
    location: "Dakar, Sénégal",
    type: "CDI",
    postedDate: "2024-01-10",
    salary: "1 200 000 - 1 800 000 FCFA",
    experience: "3+ années",
    urgency: "normal",
    description:
      "Rejoignez notre équipe marketing en tant que chef de projet digital. Vous serez responsable de la planification et de l'exécution de nos campagnes digitales et de la transformation numérique de la SAR.",
    responsibilities: [
      "Gérer les projets digitaux de bout en bout pour la SAR",
      "Coordonner avec les équipes créatives et techniques",
      "Analyser les performances des campagnes marketing",
      "Gérer les budgets et les délais des projets",
      "Développer la stratégie digitale de l'entreprise"
    ],
    qualifications: [
      "3+ années d'expérience en gestion de projet digital",
      "Connaissance des outils de marketing automation",
      "Capacité à gérer plusieurs projets simultanément",
      "Esprit analytique et orienté résultats",
      "Expérience dans le secteur industriel (un plus)"
    ],
    applicationProcess: "Postulez directement auprès du département Marketing ou via le portail RH interne.",
  },
  {
    id: "3",
    title: "Ingénieur Processus",
    department: "Direction Technique",
    location: "Dakar, Sénégal",
    type: "CDI",
    postedDate: "2024-01-08",
    salary: "1 800 000 - 2 500 000 FCFA",
    experience: "4+ années",
    urgency: "très urgent",
    description:
      "Nous cherchons un ingénieur processus passionné pour optimiser nos opérations de raffinage et améliorer l'efficacité de nos installations.",
    responsibilities: [
      "Analyser et optimiser les processus de raffinage existants",
      "Développer de nouveaux protocoles de sécurité",
      "Collaborer avec les équipes opérationnelles",
      "Mettre en place des indicateurs de performance",
      "Assurer la formation du personnel sur les nouveaux processus"
    ],
    qualifications: [
      "4+ années d'expérience en ingénierie des processus",
      "Diplôme d'ingénieur en chimie ou génie chimique",
      "Connaissance des normes de sécurité industrielle",
      "Expérience dans le secteur pétrolier",
      "Excellentes compétences en communication"
    ],
    applicationProcess: "Envoyez votre CV détaillé et vos certifications via le système de candidature interne.",
  },
  {
    id: "4",
    title: "Responsable Ressources Humaines",
    department: "Direction des Ressources Humaines",
    location: "Dakar, Sénégal",
    type: "CDI",
    postedDate: "2024-01-05",
    salary: "1 400 000 - 2 000 000 FCFA",
    experience: "5+ années",
    urgency: "normal",
    description:
      "Nous recherchons un responsable RH pour gérer le recrutement, la formation et le développement des talents au sein de la SAR.",
    responsibilities: [
      "Gérer le processus de recrutement complet pour tous les départements",
      "Développer des programmes de formation adaptés aux besoins de l'entreprise",
      "Assurer la gestion administrative du personnel",
      "Promouvoir la culture d'entreprise et l'engagement des employés",
      "Mettre en place des politiques RH innovantes"
    ],
    qualifications: [
      "5+ années d'expérience en ressources humaines",
      "Excellentes compétences interpersonnelles",
      "Connaissance du droit du travail sénégalais",
      "Expérience avec les SIRH modernes",
      "Master en RH ou équivalent"
    ],
    applicationProcess: "Contactez directement le département RH pour postuler ou envoyez votre candidature via le portail interne.",
  },
  {
    id: "5",
    title: "Analyste Financier Senior",
    department: "Direction Financière",
    location: "Dakar, Sénégal",
    type: "CDI",
    postedDate: "2024-01-03",
    salary: "1 600 000 - 2 300 000 FCFA",
    experience: "4+ années",
    urgency: "urgent",
    description:
      "Rejoignez notre équipe financière en tant qu'analyste senior pour contribuer à la stratégie financière et à l'optimisation des coûts de la SAR.",
    responsibilities: [
      "Analyser les performances financières de l'entreprise",
      "Préparer les budgets et les prévisions financières",
      "Évaluer les investissements et les projets d'expansion",
      "Collaborer avec les départements pour optimiser les coûts",
      "Préparer les rapports pour la direction générale"
    ],
    qualifications: [
      "4+ années d'expérience en analyse financière",
      "Maîtrise des outils d'analyse financière (Excel avancé, Power BI)",
      "Connaissance des normes comptables internationales",
      "Expérience dans le secteur industriel",
      "Diplôme en finance ou comptabilité"
    ],
    applicationProcess: "Envoyez votre CV et vos références via le portail RH interne.",
  }
]

export default function RecrutementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    department: "all",
    type: "all",
    urgency: "all",
    experience: "all"
  })
  const [isTyping, setIsTyping] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce pour la recherche (comme dans la page annuaire)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Gérer l'état de frappe
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value.trim() !== "") {
      setIsTyping(true)
    } else {
      setIsTyping(false)
    }
  }

  // Recherche immédiate sur Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }
  }

  const filteredJobs = jobOffers.filter((job) => {
    const searchQuery = debouncedSearchTerm.toLowerCase()
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery) ||
      job.department.toLowerCase().includes(searchQuery) ||
      job.location.toLowerCase().includes(searchQuery)
    
    const matchesDepartment = filters.department === "all" || job.department === filters.department
    const matchesType = filters.type === "all" || job.type === filters.type
    const matchesUrgency = filters.urgency === "all" || job.urgency === filters.urgency
    const matchesExperience = filters.experience === "all" || 
      (filters.experience === "0-2" && job.experience?.includes("0-2")) ||
      (filters.experience === "3-5" && job.experience?.includes("3-5")) ||
      (filters.experience === "6-10" && job.experience?.includes("6-10")) ||
      (filters.experience === "10+" && job.experience?.includes("10+"))

    return matchesSearch && matchesDepartment && matchesType && matchesUrgency && matchesExperience
  })

  const toggleJobDetails = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId)
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "très urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getUrgencyIcon = (urgency?: string) => {
    switch (urgency) {
      case "très urgent":
        return <Star className="h-3 w-3" />
      case "urgent":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <LayoutWrapper
      secondaryNavbarProps={{
        searchTerm: searchTerm,
        onSearchChange: handleSearchChange,
        onSearchKeyDown: handleSearchKeyDown,
        searchPlaceholder: "Rechercher par titre, département ou localisation...",
        isTyping: isTyping
      }}
    >
       <div className="min-h-screen" style={{backgroundColor: '#e5e7eb'}}>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
         <div className="rounded-xl m-4" style={{backgroundColor: '#e5e7eb'}}>
        {/* Job Listings */}
        <div className="space-y-6 p-6">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="group overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="cursor-pointer p-8" onClick={() => toggleJobDetails(job.id)}>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-5">
                    <div>
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-blue-600">
                            {job.title}
                          </h2>
                          <div className="mt-2 flex items-center gap-3">
                            <Badge variant="secondary" className="rounded-md px-3 py-1 text-xs font-medium">
                              {job.type}
                            </Badge>
                            {job.urgency && (
                              <Badge className={`rounded-md px-3 py-1 text-xs font-medium border ${getUrgencyColor(job.urgency)}`}>
                                <div className="flex items-center gap-1">
                                  {getUrgencyIcon(job.urgency)}
                                  {job.urgency}
                                </div>
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{job.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Publié le {new Date(job.postedDate).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{job.experience}</span>
                      </div>
                    </div>

                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <span>💰</span>
                        <span>{job.salary}</span>
                      </div>
                    )}

                    <p className="text-base leading-relaxed text-gray-700">{job.description}</p>
                  </div>
                </div>
              </div>

              {expandedJob === job.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-8">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold tracking-tight text-gray-900">
                        Responsabilités principales
                      </h3>
                      <ul className="space-y-3">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-3 text-base leading-relaxed text-gray-700">
                            <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-4 text-lg font-semibold tracking-tight text-gray-900">
                        Qualifications requises
                      </h3>
                      <ul className="space-y-3">
                        {job.qualifications.map((qual, index) => (
                          <li key={index} className="flex items-start gap-3 text-base leading-relaxed text-gray-700">
                            <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-4 text-lg font-semibold tracking-tight text-gray-900">Comment postuler</h3>
                      <p className="text-base leading-relaxed text-gray-700">{job.applicationProcess}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6">
                      <Button
                        size="lg"
                        className="group/btn bg-blue-600 font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                      >
                        Postuler maintenant
                        <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="font-medium shadow-sm hover:bg-gray-50 bg-white border-gray-300"
                      >
                        Partager cette offre
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center m-6">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-base font-medium text-gray-600">Aucun poste ne correspond à votre recherche.</p>
            <p className="mt-2 text-sm text-gray-500">
              Essayez d'autres mots-clés ou parcourez toutes les offres disponibles.
            </p>
          </div>
        )}
        </div>
      </div>
      </div>
    </LayoutWrapper>
  )
}
