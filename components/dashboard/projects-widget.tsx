"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  FolderKanban, 
  Target, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Loader2
} from "lucide-react"
import { useProjects, Project } from "@/hooks/useProjects"

// Fonction pour obtenir le badge de statut
function getStatusBadge(status: Project['status']) {
  switch (status) {
    case 'en_cours':
      return <Badge className="bg-white/20 text-white border-white/30">Études en cours</Badge>
    case 'termine':
      return <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50">Terminé 2024</Badge>
    case 'planifie':
      return <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-400/50">Planifié</Badge>
    case 'en_projet':
      return <Badge className="bg-white/20 text-white border-white/30">En projet</Badge>
    default:
      return null
  }
}


// Composant pour afficher un projet en mode pagination
function ProjectCardPagination({ project, onClick }: { project: Project, onClick: () => void }) {
  // Image par défaut si le projet n'a pas d'image
  const defaultImage = '/charigan.png'
  const projectImage = project.image || defaultImage

  return (
    <div 
      className="rounded-lg border border-white/20 hover:border-white/40 hover:shadow-md transition-all duration-300 p-4 sm:p-6 h-full flex flex-col cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Image de fond - utilise l'image du projet ou l'image par défaut */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${projectImage})` }}
      />
      {/* Overlay sombre pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Contenu avec position relative pour être au-dessus de l'image */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors">
            {project.name}
          </h3>
          {getStatusBadge(project.status)}
        </div>
        
        <div className="space-y-3 flex-1">
          <div>
            <div className="flex items-start gap-2 mb-1">
              <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div>
                <p className="text-xs font-medium text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  Objectif
                </p>
                <p className="text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold">
                  {project.objective}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start gap-2 mb-1">
              <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div>
                <p className="text-xs font-medium text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  Partenaires
                </p>
                <p className="text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold">
                  {project.partners}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start gap-2 mb-1">
              <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div>
                <p className="text-xs font-medium text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  Chef de projet
                </p>
                <p className="text-sm font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {project.chefProjet || "À définir"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal de détails du projet
function ProjectDetailsModal({ project, isOpen, onClose }: { project: Project | null, isOpen: boolean, onClose: () => void }) {
  if (!project) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie"
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Calculer la durée du projet
  const calculateDuration = () => {
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
  }

  const duration = calculateDuration()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-0 [&>button]:hidden p-4 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-3">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {project.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* En-tête avec statut et informations clés */}
          <div className="bg-white border border-indigo-200 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Statut:</span>
                {getStatusBadge(project.status)}
              </div>
              {duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Durée:</span>
                  <span className="text-xs sm:text-sm text-gray-700">{duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Chef de projet - Section mise en évidence */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-300 rounded-lg p-4 sm:p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Chef de projet
            </h3>
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-indigo-200">
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {project.chefProjet || "À définir"}
              </p>
              {project.chefProjet && project.chefProjet !== "À définir" && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Responsable de la coordination et du suivi du projet
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                Description
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed bg-white p-3 sm:p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                {project.description}
              </p>
            </div>
          )}

          {/* Objectif */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              Objectif
            </h3>
            <div className="bg-white border border-indigo-200 rounded-lg p-3 sm:p-4 shadow-sm">
              <p className="text-gray-700 text-xs sm:text-sm">{project.objective}</p>
            </div>
          </div>

          {/* Informations pratiques */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              Informations pratiques
            </h3>
            <div className="bg-white border border-indigo-200 rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-700">Partenaires:</span>
                    <span className="ml-2 text-gray-600 break-words">{project.partners}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-700">Date de début:</span>
                    <span className="ml-2 text-gray-600 break-words">{formatDate(project.dateDebut)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-700">Date de fin:</span>
                    <span className="ml-2 text-gray-600 break-words">{formatDate(project.dateFin)}</span>
                  </div>
                </div>
                {duration && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-700">Durée totale:</span>
                      <span className="ml-2 text-gray-600 break-words">{duration}</span>
                    </div>
                  </div>
                )}
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

  // Pagination automatique
  useEffect(() => {
    if (!isPaginationPaused && normalizedProjects.length > 0) {
      const interval = setInterval(() => {
        setCurrentProjectIndex((prev) => (prev + 1) % normalizedProjects.length)
      }, 5000) // Change toutes les 5 secondes

      return () => clearInterval(interval)
    }
  }, [isPaginationPaused, normalizedProjects.length])

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  const handlePrevious = () => {
    if (normalizedProjects.length > 0) {
      setCurrentProjectIndex((prev) => (prev - 1 + normalizedProjects.length) % normalizedProjects.length)
    }
  }

  const handleNext = () => {
    if (normalizedProjects.length > 0) {
      setCurrentProjectIndex((prev) => (prev + 1) % normalizedProjects.length)
    }
  }

  // Récupérer l'image du projet actuel
  const currentProjectImage = normalizedProjects.length > 0
    ? normalizedProjects[currentProjectIndex]?.image
    : null

  // Image de fond par défaut
  const defaultBackgroundImage = '/charigan.png'

  return (
    <>
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative border-0 hover:shadow-2xl transition-all duration-500 group">
        {/* Image de fond floutée - utilise l'image du projet ou l'image par défaut */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
            style={{ 
              backgroundImage: `url(${
                currentProjectImage 
                  ? currentProjectImage 
                  : defaultBackgroundImage
              })` 
            }}
          />
          {/* Overlay sombre pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        </div>

        <CardHeader className="relative flex-shrink-0 z-20 pb-2 sm:pb-3 md:pb-4 p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 md:p-3 bg-white/10 rounded-lg sm:rounded-xl shadow-lg group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300 border border-white/20">
                <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white transition-colors duration-300">
                  Projets
                </CardTitle>
                <p className="text-[10px] sm:text-xs md:text-sm text-white/80 font-medium">
                  Projets stratégiques
                </p>
              </div>
            </div>
            {/* Badge avec le nombre de projets */}
            {!loading && !error && (
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1">
                  {normalizedProjects.length} {normalizedProjects.length > 1 ? 'projets' : 'projet'}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative flex-1 flex flex-col z-20 overflow-hidden p-2 sm:p-3 md:p-6 pt-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-sm text-white/80">Chargement des projets...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-red-400 mb-2">Erreur lors du chargement des projets</p>
                <p className="text-xs text-white/60">{error}</p>
              </div>
            </div>
          ) : normalizedProjects.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-white/80">Aucun projet disponible</p>
            </div>
          ) : (
            // Mode pagination : un projet à la fois avec navigation
            <div className="flex-1 flex flex-col relative">
              {normalizedProjects.length > 0 && (
                <>
                  <div 
                    className="flex-1 mb-4"
                    onMouseEnter={() => setIsPaginationPaused(true)}
                    onMouseLeave={() => setIsPaginationPaused(false)}
                  >
                    <ProjectCardPagination 
                      project={normalizedProjects[currentProjectIndex]} 
                      onClick={() => handleProjectClick(normalizedProjects[currentProjectIndex])}
                    />
                  </div>
                  
                  {/* Indicateurs de pagination */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="text-white border-white/30 hover:bg-white/10"
                      disabled={normalizedProjects.length === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {normalizedProjects.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentProjectIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentProjectIndex
                              ? 'w-6 bg-white'
                              : 'w-2 bg-white/40'
                          }`}
                          aria-label={`Projet ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      className="text-white border-white/30 hover:bg-white/10"
                      disabled={normalizedProjects.length === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
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

