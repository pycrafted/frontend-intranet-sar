"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
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
    phone: "774596321",
    employee_id: "SAR001",
    position: "Directrice Commerciale et Marketing",
    position_title: "Directrice Commerciale et Marketing",
    department: "Direction Commerciale et Marketing",
    department_name: "Direction Commerciale et Marketing",
    matricule: "SAR001",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    is_staff: true,
    is_superuser: false,
    avatar: "/placeholder-user.jpg",
    avatar_url: "/placeholder-user.jpg",
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
    phone: "772503120",
    employee_id: "SAR002",
    position: "Directeur général",
    position_title: "Directeur général",
    department: "Administration",
    department_name: "Administration",
    matricule: "SAR002",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    is_staff: true,
    is_superuser: false,
    avatar: "/placeholder-user.jpg",
    avatar_url: "/placeholder-user.jpg",
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
    phone: "772598631",
    employee_id: "SAR003",
    position: "Directeur des Ressources Humaines",
    position_title: "Directeur des Ressources Humaines",
    department: "Direction des Ressources Humaines",
    department_name: "Direction des Ressources Humaines",
    matricule: "SAR003",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    is_staff: true,
    is_superuser: false,
    avatar: "/placeholder-user.jpg",
    avatar_url: "/placeholder-user.jpg",
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
    phone: "771459313",
    employee_id: "SAR004",
    position: "Directeur EXECUTIVE - SUPPORT",
    position_title: "Directeur EXECUTIVE - SUPPORT",
    department: "Direction EXECUTIVE - SUPPORT",
    department_name: "Direction EXECUTIVE - SUPPORT",
    matricule: "SAR004",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    is_staff: true,
    is_superuser: false,
    avatar: "/placeholder-user.jpg",
    avatar_url: "/placeholder-user.jpg",
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
    phone: "775149638",
    employee_id: "SAR005",
    position: "Directeur Technique",
    position_title: "Directeur Technique",
    department: "Direction Technique",
    department_name: "Direction Technique",
    matricule: "SAR005",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    is_staff: true,
    is_superuser: false,
    avatar: "/placeholder-user.jpg",
    avatar_url: "/placeholder-user.jpg",
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
    phone: "772563920",
    employee_id: "SAR006",
    position: "Directeur EXECUTIVE OPERATIONS",
    position_title: "Directeur EXECUTIVE OPERATIONS",
    department: "Direction Executif",
    department_name: "Direction Executif",
    matricule: "SAR006",
    manager: null,
    manager_name: null,
    hierarchy_level: 1,
    is_manager: true,
    is_active: true,
    is_staff: true,
    is_superuser: false,
    avatar: "/placeholder-user.jpg",
    avatar_url: "/placeholder-user.jpg",
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
    phone: "773456789",
    employee_id: "SAR007",
    position: "Responsable Qualité",
    position_title: "Responsable Qualité",
    department: "Direction Qualité",
    department_name: "Direction Qualité",
    matricule: "SAR007",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    is_manager: false,
    is_active: true,
    hire_date: "2021-03-15",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 8,
    first_name: "Ibrahima",
    last_name: "FALL",
    full_name: "Ibrahima FALL",
    initials: "IF",
    email: "ibrahimafall@sar.sn",
    phone: "774567890",
    employee_id: "SAR008",
    position: "Chef de Projet",
    position_title: "Chef de Projet",
    department: "Direction Technique",
    department_name: "Direction Technique",
    matricule: "SAR008",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    is_manager: false,
    is_active: true,
    hire_date: "2021-06-01",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 9,
    first_name: "Aminata",
    last_name: "SARR",
    full_name: "Aminata SARR",
    initials: "AS",
    email: "aminatasarr@sar.sn",
    phone: "775678901",
    employee_id: "SAR009",
    position: "Analyste Financier",
    position_title: "Analyste Financier",
    department: "Direction Financière",
    department_name: "Direction Financière",
    matricule: "SAR009",
    manager: null,
    manager_name: null,
    hierarchy_level: 2,
    is_manager: false,
    is_active: true,
    hire_date: "2022-01-10",
    avatar: "/placeholder-user.jpg",
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const itemsPerPage = 8

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

  // Debouncing pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 300)

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
    if (debouncedSearchTerm !== searchTerm) {
      searchEmployees(debouncedSearchTerm, selectedDepartment)
    }
  }, [debouncedSearchTerm, selectedDepartment, searchEmployees])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setIsTyping(true)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }
  }

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department)
    // Utiliser l'API pour la recherche avec le nouveau département
    searchEmployees(searchTerm, department)
  }

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
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
        <div className="px-6 py-8 space-y-8" style={{backgroundColor: "#e5e7eb"}}>
          {/* Results count with animation */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mt-6" style={{backgroundColor: "#e5e7eb"}}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: "#e5e7eb"}}></div>
                <span className="text-lg font-semibold" style={{color: "#e5e7eb"}}>
                  {displayData.length} employé{displayData.length > 1 ? 's' : ''} trouvé{displayData.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Employee Cards Grid */}
          <div className="max-w-7xl mx-auto">
            <div className="rounded-none p-4" style={{backgroundColor: "#e5e7eb"}}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{minHeight: 'calc(100vh - 200px)'}}>
              {displayEmployees.map((employee, index) => (
                employee ? (
                <Card
                  key={employee.id}
                  className="group relative bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden fade-in cursor-pointer"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="px-4 pt-5 pb-3">
                      {/* Avatar centré */}
                      <div className="flex justify-center mb-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={employee.avatar || "/placeholder-user.jpg"}
                              alt={employee.full_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold">${employee.initials}</div>`;
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Nom et poste centrés */}
                      <div className="text-center">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 leading-tight mb-1">
                          {employee.full_name}
                        </h3>
                        <p className="text-xs font-medium text-gray-600 line-clamp-2">
                          {employee.position_title}
                        </p>
                      </div>
                    </div>

                    {/* Séparateur visuel */}
                    <div className="mx-4 mb-3">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    </div>

                    {/* Informations de contact */}
                    <div className="px-4 pb-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                          <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center mr-2 group-hover:bg-blue-100 transition-colors duration-200">
                            <Mail className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="truncate font-medium">{employee.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                          <div className="w-6 h-6 bg-green-50 rounded-md flex items-center justify-center mr-2 group-hover:bg-green-100 transition-colors duration-200">
                            <Phone className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="font-medium">{employee.phone || "Non renseigné"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4">
                      <Button
                        onClick={() => handleChatClick(employee)}
                        className="w-full h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-md font-medium text-xs"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chatter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ) : (
                  // Card vide pour maintenir la grille
                  <div key={`empty-${index}`} className="invisible">
                    <Card className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <CardContent className="p-0">
                        <div className="px-4 pt-5 pb-3">
                          <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 rounded-full bg-gray-100"></div>
                          </div>
                          <div className="text-center">
                            <div className="h-4 bg-gray-100 rounded mb-1"></div>
                            <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto"></div>
                          </div>
                        </div>
                        <div className="mx-4 mb-3">
                          <div className="h-px bg-gray-200"></div>
                        </div>
                        <div className="px-4 pb-3">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gray-100 rounded-md mr-2"></div>
                              <div className="h-3 bg-gray-100 rounded flex-1"></div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gray-100 rounded-md mr-2"></div>
                              <div className="h-3 bg-gray-100 rounded flex-1"></div>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 pb-4">
                          <div className="h-8 bg-gray-100 rounded-md"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              ))}
              </div>
            </div>
            </div>

            {/* Pagination - Directement après les cards */}
            {totalPages > 1 && (
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-center gap-6 p-6 rounded-xl" style={{backgroundColor: "#e5e7eb"}}>
                  {/* Flèche Gauche */}
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === 1 ? "#e5e7eb" : "#3b82f6",
                      border: "none"
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" style={{color: currentPage === 1 ? "#9ca3af" : "white"}} />
                  </Button>

                  {/* Indicateur de page */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-700">
                      Page {currentPage} sur {totalPages}
                    </span>
                  </div>

                  {/* Flèche Droite */}
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === totalPages ? "#e5e7eb" : "#3b82f6",
                      border: "none"
                    }}
                  >
                    <ChevronRight className="h-6 w-6" style={{color: currentPage === totalPages ? "#9ca3af" : "white"}} />
                  </Button>
                </div>
              </div>
            )}
          </div>

      </div>

      {/* Carte détaillée de l'employé sélectionné - Style Organigramme */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-80 max-w-sm mx-4">
            <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-300 bg-white">
              <CardHeader className="text-center pb-4 pt-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-slate-100 group-hover:ring-blue-100 transition-all duration-300">
                    <AvatarImage 
                      src={selectedEmployee.avatar ? `http://localhost:8000${selectedEmployee.avatar}` : "/placeholder.svg"} 
                      alt={selectedEmployee.full_name || selectedEmployee.name || "Employé"} 
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {selectedEmployee.initials || "??"}
                    </AvatarFallback>
                  </Avatar>
                  {(selectedEmployee.hierarchy_level || selectedEmployee.level || 1) === 1 && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-yellow-800 text-lg">👑</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEmployee(null)}
                    className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full p-0 shadow-lg"
                  >
                    ×
                  </Button>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {selectedEmployee.full_name || selectedEmployee.name || "Nom inconnu"}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-blue-600">
                  {selectedEmployee.position_title || selectedEmployee.role || "Poste inconnu"}
                </CardDescription>
                <Badge variant="outline" className="w-fit mx-auto mt-2 border-slate-200 text-slate-600 bg-slate-50">
                  {selectedEmployee.department_name || selectedEmployee.department || "Département inconnu"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="truncate">{selectedEmployee.email || "Email non renseigné"}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>{selectedEmployee.phone || "Téléphone non renseigné"}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
                    onClick={() => window.open(`mailto:${selectedEmployee.email}`)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all"
                    onClick={() => handleChatClick(selectedEmployee)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chatter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </LayoutWrapper>
    </>
  )
}
