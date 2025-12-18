"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import Image from "next/image"
import { 
  FolderKanban, 
  Target, 
  Users, 
  Calendar,
  User,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Loader2,
  ArrowRight,
  Lightbulb,
  ExternalLink
} from "lucide-react"
import { useProjects, Project } from "@/hooks/useProjects"

// Configuration des statuts selon le design markdown
const statusConfig = {
  termine: {
    icon: CheckCircle2,
    color: "bg-green-500/10 text-green-700 border-green-500/20",
    dotColor: "bg-green-500",
    label: "Terminé"
  },
  en_cours: {
    icon: Clock,
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    dotColor: "bg-blue-500",
    label: "Projet en cours"
  },
  planifie: {
    icon: Lightbulb,
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    dotColor: "bg-orange-500",
    label: "Planifié"
  },
  en_projet: {
    icon: Clock,
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    dotColor: "bg-blue-500",
    label: "En projet"
  }
}

// Fonction pour obtenir le badge de statut avec le nouveau design
function getStatusBadge(status: Project['status']) {
  const config = statusConfig[status] || statusConfig.en_cours
  const StatusIcon = config.icon
  
  return (
    <Badge className={`${config.color} border backdrop-blur-sm text-xs px-2 py-0.5 flex items-center gap-1`}>
      <StatusIcon className="w-2.5 h-2.5" />
      {config.label}
    </Badge>
  )
}


