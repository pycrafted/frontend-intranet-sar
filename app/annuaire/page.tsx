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
  // Items par page : 8 cartes par page pour toutes les tailles d'écran
  const getItemsPerPage = () => {
    return 8; // 8 cartes par page pour toutes les tailles d'écran
  }
  const [itemsPerPage, setItemsPerPage] = useState(8)
  
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

  return (
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
        <div className="w-full space-y-4 xs:space-y-6">
          {/* État de chargement et d'erreur - Style actualités */}
          {(loading || error) && (
            <StandardLoader 
              title={loading ? "Chargement de l'annuaire..." : undefined}
              message={loading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
              error={error}
              showRetry={!!error}
              onRetry={() => window.location.reload()}
            />
          )}

          {/* Contenu principal - Style actualités */}
          {!loading && !error && (
            <div className="space-y-4 xs:space-y-6 stagger-animation">
              {/* Header - Style actualités */}
              {displayData.length > 0 && (
                <div className="space-y-3 xs:space-y-4 relative">
                  <div className="flex items-center gap-2 mb-3 xs:mb-4 px-1 max-w-7xl mx-auto">
                    <div className="w-1 h-4 xs:h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
                    <h3 className="text-base xs:text-lg font-semibold text-gray-900">Annuaire des employés</h3>
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs xs:text-sm px-2 py-1">
                      {displayData.length}
                    </Badge>
                  </div>

                  {/* Grille des employés - Style actualités moderne */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xs:gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
                    {displayEmployees.map((employee) => (
                      employee ? (
                        <Card
                          key={employee.id}
                          className="rounded-xl overflow-hidden group fade-in w-full bg-white border-2 border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                          style={{ borderColor: '#e5e7eb' }}
                          onMouseEnter={(e) => {
                            if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                              e.currentTarget.style.borderColor = "#344256";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                              e.currentTarget.style.borderColor = "#e5e7eb";
                            }
                          }}
                        >
                          <CardContent className="p-0 w-full flex flex-col">
                            {/* Header avec avatar centré - Style actualités */}
                            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4">
                              <div className="flex flex-col items-center text-center">
                                {/* Avatar centré */}
                                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-gray-200 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 mb-3 sm:mb-4">
                                  <AvatarImage
                                    src={employee.avatar || "/placeholder-user.jpg"}
                                    alt={employee.full_name}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg sm:text-xl">
                                    {employee.initials}
                                  </AvatarFallback>
                                </Avatar>
                                
                                {/* Nom centré */}
                                <h3 
                                  className="text-base sm:text-lg font-bold text-gray-900 transition-colors line-clamp-2 mb-2 sm:mb-3"
                                  onMouseEnter={(e) => {
                                    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                      e.currentTarget.style.color = "#344256";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                      e.currentTarget.style.color = "#111827";
                                    }
                                  }}
                                >
                                  {employee.full_name}
                                </h3>
                                
                                {/* Poste avec style spécial */}
                                {employee.position_title && (
                                  <div className="mb-3 sm:mb-4 w-full">
                                    <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                                      <p className="text-xs sm:text-sm text-gray-700 font-semibold line-clamp-2">
                                        {employee.position_title}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Direction */}
                                {employee.main_direction_name && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 mb-3 sm:mb-4">
                                    {employee.main_direction_name}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Contenu principal - Style actualités */}
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex-1 flex flex-col">

                              {/* Informations de contact - Toujours affichées */}
                              <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5 flex-1">
                                {/* Email - Toujours affiché */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  {employee.email ? (
                                    <a
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(employee.email)}`;
                                        window.open(outlookUrl, '_blank', 'noopener,noreferrer');
                                      }}
                                      className="transition-colors truncate"
                                      style={{ color: '#4b5563' }}
                                      onMouseEnter={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.color = "#344256";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.color = "#4b5563";
                                        }
                                      }}
                                    >
                                      {employee.email}
                                    </a>
                                  ) : (
                                    <span className="text-gray-600">Non Disponible</span>
                                  )}
                                </div>
                                
                                {/* Téléphone fixe - Toujours affiché */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  {employee.phone_fixed ? (
                                    <a 
                                      href={`tel:${employee.phone_fixed}`} 
                                      className="transition-colors"
                                      style={{ color: '#4b5563' }}
                                      onMouseEnter={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.color = "#344256";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.color = "#4b5563";
                                        }
                                      }}
                                    >
                                      {employee.phone_fixed}
                                    </a>
                                  ) : (
                                    <span className="text-gray-600">Non Disponible</span>
                                  )}
                                </div>
                                
                                {/* Téléphone mobile - Toujours affiché */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Smartphone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  {employee.phone_mobile ? (
                                    <a 
                                      href={`tel:${employee.phone_mobile}`} 
                                      className="transition-colors"
                                      style={{ color: '#4b5563' }}
                                      onMouseEnter={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.color = "#344256";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.color = "#4b5563";
                                        }
                                      }}
                                    >
                                      {employee.phone_mobile}
                                    </a>
                                  ) : (
                                    <span className="text-gray-600">Non Disponible</span>
                                  )}
                                </div>
                              </div>

                              {/* Footer avec actions - Style actualités */}
                              <div className="mt-auto pt-3 border-t border-gray-100">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs sm:text-sm"
                                    style={{
                                      borderColor: "#344256"
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(employee.email)}`;
                                      window.open(outlookUrl, '_blank', 'noopener,noreferrer');
                                    }}
                                  >
                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    Email
                                  </Button>
                                  <ChatButton employee={employee} className="flex-1">
                                    <Button 
                                      size="sm"
                                      className="w-full text-xs sm:text-sm text-white"
                                      style={{
                                        backgroundColor: "#344256",
                                        borderColor: "#344256"
                                      }}
                                      onMouseEnter={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.backgroundColor = "#2a3441";
                                          e.currentTarget.style.borderColor = "#2a3441";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                                          e.currentTarget.style.backgroundColor = "#344256";
                                          e.currentTarget.style.borderColor = "#344256";
                                        }
                                      }}
                                    >
                                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                      Chat
                                    </Button>
                                  </ChatButton>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State - Style actualités */}
              {displayData.length === 0 && (
                <div className="max-w-7xl mx-auto">
                  <Card className="p-8 xs:p-12 text-center rounded-lg">
                    <div className="space-y-3 xs:space-y-4">
                      <div className="w-12 h-12 xs:w-16 xs:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Search className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-base xs:text-lg font-semibold">Aucun employé trouvé</h3>
                        <p className="text-sm text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Pagination - Style actualités */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-7xl mx-auto">
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
        </div>
      </LayoutWrapper>
  )
}
