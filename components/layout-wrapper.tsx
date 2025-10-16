"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"
import { Navbar } from "./navbar"
import { SecondaryNavbar } from "./secondary-navbar"
import { ControlCenterSidebar } from "./control-center-sidebar"
// import { DocumentsSidebar } from "./documents-sidebar" // Supprimé
// import { RecrutementSidebar } from "./recrutement-sidebar" // Supprimé
import { PublicationModal } from "./publication-modal"
import { AnnouncementModal } from "./announcement-modal"
import { Footer } from "./footer"
import { AuthGuard } from "./auth-guard"
import { MaiChatbot } from "./saria-chatbot"

interface LayoutWrapperProps {
  children: React.ReactNode
  secondaryNavbarProps?: {
    searchTerm?: string
    onSearchChange?: (search: string) => void
    onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    searchPlaceholder?: string
    isTyping?: boolean
    selectedDepartment?: string
    onDepartmentChange?: (department: string) => void
    departmentOptions?: string[]
  }
  sidebarProps?: {
    activeFilter?: string
    onFilterChange?: (filter: string) => void
    activeDepartment?: string
    onDepartmentChange?: (department: string) => void
    activeSection?: string
    onSectionChange?: (section: string) => void
    // Props spécifiques aux documents
    activeSort?: string
    onSortChange?: (sort: string) => void
    activeFolder?: number | null
    onFolderChange?: (folderId: number | null) => void
    documentsCount?: number
    documents?: any[]
    folders?: any[]
    folderTree?: any[]
    onUploadSuccess?: () => void
    onUploadClick?: () => void
    onCreateFolder?: (folderData: any) => Promise<{ success: boolean; error?: string }>
    onUpdateFolder?: (folderId: number, folderData: any) => Promise<{ success: boolean; error?: string }>
    onDeleteFolder?: (folderId: number) => Promise<{ success: boolean; error?: string }>
    // Props spécifiques au recrutement
    onRecruitmentFilterChange?: (filters: {
      department: string
      type: string
      urgency: string
      experience: string
    }) => void
    onRecruitmentSearchChange?: (search: string) => void
    searchTerm?: string
    activeFilters?: {
      department: string
      type: string
      urgency: string
      experience: string
    }
  }
}

export function LayoutWrapper({ children, secondaryNavbarProps, sidebarProps }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true) // Rétracté par défaut
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(true) // Rétracté par défaut
  const [showPublicationModal, setShowPublicationModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const pathname = usePathname()

  // Pages publiques qui n'ont pas besoin d'authentification
  const publicPages = ['/actualites']
  const isPublicPage = publicPages.includes(pathname)

  // Synchroniser automatiquement le rétractement du sidebar secondaire avec le sidebar principal
  // Mais permettre aussi le contrôle indépendant
  useEffect(() => {
    if (pathname === "/centre_de_controle") {
      // Si le sidebar principal est rétracté, forcer le rétractement du sidebar secondaire
      if (isSidebarCollapsed) {
        setIsSecondarySidebarCollapsed(true)
      }
      // Si le sidebar principal est développé, développer le sidebar secondaire
      // Mais seulement si l'utilisateur n'a pas fait de contrôle manuel récent
      else {
        // On ne force pas le développement, on laisse l'utilisateur contrôler
        // setIsSecondarySidebarCollapsed(false)
      }
    }
  }, [isSidebarCollapsed, pathname])

  // Initialiser les sidebars comme rétractés au chargement de la page
  useEffect(() => {
    // S'assurer que les sidebars sont rétractés par défaut
    setIsSidebarCollapsed(true)
    setIsSecondarySidebarCollapsed(true)
  }, [])

  // Contenu du layout
  const layoutContent = (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Navigation 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onCollapseChange={setIsSidebarCollapsed}
        />

        <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className={`flex-1 bg-gray-200 transition-all duration-300 ${
            pathname === "/centre_de_controle" ? (
              isSecondarySidebarCollapsed ? "lg:ml-0" : "lg:ml-80"
            ) : ""}`}>
      {/* Secondary Navbar pour les pages actualités, organigramme, annuaire, documents et recrutement - dans la zone de contenu */}
      {(pathname === "/actualites" || pathname === "/organigramme" || pathname === "/annuaire" || pathname === "/documents" || pathname === "/recrutement") && (
        <SecondaryNavbar 
          {...secondaryNavbarProps} 
          showFilter={pathname === "/organigramme" || pathname === "/actualites"} 
        />
      )}
            
            <div className={`mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:px-8 ${pathname === "/" || pathname === "/securite" ? "max-w-none px-1 sm:px-2 lg:px-4" : pathname === "/organigramme" ? "max-w-none px-0" : "max-w-7xl"}`}>
              {children}
            </div>
          </div>
          {pathname === "/centre_de_controle" && <ControlCenterSidebar 
            {...sidebarProps} 
            isCollapsed={isSecondarySidebarCollapsed}
            onCollapseChange={setIsSecondarySidebarCollapsed}
            isMainSidebarCollapsed={isSidebarCollapsed}
          />}
          {/* Sidebar des documents supprimée */}
          {/* Sidebar de recrutement supprimée */}
          
          {/* Footer - toujours en bas, après les sidebars */}
          <Footer />
        </main>
      </div>

      {/* Modals globaux - seulement pour les pages authentifiées */}
      {!isPublicPage && (
        <>
          <PublicationModal 
            isOpen={showPublicationModal} 
            onClose={() => setShowPublicationModal(false)} 
          />
          <AnnouncementModal 
            isOpen={showAnnouncementModal} 
            onClose={() => setShowAnnouncementModal(false)} 
          />
        </>
      )}
      
      {/* Chatbot MAÏ - seulement pour les pages authentifiées */}
      {!isPublicPage && <MaiChatbot />}
    </div>
  )

  // Si c'est une page publique, ne pas utiliser AuthGuard
  if (isPublicPage) {
    return layoutContent
  }

  // Pour les autres pages, utiliser AuthGuard
  return (
    <AuthGuard>
      {layoutContent}
    </AuthGuard>
  )
}
