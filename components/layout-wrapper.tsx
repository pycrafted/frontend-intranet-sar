"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Navigation } from "./navigation"
import { Navbar } from "./navbar"
import { useAuth } from "@/hooks/useAuth"
import { SecondaryNavbar } from "./secondary-navbar"
// import { DocumentsSidebar } from "./documents-sidebar" // Supprimé
// import { RecrutementSidebar } from "./recrutement-sidebar" // Supprimé
import { PublicationModal } from "./publication-modal"
import { AnnouncementModal } from "./announcement-modal"
import { AuthGuard } from "./auth-guard"
import { AIChatbotProvider } from "@/contexts/AIChatbotContext"
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
    showFilter?: boolean
    showTimeFilter?: boolean
    showDepartmentFilter?: boolean
    departmentFilterStatic?: boolean
    rightActions?: React.ReactNode
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
    // Props spécifiques au forum
    forums?: any[]
    forumsLoading?: boolean
    onCreateForumClick?: () => void
    onEditForumClick?: (forum: any) => void
    onDeleteForumClick?: (forum: any) => void
  }
}

export function LayoutWrapper({ children, secondaryNavbarProps }: LayoutWrapperProps) {
  // Sidebar principal toujours rétracté — définitivement
  const isSidebarCollapsed = true
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [showPublicationModal, setShowPublicationModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const protectedPages = ['/metriques']
  const isProtectedPage = protectedPages.includes(pathname)

  useEffect(() => {
    if (!isLoading && isProtectedPage) {
      const isAdmin = !!user && user.is_superuser
      if (pathname === '/metriques') {
        if (!isAuthenticated || !isAdmin) router.push('/')
      }
    }
  }, [isProtectedPage, pathname, isLoading, isAuthenticated, user, router])

  useEffect(() => {
  }, [pathname])

  // Contenu du layout
  const layoutContent = (
    <AIChatbotProvider>
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onMenuOpen={() => setIsMobileNavOpen(true)} />

      <div className="flex flex-1">
        <Navigation isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <main className="flex-1 flex flex-col transition-all duration-300 tablet:ml-[4.5rem] md:ml-[4.5rem] lg:ml-[4.5rem]">
          <div className="flex-1 bg-gray-200 transition-all duration-300 flex flex-col">
      {/* Secondary Navbar pour les pages actualités, organigramme, annuaire, documents, recrutement, administration */}
      {(pathname === "/actualites" || pathname === "/organigramme" || pathname === "/annuaire" || pathname === "/documents" || pathname === "/recrutement" || pathname === "/administration/utilisateurs") && (
        <SecondaryNavbar
          showFilter={pathname === "/organigramme" || pathname === "/actualites"}
          showTimeFilter={pathname === "/actualites"}
          showDepartmentFilter={pathname === "/organigramme"}
          {...secondaryNavbarProps}
        />
      )}
            
            <div className={`overflow-x-hidden ${pathname === "/" || pathname === "/securite" || pathname === "/recrutement" || pathname === "/forum" ? "w-full px-1 xs:px-1.5 sm:px-2 md:px-3 lg:px-4 py-3 xs:py-4 sm:py-6" : pathname === "/documents" || pathname === "/annuaire" || pathname?.startsWith("/forum/") || pathname === "/administration/utilisateurs" || pathname === "/metriques" ? "w-full p-0" : pathname === "/organigramme" ? "w-full px-0" : "max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-5 py-3 xs:py-4 sm:py-6 lg:px-8"}`}>
              {(() => {
                // Vérifier si l'enfant est un composant React (pas un élément DOM)
                if ((pathname === "/recrutement" || pathname === "/organigramme" || pathname === "/forum" || pathname?.startsWith("/forum/")) && React.isValidElement(children)) {
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
          {/* Sidebar des documents supprimée */}
          {/* Sidebar de recrutement supprimée */}
          
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
      
      <MaiChatbot />
    </div>
    </AIChatbotProvider>
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
