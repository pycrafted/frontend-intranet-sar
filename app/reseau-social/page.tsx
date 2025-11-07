"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ChatInterface } from "@/components/social/chat-interface"
import { AuthGuard } from "@/components/auth-guard"

interface ReseauSocialPageProps {
  isMainSidebarCollapsed?: boolean
}

function ReseauSocialPageContent({ isMainSidebarCollapsed = true }: ReseauSocialPageProps) {
  // Calculer la largeur du sidebar : 64px (rétracté) ou 256px (développé)
  const sidebarWidth = isMainSidebarCollapsed ? 64 : 256

  return (
    <>
      {/* Conteneur qui prend tout l'espace disponible, collé à tous les bords */}
      {/* 0 padding, 0 margin - collé au sidebar à gauche, navbar en haut, footer en bas, bord droit à droite */}
      {/* Position fixe pour être collé à tous les bords, en tenant compte du sidebar */}
      {/* Navbar: h-16 (4rem = 64px), Footer: py-3 (1.5rem = 24px) + contenu texte (environ 1rem = 16px) = ~40px */}
      <div 
        className="fixed m-0 p-0 flex flex-col"
        style={{
          top: '64px', // h-16 du navbar (4rem = 64px)
          bottom: '48px', // Collé au bord bas moins la hauteur du footer (fixe)
          left: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : '0px',
          right: '0px',
          transition: 'left 0.3s ease-in-out'
        }}
      >
        <ChatInterface />
      </div>
    </>
  )
}

export default function ReseauSocialPage() {
  return (
    <AuthGuard redirectTo="/">
      <LayoutWrapper>
        <ReseauSocialPageContent />
      </LayoutWrapper>
    </AuthGuard>
  )
}
