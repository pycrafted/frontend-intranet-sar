"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Smartphone, MessageCircle, ChevronLeft, ChevronRight, Search, Building2, User } from "lucide-react"
import { useEmployees, Employee, Department } from "@/hooks/useEmployees"
import { StandardLoader } from "@/components/ui/standard-loader"

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
    position: 1,
    position_title: "Directrice Commerciale et Marketing",
    department_name: "Direction Commerciale et Marketing",
    matricule: "SAR001",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    hire_date: "2020-01-01",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 2,
    position_title: "Directeur général",
    department_name: "Administration",
    matricule: "SAR002",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    hire_date: "2020-01-01",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 3,
    position_title: "Directeur des Ressources Humaines",
    department_name: "Direction des Ressources Humaines",
    matricule: "SAR003",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    hire_date: "2020-01-01",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 4,
    position_title: "Directeur EXECUTIVE - SUPPORT",
    department_name: "Direction EXECUTIVE - SUPPORT",
    matricule: "SAR004",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    hire_date: "2020-01-01",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 5,
    position_title: "Directeur Technique",
    department_name: "Direction Technique",
    matricule: "SAR005",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    hire_date: "2020-01-01",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 6,
    position_title: "Directeur EXECUTIVE OPERATIONS",
    department_name: "Direction Executif",
    matricule: "SAR006",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    hire_date: "2020-01-01",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 7,
    position_title: "Responsable Qualité",
    department_name: "Direction Qualité",
    matricule: "SAR007",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    is_manager: false,
    is_active: true,
    hire_date: "2021-03-15",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 8,
    position_title: "Chef de Projet",
    department_name: "Direction Technique",
    matricule: "SAR008",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    is_manager: false,
    is_active: true,
    hire_date: "2021-06-01",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
    position: 9,
    position_title: "Analyste Financier",
    department_name: "Direction Financière",
    matricule: "SAR009",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    is_manager: false,
    is_active: true,
    hire_date: "2022-01-10",
    office_location: "Dakar - Siège",
    work_schedule: "Temps plein",
    avatar: "/placeholder-user.jpg",
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
  const itemsPerPage = 6

  // Utiliser l'API
  const { 
    employees, 
    departments, 
    loading, 
    error, 
    searchEmployees 
  } = useEmployees()

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
    }, 1000) // 1 seconde pour laisser le temps de finir d'écrire
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Mettre à jour les données filtrées quand les données de l'API changent
  useEffect(() => {
    if (employees.length > 0) {
      setFilteredEmployees(employees)
    }
  }, [employees])

  // Effectuer la recherche avec le terme debounced
  useEffect(() => {
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
    window.location.href = `mailto:${email}`
  }

  const handleEmployeeClick = (employee: Employee) => {
    // Modal supprimé - pas d'action au clic
  }

  const handleChatClick = (employee: Employee) => {
    // TODO: Implémenter la fonctionnalité de chat
    console.log(`Ouvrir le chat avec ${employee.full_name}`)
  }

  // Utiliser les données de l'API ou les données filtrées
  const displayData = filteredEmployees.length > 0 ? filteredEmployees : employees
  
  
  // Calcul de la pagination
  const totalPages = Math.ceil(displayData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = displayData.slice(startIndex, endIndex)
  
  // Créer un tableau de 8 éléments pour maintenir la grille
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
          <main className="container mx-auto px-4 py-8 max-w-7xl">

            {/* Compteur de résultats - Affiché seulement s'il y a des employés */}
            {displayData.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-lg font-semibold text-foreground">
                    {displayData.length} employé{displayData.length > 1 ? 's' : ''} trouvé{displayData.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Grille des employés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayEmployees.map((employee, index) => (
                employee ? (
                  <Card 
                    key={employee.id} 
                    className="overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out bg-card border-border cursor-pointer transform"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <div className="h-16" style={{backgroundColor: "#e7eaee"}} />
                    <CardContent className="pt-0 px-6 pb-6">
                      <div className="flex flex-col items-center -mt-10">
                        <Avatar className="w-20 h-20 border-4 border-card shadow-md">
                          <AvatarImage
                            src={employee.avatar || "/placeholder-user.jpg"}
                            alt={`${employee.full_name}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="text-center mt-4 mb-4">
                          <h3 className="text-xl font-semibold text-foreground text-balance">
                            {employee.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 text-balance">{employee.position_title}</p>
                        </div>

                        <div className="w-full space-y-3 mb-5">
                          <div className="flex items-start gap-3 text-sm">
                            <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-foreground text-pretty leading-relaxed">{employee.department_name}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            {employee.phone_fixed ? (
                              <a href={`tel:${employee.phone_fixed}`} className="text-foreground hover:text-primary transition-colors">
                                {employee.phone_fixed}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Non renseigné</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            {employee.phone_mobile ? (
                              <a href={`tel:${employee.phone_mobile}`} className="text-foreground hover:text-primary transition-colors">
                                {employee.phone_mobile}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Non renseigné</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <a
                              href={`mailto:${employee.email}`}
                              className="text-foreground hover:text-primary transition-colors break-all"
                            >
                              {employee.email}
                            </a>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground font-mono">{employee.matricule}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            style={{
                              backgroundColor: 'white',
                              color: 'black',
                              borderColor: 'black',
                              borderWidth: '1px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#0e2f56';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.color = 'black';
                            }}
                            onClick={() => window.location.href = `mailto:${employee.email}`}
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => handleChatClick(employee)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              ))}
            </div>

            {/* Empty State */}
            {displayData.length === 0 && (
              <Card className="p-12 text-center rounded-lg">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Aucun employé ajouté à l'annuaire</h3>
                  </div>
                </div>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors font-medium ${
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

                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </main>
        </div>

    </LayoutWrapper>
    </>
  )
}
