"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Smartphone, MessageCircle, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useEmployees, Employee, Department } from "@/hooks/useEmployees"
import { StandardLoader } from "@/components/ui/standard-loader"
import { ChatButton } from "@/components/social/chat-button"
import { useSocialNetwork } from "@/hooks/useSocialNetwork"

// Données statiques basées sur l'image
const fallbackEmployees: Employee[] = [
  {
    id: 1,
    first_name: "Maimouna",
    last_name: "DIOP DIAGNE",
    full_name: "Maimouna DIOP DIAGNE",
    initials: "MD",
    email: "maimoumadiagne@sar.sn",
    phone_fixed: "+221 33 825 96 21",
    phone_mobile: "77 459 63 21",
    employee_id: "SAR001",
    position_title: "Directrice Commerciale et Marketing",
    main_direction_name: "Direction Commerciale et Marketing",
    matricule: "SAR001",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    hire_date: "2020-01-01",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  },
  {
    id: 2,
    first_name: "Mamadou Abib",
    last_name: "DIOP",
    full_name: "Mamadou Abib DIOP",
    initials: "MA",
    email: "mamadoudiop@sar.sn",
    phone_fixed: "+221 33 825 03 20",
    phone_mobile: "77 250 31 20",
    employee_id: "SAR002",
    position_title: "Directeur général",
    main_direction_name: "Administration",
    matricule: "SAR002",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    hire_date: "2020-01-01",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  },
  {
    id: 3,
    first_name: "Oumar",
    last_name: "DIOUF",
    full_name: "Oumar DIOUF",
    initials: "OD",
    email: "oumardiouf@sar.sn",
    phone_fixed: "+221 33 825 98 31",
    phone_mobile: null,
    employee_id: "SAR003",
    position_title: "Directeur des Ressources Humaines",
    main_direction_name: "Direction des Ressources Humaines",
    matricule: "SAR003",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    hire_date: "2020-01-01",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  },
  {
    id: 4,
    first_name: "Souleymane",
    last_name: "SECK",
    full_name: "Souleymane SECK",
    initials: "SS",
    email: "souleymaneseck@sar.sn",
    phone_fixed: "+221 33 825 59 13",
    phone_mobile: "77 145 93 13",
    employee_id: "SAR004",
    position_title: "Directeur EXECUTIVE - SUPPORT",
    main_direction_name: "Direction EXECUTIVE - SUPPORT",
    matricule: "SAR004",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    hire_date: "2020-01-01",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  },
  {
    id: 5,
    first_name: "Ousmane",
    last_name: "SEMBENE",
    full_name: "Ousmane SEMBENE",
    initials: "OS",
    email: "ousmanesembene@sar.sn",
    phone_fixed: null,
    phone_mobile: "77 514 96 38",
    employee_id: "SAR005",
    position_title: "Directeur Technique",
    main_direction_name: "Direction Technique",
    matricule: "SAR005",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    hire_date: "2020-01-01",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  },
  {
    id: 6,
    first_name: "Daouda",
    last_name: "KEBE",
    full_name: "Daouda KEBE",
    initials: "DK",
    email: "daoudakebe@sar.sn",
    phone_fixed: "+221 33 825 63 20",
    phone_mobile: "77 256 39 20",
    employee_id: "SAR006",
    position_title: "Directeur EXECUTIVE OPERATIONS",
    main_direction_name: "Direction Executif",
    matricule: "SAR006",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    hire_date: "2020-01-01",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  },
  {
    id: 7,
    first_name: "Fatou",
    last_name: "DIAGNE",
    full_name: "Fatou DIAGNE",
    initials: "FD",
    email: "fatoudiagne@sar.sn",
    phone_fixed: null,
    phone_mobile: null,
    employee_id: "SAR007",
    position_title: "Responsable Qualité",
    main_direction_name: "Direction Qualité",
    matricule: "SAR007",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    hire_date: "2021-03-15",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2021-03-15T00:00:00Z",
    updated_at: "2021-03-15T00:00:00Z",
  },
  {
    id: 8,
    first_name: "Ibrahima",
    last_name: "FALL",
    full_name: "Ibrahima FALL",
    initials: "IF",
    email: "ibrahimafall@sar.sn",
    phone_fixed: "+221 33 825 67 90",
    phone_mobile: "77 456 78 90",
    employee_id: "SAR008",
    position_title: "Chef de Projet",
    main_direction_name: "Direction Technique",
    matricule: "SAR008",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    hire_date: "2021-06-01",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2021-06-01T00:00:00Z",
    updated_at: "2021-06-01T00:00:00Z",
  },
  {
    id: 9,
    first_name: "Aminata",
    last_name: "SARR",
    full_name: "Aminata SARR",
    initials: "AS",
    email: "aminatasarr@sar.sn",
    phone_fixed: "+221 33 825 78 01",
    phone_mobile: "77 567 89 01",
    employee_id: "SAR009",
    position_title: "Analyste Financier",
    main_direction_name: "Direction Financière",
    matricule: "SAR009",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    hire_date: "2022-01-10",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
    position: 1,
    office_location: null,
    created_at: "2022-01-10T00:00:00Z",
    updated_at: "2022-01-10T00:00:00Z",
  }
]

