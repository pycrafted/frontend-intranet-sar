"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ForumPage as ForumPageComponent } from "@/components/forum/forum-page"

export default function ForumPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Attendre que le chargement de l'authentification soit terminé
    if (!isLoading && !isAuthenticated) {
      // Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification de l'authentification...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null
  }

  // Afficher la page forum uniquement si l'utilisateur est authentifié
  return (
    <LayoutWrapper>
      <ForumPageComponent />
    </LayoutWrapper>
  )
}

