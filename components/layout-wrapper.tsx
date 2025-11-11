"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Navigation } from "./navigation"
import { Navbar } from "./navbar"
import { useAuth } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-api"
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
  forumSidebarProps?: {
    isCollapsed?: boolean
    onCollapseChange?: (isCollapsed: boolean) => void
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

export function LayoutWrapper({ children, secondaryNavbarProps, sidebarProps, forumSidebarProps }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // Ouvert par défaut
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(true) // Rétracté par défaut
  const [showPublicationModal, setShowPublicationModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  // Pages protégées nécessitant une authentification
  const protectedPages = ['/metriques', '/centre_de_controle', '/reseau-social']
  const isProtectedPage = protectedPages.includes(pathname)

  // Redirection selon la page: 
  // - '/metriques' => admin uniquement
  // - '/centre_de_controle' => admin OU communication
  // - '/reseau-social' => authentification requise (géré par AuthGuard dans la page)
  useEffect(() => {
    if (!isLoading && isProtectedPage) {
      const isAdmin = !!user && (user.is_superuser || (user as any).is_admin_group)
      const isCom = !!user && ((user as any).is_communication_group === true)
      if (pathname === '/metriques') {
        if (!isAuthenticated || !isAdmin) router.push('/')
      } else if (pathname === '/centre_de_controle') {
        if (!isAuthenticated || (!isAdmin && !isCom)) router.push('/')
      }
      // '/reseau-social' est géré par AuthGuard directement dans la page
    }
  }, [isProtectedPage, pathname, isLoading, isAuthenticated, user, router])

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

  // Initialiser les sidebars au chargement de la page
  useEffect(() => {
    // Sidebar principal ouvert par défaut, sidebar secondaire rétracté par défaut
    setIsSidebarCollapsed(false)
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

        <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'tablet:ml-12 md:ml-14 lg:ml-16' : 'tablet:ml-56 md:ml-60 lg:ml-64'}`}>
          <div className={`flex-1 bg-gray-200 transition-all duration-300 ${
            pathname === "/centre_de_controle" ? (
              isSecondarySidebarCollapsed ? "lg:ml-0" : "lg:ml-80"
            ) : pathname === "/forum" ? (
              "" // Le forum gère lui-même les marges pour le sidebar secondaire
            ) : ""}`}>
      {/* Secondary Navbar pour les pages actualités, organigramme, annuaire, documents - dans la zone de contenu */}
      {(pathname === "/actualites" || pathname === "/organigramme" || pathname === "/annuaire" || pathname === "/documents") && (
        <SecondaryNavbar 
          {...secondaryNavbarProps} 
          showFilter={pathname === "/organigramme" || pathname === "/actualites"}
          showTimeFilter={pathname === "/actualites"} // Seulement pour les actualités
          showDepartmentFilter={pathname === "/organigramme"} // Seulement pour l'organigramme
        />
      )}
            
            <div className={`mx-auto px-2 xs:px-3 sm:px-4 md:px-5 py-3 xs:py-4 sm:py-6 lg:px-8 max-w-full overflow-x-hidden ${pathname === "/" || pathname === "/securite" || pathname === "/recrutement" || pathname === "/reseau-social" || pathname === "/forum" ? (pathname === "/forum" ? "max-w-none p-0" : pathname === "/reseau-social" ? "max-w-none p-0" : "max-w-none px-1 xs:px-1.5 sm:px-2 md:px-3 lg:px-4") : pathname === "/organigramme" ? "max-w-none px-0" : "max-w-7xl"}`}>
              {(() => {
                // Vérifier si l'enfant est un composant React (pas un élément DOM)
                if (pathname === "/forum" && React.isValidElement(children)) {
                  const child = children as React.ReactElement<any>
                  // Vérifier que ce n'est pas un élément DOM (type string = élément DOM)
                  if (typeof child.type !== 'string' && child.type) {
                    return React.cloneElement(child, { isMainSidebarCollapsed: isSidebarCollapsed })
                  }
                }
                if (pathname === "/reseau-social" && React.isValidElement(children)) {
                  const child = children as React.ReactElement<any>
                  // Vérifier que ce n'est pas un élément DOM (type string = élément DOM)
                  if (typeof child.type !== 'string' && child.type) {
                    return React.cloneElement(child, { isMainSidebarCollapsed: isSidebarCollapsed })
                  }
                }
                return children
              })()}
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

      {/* Modals globaux - disponibles sur toutes les pages */}
      <PublicationModal 
        isOpen={showPublicationModal} 
        onClose={() => setShowPublicationModal(false)} 
      />
      <AnnouncementModal 
        isOpen={showAnnouncementModal} 
        onClose={() => setShowAnnouncementModal(false)} 
      />
      
      {/* Chatbot MAÏ - disponible sur toutes les pages */}
      <MaiChatbot />
    </div>
  )

  // Pages protégées nécessitant une authentification
  // Toutes les autres pages sont publiques
  if (isProtectedPage) {
    return (
      <AuthGuard fallback={null} redirectTo="/">
        {layoutContent}
      </AuthGuard>
    )
  }

  // Pages publiques - pas de protection
  return layoutContent
}
