"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { PageLoader } from "@/components/ui/loader"

interface NavigationWithLoaderProps {
  children: React.ReactNode
}

export function NavigationWithLoader({ children }: NavigationWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPath, setLoadingPath] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Arrêter le loader quand la page est chargée
    setIsLoading(false)
    setLoadingPath(null)
  }, [pathname])

  // Intercepter les clics sur les liens
  const handleLinkClick = (href: string, onClick?: () => void) => {
    if (href !== pathname && !href.startsWith('#')) {
      setIsLoading(true)
      setLoadingPath(href)
    }
    if (onClick) onClick()
  }

  return (
    <>
      {children}
      {isLoading && <PageLoader />}
    </>
  )
}

// Hook pour utiliser le loader dans les composants
export function useNavigationLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const navigateWithLoader = (href: string) => {
    setIsLoading(true)
    router.push(href)
  }

  return {
    isLoading,
    navigateWithLoader,
    setIsLoading
  }
}
