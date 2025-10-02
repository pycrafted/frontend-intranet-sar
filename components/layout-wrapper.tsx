"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"
import { Navbar } from "./navbar"
import { SecondaryNavbar } from "./secondary-navbar"
import { ActualitesSidebarV2 } from "./actualites-sidebar-v2"
import { ControlCenterSidebar } from "./control-center-sidebar"
import { DocumentsSidebar } from "./documents-sidebar"
import { RecrutementSidebar } from "./recrutement-sidebar"
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
  }
  sidebarProps?: {
    activeFilter?: string
    onFilterChange?: (filter: string) => void
    activeDepartment?: string
    onDepartmentChange?: (department: string) => void
    activeSection?: string
    onSectionChange?: (section: string) => void
    // Props spécifiques aux documents
    activeCategory?: number | null
    onCategoryChange?: (categoryId: number | null) => void
    activeSort?: string
    onSortChange?: (sort: string) => void
    activeFolder?: number | null
    onFolderChange?: (folderId: number | null) => void
    documentsCount?: number
    documents?: any[]
    categories?: any[]
    folders?: any[]
    folderTree?: any[]
    onUploadSuccess?: () => void
    onUploadClick?: () => void
    onCreateFolder?: (folderData: any) => Promise<{ success: boolean; error?: string }>
    onUpdateFolder?: (folderId: number, folderData: any) => Promise<{ success: boolean; error?: string }>
    onDeleteFolder?: (folderId: number) => Promise<{ success: boolean; error?: string }>
    // Props spécifiques au recrutement
    onFilterChange?: (filters: {
      department: string
      type: string
      urgency: string
      experience: string
    }) => void
    onSearchChange?: (search: string) => void
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
  const [showPublicationModal, setShowPublicationModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const pathname = usePathname()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex flex-1">
          <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 lg:ml-64 flex flex-col">
            <div className={`flex-1 bg-gray-200 ${pathname === "/actualites" ? "lg:ml-80" : ""} ${pathname === "/centre_de_controle" ? "lg:ml-80" : ""} ${pathname === "/documents" ? "lg:ml-80" : ""} ${pathname === "/recrutement" ? "lg:ml-80" : ""}`}>
              {/* Secondary Navbar pour la page actualités - dans la zone de contenu */}
              {pathname === "/actualites" && <SecondaryNavbar {...secondaryNavbarProps} />}
              
              <div className={`mx-auto px-4 py-6 lg:px-8 ${pathname === "/" || pathname === "/accueil" ? "max-w-none px-2 lg:px-4" : pathname === "/organigramme" ? "max-w-none px-0" : "max-w-7xl"}`}>
                {children}
              </div>
            </div>
            {pathname === "/actualites" && <ActualitesSidebarV2 {...sidebarProps} />}
            {pathname === "/centre_de_controle" && <ControlCenterSidebar {...sidebarProps} />}
            {pathname === "/documents" && <DocumentsSidebar
              activeCategory={sidebarProps?.activeCategory}
              onCategoryChange={sidebarProps?.onCategoryChange}
              activeSort={sidebarProps?.activeSort}
              onSortChange={sidebarProps?.onSortChange}
              activeFolder={sidebarProps?.activeFolder}
              onFolderChange={sidebarProps?.onFolderChange}
              documentsCount={sidebarProps?.documentsCount}
              documents={sidebarProps?.documents}
              categories={sidebarProps?.categories}
              folders={sidebarProps?.folders}
              folderTree={sidebarProps?.folderTree}
              onUploadSuccess={sidebarProps?.onUploadSuccess}
              onUploadClick={sidebarProps?.onUploadClick}
              onCreateFolder={sidebarProps?.onCreateFolder}
              onUpdateFolder={sidebarProps?.onUpdateFolder}
              onDeleteFolder={sidebarProps?.onDeleteFolder}
            />}
            {pathname === "/recrutement" && <RecrutementSidebar
              onFilterChange={sidebarProps?.onFilterChange}
              onSearchChange={sidebarProps?.onSearchChange}
              searchTerm={sidebarProps?.searchTerm}
              activeFilters={sidebarProps?.activeFilters}
            />}
            
            {/* Footer - toujours en bas, après les sidebars */}
            <Footer />
          </main>
        </div>

        {/* Modals globaux */}
        <PublicationModal 
          isOpen={showPublicationModal} 
          onClose={() => setShowPublicationModal(false)} 
        />
        <AnnouncementModal 
          isOpen={showAnnouncementModal} 
          onClose={() => setShowAnnouncementModal(false)} 
        />
        
        {/* Chatbot MAÏ */}
        <MaiChatbot />
      </div>
    </AuthGuard>
  )
}