// Modal de détails du projet
function ProjectDetailsModal({ project, isOpen, onClose }: { project: Project | null, isOpen: boolean, onClose: () => void }) {
  if (!project) return null

  // Mémoriser le formatage des dates pour optimiser les performances
  const formattedDateDebut = useMemo(() => {
    if (!project.dateDebut) return "Non définie"
    const date = new Date(project.dateDebut)
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  }, [project.dateDebut])

  const formattedDateFin = useMemo(() => {
    if (!project.dateFin) return "Non définie"
    const date = new Date(project.dateFin)
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  }, [project.dateFin])

  // Calculer la durée du projet avec useMemo pour optimiser les performances
  const duration = useMemo(() => {
    if (!project.dateDebut || !project.dateFin) return null
    const start = new Date(project.dateDebut)
    const end = new Date(project.dateFin)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    
    if (years > 0 && months > 0) {
      return `${years} an${years > 1 ? 's' : ''} et ${months} mois`
    } else if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}`
    } else if (months > 0) {
      return `${months} mois`
    } else {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`
    }
  }, [project.dateDebut, project.dateFin])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-blue-300 [&>button]:hidden p-0 !duration-75 data-[state=open]:!animate-in data-[state=closed]:!animate-out data-[state=closed]:!fade-out-0 data-[state=open]:!fade-in-0 data-[state=closed]:!zoom-out-98 data-[state=open]:!zoom-in-98" style={{ backgroundColor: '#d6e4ff' }}>
        <div className="relative w-full h-full min-h-[400px] max-h-[95vh] overflow-y-auto">
          {/* Contenu */}
          <div className="relative z-10 p-4 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-3">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              {project.name}
            </DialogTitle>
          </DialogHeader>
        
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* En-tête avec statut et informations clés */}
            <div className="bg-white/90 border border-blue-300 rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">Statut:</span>
                  {getStatusBadge(project.status)}
                </div>
                {duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">Durée:</span>
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">{duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chef de projet - Section mise en évidence */}
            <div className="bg-white/90 border border-blue-300 rounded-lg p-4 sm:p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Chef de projet
              </h3>
              <div className="bg-blue-50/90 rounded-lg p-3 sm:p-4 border border-blue-200 shadow-sm">
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  {project.chefProjet || "À définir"}
                </p>
                {project.chefProjet && project.chefProjet !== "À définir" && (
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    Responsable de la coordination et du suivi du projet
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
                  Description
                </h3>
                <p className="text-gray-900 text-sm sm:text-base leading-relaxed bg-white/90 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500 shadow-sm font-medium">
                  {project.description}
                </p>
              </div>
            )}

            {/* Objectif */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
                Objectif
              </h3>
              <div className="bg-white/90 border border-blue-300 rounded-lg p-3 sm:p-4 shadow-sm">
                <p className="text-gray-900 text-sm sm:text-base font-medium">{project.objective}</p>
              </div>
            </div>

            {/* Informations pratiques */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
                Informations pratiques
              </h3>
              <div className="bg-white/90 border border-blue-300 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-gray-900">Partenaires:</span>
                      <span className="ml-2 text-gray-800 break-words font-medium">{project.partners}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-gray-900">Date de début:</span>
                      <span className="ml-2 text-gray-800 break-words font-medium">{formattedDateDebut}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-gray-900">Date de fin:</span>
                      <span className="ml-2 text-gray-800 break-words font-medium">{formattedDateFin}</span>
                    </div>
                  </div>
                  {duration && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900">Durée totale:</span>
                        <span className="ml-2 text-gray-800 break-words font-medium">{duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Composant principal
export function ProjectsWidget() {
  const { projects, loading, error } = useProjects()
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaginationPaused, setIsPaginationPaused] = useState(false)

  // Normaliser les IDs pour qu'ils soient des strings (compatibilité avec le code existant)
  const normalizedProjects = projects.map(project => ({
    ...project,
    id: String(project.id),
    name: project.name || project.titre || '',
  }))

  // Carousel automatique (même vitesse que les actualités : 4000ms)
  useEffect(() => {
    if (normalizedProjects.length <= 1 || isPaginationPaused) return

    const interval = setInterval(() => {
      setCurrentProjectIndex((prev) => (prev + 1) % normalizedProjects.length)
    }, 4000) // Même vitesse que le carousel des actualités

    return () => clearInterval(interval)
  }, [isPaginationPaused, normalizedProjects.length])

  const handleProjectClick = (project: Project | { id: string; [key: string]: any }) => {
    // Convertir l'ID en nombre si nécessaire
    const projectWithNumberId = {
      ...project,
      id: typeof project.id === 'string' ? Number(project.id) : project.id
    } as Project
    setSelectedProject(projectWithNumberId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }


  if (loading) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative border-0" style={{ backgroundColor: '#d6e4ff' }}>
        <div className="flex-1 flex flex-col relative p-4 sm:p-5 md:p-6 h-full">
          <div className="space-y-3 sm:space-y-4">
            {/* Skeleton pour l'image */}
            <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden flex-shrink-0 rounded-xl mb-4 animate-pulse">
              <div className="w-full h-full bg-gray-300/50 rounded-xl" />
            </div>
            {/* Skeleton pour le titre */}
            <div className="animate-pulse">
              <div className="h-6 sm:h-7 bg-gray-300/50 rounded w-3/4 mb-2" />
            </div>
            {/* Skeleton pour la description */}
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-300/50 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-300/50 rounded w-full" />
              <div className="h-3 bg-gray-300/50 rounded w-5/6" />
              <div className="h-3 bg-gray-300/50 rounded w-4/6" />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative border-0" style={{ backgroundColor: '#d6e4ff' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2 font-semibold">Erreur lors du chargement des projets</p>
            <p className="text-xs text-gray-700">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative border-0 hover:shadow-2xl transition-all duration-500 group" style={{ backgroundColor: '#d6e4ff' }}>
        {/* Mode carousel : contenu directement dans le conteneur bleu */}
        <div 
          className="flex-1 flex flex-col relative p-4 sm:p-5 md:p-6 h-full"
          onMouseEnter={() => setIsPaginationPaused(true)}
          onMouseLeave={() => setIsPaginationPaused(false)}
        >
          {normalizedProjects.length > 0 && (() => {
              const project = normalizedProjects[currentProjectIndex]
              const projectName = project.name || (project as Project).titre || 'Projet'
              const projectImage = project.image || (project as Project).image || '/placeholder.jpg'
              const projectDescription = project.description || (project as Project).description || project.objective
              const DecorationIcon = FolderKanban


              return (
                <motion.div
                  className="group relative h-full flex flex-col"
                >
                  {/* Section Image */}
                  <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden flex-shrink-0 rounded-xl mb-4">
                    {projectImage && projectImage !== '/placeholder.jpg' ? (
                      <Image
                        src={projectImage}
                        alt={projectName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <FolderKanban className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Badge Statut - En haut à gauche */}
                    <div className="absolute top-3 left-3 z-10">
                      {getStatusBadge(project.status)}
                    </div>
                    
                    {/* Icône Décoration - En bas à gauche */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <DecorationIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                    </div>

                    {/* Bouton Détails - En bas à droite, style "Lire la suite" avec fond grisé */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProjectClick(normalizedProjects[currentProjectIndex])
                        }}
                        className="h-6 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-white hover:bg-white/30 bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0 flex items-center gap-1 rounded-lg"
                      >
                        Détails
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                  </div>
                  
                  {/* Section Contenu */}
                  <div className="flex-1 flex flex-col">
                    {/* Titre - Style du modal DialogTitle */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                      {projectName}
                    </h3>
                    
                    {/* Description - Style du modal */}
                    {projectDescription && (
                      <div className="mb-4 flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
                          <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
                          Description
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base leading-relaxed bg-white/90 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500 shadow-sm font-medium line-clamp-3">
                          {projectDescription}
                        </p>
                      </div>
                    )}
                    
                  </div>
                </motion.div>
              )
            })()}
        </div>
      </Card>

      {/* Modal de détails */}
      <ProjectDetailsModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  )
}