const fallbackDepartments = ["Tous", "Direction Commerciale et Marketing", "Administration", "Direction des Ressources Humaines", "Direction EXECUTIVE - SUPPORT", "Direction Technique", "Direction Executif"]

export default function AnnuairePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  // Items par page responsive : moins sur mobile, plus sur desktop
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 12;
    if (window.innerWidth < 640) return 6; // Mobile : 1 colonne x 6
    if (window.innerWidth < 1024) return 9; // Tablette : 2-3 colonnes x 3
    return 12; // Desktop : 3-4 colonnes x 3-4
  }
  const [itemsPerPage, setItemsPerPage] = useState(12)
  
  // Mettre à jour itemsPerPage lors du redimensionnement
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(getItemsPerPage())
    }
    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  // Utiliser l'API
  const { 
    employees, 
    departments, 
    loading, 
    error, 
    searchEmployees 
  } = useEmployees()

  // Logs supprimés pour réduire le bruit

  // Construire la liste des départements pour le filtre
  const departmentOptions = ["Tous", ...(departments.map(dept => dept.name) || fallbackDepartments.slice(1))]

  // Debounce pour la recherche (comme dans actualités)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Recherche immédiate si le champ est vide
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 1500) // 1.5 secondes pour laisser le temps de finir d'écrire
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Mettre à jour les données filtrées quand les données de l'API changent
  useEffect(() => {
    if (employees.length > 0) {
      setFilteredEmployees(employees)
    }
  }, [employees])

  // Effectuer la recherche UNIQUEMENT si il y a un terme de recherche ou un filtre département
  // Sinon, utiliser directement les employés chargés par fetchEmployees()
  useEffect(() => {
    // Si pas de recherche et pas de filtre département, ne pas appeler searchEmployees
    // Utiliser directement les employés chargés initialement
    if (!debouncedSearchTerm && selectedDepartment === 'Tous') {
      // Pas de filtre, utiliser les employés chargés initialement
      // Ne pas modifier filteredEmployees ici car il est déjà mis à jour par l'autre useEffect
      setCurrentPage(1)
      return
    }
    
    // Il y a un filtre, appeler searchEmployees
    searchEmployees(debouncedSearchTerm, selectedDepartment)
    setCurrentPage(1) // Réinitialiser à la première page lors de la recherche
  }, [debouncedSearchTerm, selectedDepartment])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Forcer la recherche immédiate sur Enter
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
    }
  }

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department)
    setCurrentPage(1) // Réinitialiser à la première page lors du changement de département
    // La recherche sera déclenchée automatiquement par le useEffect
  }

  const handleEmailClick = (email: string) => {
    // Ouvrir Outlook Web App dans un nouvel onglet avec le destinataire prérempli
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
  }



  // Utiliser les données de l'API ou les données filtrées
  const displayData = filteredEmployees.length > 0 ? filteredEmployees : employees
  
  
  // Calcul de la pagination
  const totalPages = Math.ceil(displayData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = displayData.slice(startIndex, endIndex)
  
  // Créer un tableau d'éléments pour maintenir la grille
  const displayEmployees = Array.from({ length: itemsPerPage }, (_, index) => 
    currentEmployees[index] || null
  )

  // Fonctions de pagination
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Afficher un loader si les données sont en cours de chargement
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: "#e5e7eb"}}>
          <StandardLoader />
        </div>
      </LayoutWrapper>
    )
  }

  // Afficher une erreur si il y en a une
  if (error) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: "#e5e7eb"}}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Optimisations responsive globales */
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        /* Désactiver les effets hover sur mobile */
        @media (hover: none) and (pointer: coarse) {
          .group:hover {
            transform: none !important;
          }
          .group:hover * {
            transform: none !important;
          }
        }
        
        /* Amélioration de l'affichage mobile */
        @media (max-width: 640px) {
          .container {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
        
        /* Breakpoint pour très petits écrans */
        @media (max-width: 375px) {
          .container {
            padding-left: 0.375rem;
            padding-right: 0.375rem;
          }
        }
        
        /* Assurer que les cartes ne se chevauchent jamais */
        .grid > * {
          min-width: 0;
          flex-shrink: 1;
        }
        
        /* Améliorer le rendu des textes sur petits écrans */
        @media (max-width: 640px) {
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        
        /* Animations personnalisées pour plus de dynamisme */
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(1deg);
          }
          75% {
            transform: rotate(-1deg);
          }
        }
        
        /* Effets de survol améliorés */
        .group:hover .avatar-mobile {
          animation: bounce-subtle 0.6s ease-in-out;
        }
        
        .group:hover {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .group:hover .group-hover\\:scale-110 {
          animation: wiggle 0.8s ease-in-out;
        }
      `}</style>
      <LayoutWrapper 
        secondaryNavbarProps={{
          searchTerm,
          onSearchChange: handleSearch,
          onSearchKeyDown: handleSearchKeyDown,
          searchPlaceholder: "Rechercher par nom, poste ou département...",
          isTyping,
          selectedDepartment,
          onDepartmentChange: handleDepartmentChange,
          departmentOptions
        }}
      >
        <div className="min-h-screen" style={{backgroundColor: "#e5e7eb"}}>
          <main className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-4 xs:py-6 sm:py-8 max-w-7xl">

            {/* Compteur de résultats - Affiché seulement s'il y a des employés */}
            {displayData.length > 0 && (
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-sm xs:text-base sm:text-lg font-semibold text-foreground">
                    {displayData.length} employé{displayData.length > 1 ? 's' : ''} trouvé{displayData.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Grille des employés - Responsive optimisée pour tous les écrans */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 xs:mb-8">
              {displayEmployees.map((employee, index) => (
                employee ? (
                  <Card 
                    key={employee.id} 
                    className="overflow-hidden sm:hover:shadow-2xl sm:hover:-translate-y-2 sm:hover:scale-105 transition-all duration-300 ease-out border-border transform group touch-manipulation"
                    style={{backgroundColor: "#344256"}}
                  >
                    <div className="h-10 xs:h-12 sm:h-14 md:h-16" style={{backgroundColor: "#344256"}} />
                    <CardContent className="pt-0 px-3 xs:px-4 sm:px-5 md:px-6 pb-3 xs:pb-4 sm:pb-5 md:pb-6">
                      <div className="flex flex-col items-center -mt-8 xs:-mt-10 sm:-mt-12 md:-mt-14">
                        <Avatar className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 border-2 xs:border-3 sm:border-4 border-white shadow-lg sm:group-hover:scale-110 sm:group-hover:shadow-2xl transition-all duration-300 ease-out">
                          <AvatarImage
                            src={employee.avatar || "/placeholder-user.jpg"}
                            alt={`${employee.full_name}`}
                            onLoad={() => {
                              console.log('🖼️ [ANNUAIRE] Image chargée avec succès:', employee.full_name, employee.avatar)
                            }}
                            onError={(e) => {
                              console.error('❌ [ANNUAIRE] Erreur de chargement d\'image:', employee.full_name, employee.avatar)
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="text-center mt-2 xs:mt-2.5 sm:mt-3 md:mt-4 mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 sm:group-hover:scale-105 transition-all duration-300 ease-out">
                          <h3 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white text-balance leading-tight sm:group-hover:text-yellow-200 transition-colors duration-300 px-1">
                            {employee.full_name}
                          </h3>
                          <div className="mt-1 xs:mt-1.5 sm:mt-2 sm:group-hover:scale-110 transition-transform duration-300 ease-out">
                            <span className="inline-block bg-white/10 text-white text-[10px] xs:text-xs sm:text-sm font-medium px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-full border border-white/20 sm:group-hover:bg-yellow-400/20 sm:group-hover:text-yellow-200 sm:group-hover:border-yellow-300/40 sm:group-hover:shadow-lg transition-all duration-300 line-clamp-2">
                              {employee.position_title}
                            </span>
                          </div>
                        </div>

                        {/* Informations compactes - Responsive */}
                        <div className="w-full space-y-1 xs:space-y-1.5 sm:space-y-2 md:space-y-2.5 mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 sm:group-hover:translate-x-1 transition-transform duration-300 ease-out">
                          <div className="flex items-start gap-1.5 xs:gap-2 sm:gap-2.5 text-[10px] xs:text-xs sm:text-sm sm:group-hover:scale-105 transition-transform duration-300 ease-out">
                            <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0 mt-0.5 sm:group-hover:text-blue-300 sm:group-hover:scale-125 transition-all duration-300 ease-out" />
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Ouvrir Outlook Web App dans un nouvel onglet avec le destinataire prérempli
                                const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(employee.email)}`;
                                window.open(outlookUrl, '_blank', 'noopener,noreferrer');
                              }}
                              className="text-gray-200 hover:text-blue-300 active:text-blue-400 transition-colors break-all text-[10px] xs:text-xs sm:text-sm sm:group-hover:text-blue-200 leading-tight cursor-pointer"
                            >
                              {employee.email}
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 text-[10px] xs:text-xs sm:text-sm sm:group-hover:scale-105 transition-transform duration-300 ease-out">
                            <Phone className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0 sm:group-hover:text-green-300 sm:group-hover:scale-125 transition-all duration-300 ease-out" />
                            {employee.phone_fixed ? (
                              <a href={`tel:${employee.phone_fixed}`} className="text-gray-200 hover:text-blue-300 active:text-blue-400 transition-colors text-[10px] xs:text-xs sm:text-sm sm:group-hover:text-green-200">
                                {employee.phone_fixed}
                              </a>
                            ) : (
                              <span className="text-gray-400 text-[10px] xs:text-xs sm:text-sm sm:group-hover:text-gray-300">Non renseigné</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 text-[10px] xs:text-xs sm:text-sm sm:group-hover:scale-105 transition-transform duration-300 ease-out">
                            <Smartphone className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0 sm:group-hover:text-purple-300 sm:group-hover:scale-125 transition-all duration-300 ease-out" />
                            {employee.phone_mobile ? (
                              <a href={`tel:${employee.phone_mobile}`} className="text-gray-200 hover:text-blue-300 active:text-blue-400 transition-colors text-[10px] xs:text-xs sm:text-sm sm:group-hover:text-purple-200">
                                {employee.phone_mobile}
                              </a>
                            ) : (
                              <span className="text-gray-400 text-[10px] xs:text-xs sm:text-sm sm:group-hover:text-gray-300">Non renseigné</span>
                            )}
                          </div>
                        </div>

                        {/* Boutons - Responsive optimisé */}
                        <div className="flex gap-1.5 xs:gap-2 sm:gap-2.5 w-full mt-1.5 xs:mt-2 sm:mt-2.5 sm:group-hover:scale-105 sm:group-hover:-translate-y-0.5 transition-all duration-300 ease-out">
                          <Button
                            size="sm"
                            className="flex-1 gap-1 xs:gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3 min-w-0"
                            style={{
                              backgroundColor: '#e2e8f0',
                              color: '#4a5568',
                              borderColor: '#e2e8f0',
                              borderWidth: '1px'
                            }}
                            onMouseEnter={(e) => {
                              if (window.innerWidth >= 640) {
                                e.currentTarget.style.backgroundColor = '#cbd5e0';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (window.innerWidth >= 640) {
                                e.currentTarget.style.backgroundColor = '#e2e8f0';
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Ouvrir Outlook Web App dans un nouvel onglet avec le destinataire prérempli
                              const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(employee.email)}`;
                              window.open(outlookUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="hidden xs:inline truncate">Email</span>
                          </Button>
                          <ChatButton employee={employee} className="flex-1 min-w-0">
                            <Button 
                              size="sm" 
                              className="w-full gap-1 xs:gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3 min-w-0"
                              style={{
                                backgroundColor: '#4a5568',
                                color: 'white',
                                borderColor: '#4a5568',
                                borderWidth: '1px'
                              }}
                              onMouseEnter={(e) => {
                                if (window.innerWidth >= 640) {
                                  e.currentTarget.style.backgroundColor = '#2d3748';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (window.innerWidth >= 640) {
                                  e.currentTarget.style.backgroundColor = '#4a5568';
                                }
                              }}
                            >
                              <MessageCircle className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="hidden xs:inline truncate">Chat</span>
                            </Button>
                          </ChatButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              ))}
            </div>

            {/* Empty State - Responsive */}
            {displayData.length === 0 && (
              <Card className="p-6 xs:p-8 sm:p-10 md:p-12 text-center rounded-lg">
                <div className="space-y-3 xs:space-y-4">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base xs:text-lg sm:text-xl font-semibold">Aucun employé trouvé</h3>
                    <p className="text-sm xs:text-base text-muted-foreground mt-2">Essayez de modifier vos critères de recherche</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Pagination - Responsive optimisée */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 flex-wrap">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
                </Button>

                {/* Afficher les pages - Simplifié pour éviter les problèmes d'hydratation */}
                {totalPages <= 7 ? (
                  // Afficher toutes les pages si 7 ou moins
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg border transition-colors font-medium text-xs xs:text-sm ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      }`}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  ))
                ) : (
                  // Afficher avec ellipses si plus de 7 pages
                  <>
                    {currentPage > 3 && (
                      <>
                        <Button
                          onClick={() => setCurrentPage(1)}
                          className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg border transition-colors font-medium text-xs xs:text-sm bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                          aria-label="Page 1"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="px-1 xs:px-2 text-foreground text-xs xs:text-sm">...</span>
                        )}
                      </>
                    )}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                      return startPage + i;
                    }).filter(page => page <= totalPages).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg border transition-colors font-medium text-xs xs:text-sm ${
                          currentPage === page
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ))}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-1 xs:px-2 text-foreground text-xs xs:text-sm">...</span>
                        )}
                        <Button
                          onClick={() => setCurrentPage(totalPages)}
                          className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg border transition-colors font-medium text-xs xs:text-sm bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                          aria-label={`Page ${totalPages}`}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </>
                )}

                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
                </Button>
              </div>
            )}
          </main>
        </div>

      </LayoutWrapper>
    </>
  )
}
