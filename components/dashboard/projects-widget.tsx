"use client"

import { useState, useEffect, useMemo } from "react"
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
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">en cours</Badge>
    case 'termine':
      return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Terminé 2024</Badge>
    case 'planifie':
      return <Badge className="bg-sky-100 text-sky-800 border-sky-300">Planifié</Badge>
    case 'en_projet':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">En projet</Badge>
    default:
      return null
  }
}


// Composant pour afficher un projet en mode pagination
function ProjectCardPagination({ project }: { project: Project | { id: string | number; name: string; status: Project['status']; objective: string; partners?: string; chefProjet?: string } }) {
  return (
    <div 
      className="rounded-lg border border-blue-300 hover:border-blue-400 hover:shadow-md transition-all duration-300 p-4 sm:p-6 h-full flex flex-col group relative overflow-hidden bg-white/90 backdrop-blur-sm"
    >
      {/* Contenu */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 transition-colors">
            {project.name}
          </h3>
          {getStatusBadge(project.status)}
        </div>
        
        <div className="space-y-3 flex-1">
          <div>
            <div className="flex items-start gap-2 mb-1">
              <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  Objectif
                </p>
                <p className="text-sm text-gray-900 font-semibold">
                  {project.objective}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start gap-2 mb-1">
              <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  Partenaires
                </p>
                <p className="text-sm text-gray-900 font-semibold">
                  {project.partners}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start gap-2 mb-1">
              <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  Chef de projet
                </p>
                <p className="text-sm font-semibold text-gray-900">
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

  // Pagination automatique
  useEffect(() => {
    if (!isPaginationPaused && normalizedProjects.length > 0) {
      const interval = setInterval(() => {
        setCurrentProjectIndex((prev) => (prev + 1) % normalizedProjects.length)
      }, 5000) // Change toutes les 5 secondes

      return () => clearInterval(interval)
    }
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


  return (
    <>
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative border-0 hover:shadow-2xl transition-all duration-500 group" style={{ backgroundColor: '#d6e4ff' }}>
        {/* Motifs décoratifs élégants */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-sky-100/30" />
          {/* Motifs décoratifs - Couleurs claires attrayantes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/30 rounded-full -translate-y-16 translate-x-16 group-hover:bg-blue-200/40 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-300/30 rounded-full translate-y-12 -translate-x-12 group-hover:bg-indigo-200/40 transition-colors duration-500" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-sky-300/20 rounded-full -translate-x-8 -translate-y-8 group-hover:bg-sky-200/30 transition-colors duration-500" />
        </div>

        <CardHeader className="relative flex-shrink-0 z-20 pb-2 sm:pb-3 md:pb-4 p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-blue-300/50 group-hover:scale-105 transition-all duration-300">
                <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">
                  Projets
                </CardTitle>
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-700 font-medium">
                  Projets stratégiques
                </p>
              </div>
            </div>
            {/* Bouton Détails */}
            {!loading && !error && normalizedProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleProjectClick(normalizedProjects[currentProjectIndex])}
                  className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 hover:border-blue-400 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm hover:shadow-md transition-all duration-300"
                  size="sm"
                >
                  Détails
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative flex-1 flex flex-col z-20 overflow-hidden p-2 sm:p-3 md:p-6 pt-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-800 font-medium">Chargement des projets...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2 font-semibold">Erreur lors du chargement des projets</p>
                <p className="text-xs text-gray-700">{error}</p>
              </div>
            </div>
          ) : normalizedProjects.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-800 font-medium">Aucun projet disponible</p>
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
                    />
                  </div>
                  
                  {/* Indicateurs de pagination */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100"
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
                              ? 'w-6 bg-blue-600'
                              : 'w-2 bg-blue-300'
                          }`}
                          aria-label={`Projet ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      className="text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100"
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

