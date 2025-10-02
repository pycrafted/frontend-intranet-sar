"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Grid3X3,
  Newspaper,
  Users,
  FileText,
  MessageSquare,
  Info,
  Home,
  MessageCircle,
  Search,
  X,
  MoreHorizontal,
  Settings,
  Globe,
  ExternalLink,
  Building2,
  Mail,
  HardDrive,
  Calendar,
  FileText as DocsIcon,
  Table,
  Presentation,
  Video,
  Image,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

interface App {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  isNew?: boolean
  isExternal?: boolean
}

const apps: App[] = [
  // Applications SAR
  {
    id: "sar-website",
    name: "Site Web SAR",
    description: "Site officiel de la SAR",
    icon: <Globe className="h-8 w-8" />,
    href: "https://www.sar.sn/",
    color: "bg-gradient-to-br from-red-600 to-red-700",
    isExternal: true,
  },
  {
    id: "petrosen-website",
    name: "Groupe PETROSEN",
    description: "Société des Pétroles du Sénégal",
    icon: <Building2 className="h-8 w-8" />,
    href: "https://www.petrosen.sn/",
    color: "bg-gradient-to-br from-green-600 to-green-700",
    isExternal: true,
  },
  {
    id: "cos-petrogaz-linkedin",
    name: "COS PETROGAZ",
    description: "Comité d'orientation stratégique",
    icon: <Users className="h-8 w-8" />,
    href: "https://www.linkedin.com/company/cos-petrogaz/?originalSubdomain=sn",
    color: "bg-gradient-to-br from-indigo-600 to-indigo-700",
    isExternal: true,
  },
  {
    id: "mepm-website",
    name: "Ministère de l'Énergie",
    description: "Ministère de l'Énergie, du Pétrole et des Mines",
    icon: <Building2 className="h-8 w-8" />,
    href: "https://energie-mines.gouv.sn/",
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    isExternal: true,
  },
  
  // Applications Google
  {
    id: "gmail",
    name: "Gmail",
    description: "Messagerie électronique Google",
    icon: <Mail className="h-8 w-8" />,
    href: "https://mail.google.com",
    color: "bg-gradient-to-br from-red-500 to-red-600",
    isExternal: true,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Stockage et partage de fichiers",
    icon: <HardDrive className="h-8 w-8" />,
    href: "https://drive.google.com",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    isExternal: true,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Gestionnaire d'agenda",
    icon: <Calendar className="h-8 w-8" />,
    href: "https://calendar.google.com",
    color: "bg-gradient-to-br from-green-500 to-green-600",
    isExternal: true,
  },
  {
    id: "google-docs",
    name: "Google Docs",
    description: "Traitement de texte en ligne",
    icon: <DocsIcon className="h-8 w-8" />,
    href: "https://docs.google.com",
    color: "bg-gradient-to-br from-blue-400 to-blue-500",
    isExternal: true,
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Tableur en ligne",
    icon: <Table className="h-8 w-8" />,
    href: "https://sheets.google.com",
    color: "bg-gradient-to-br from-green-400 to-green-500",
    isExternal: true,
  },
  {
    id: "google-slides",
    name: "Google Slides",
    description: "Présentations en ligne",
    icon: <Presentation className="h-8 w-8" />,
    href: "https://slides.google.com",
    color: "bg-gradient-to-br from-yellow-500 to-orange-500",
    isExternal: true,
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Vidéoconférences",
    icon: <Video className="h-8 w-8" />,
    href: "https://meet.google.com",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    isExternal: true,
  },
  {
    id: "google-photos",
    name: "Google Photos",
    description: "Gestionnaire de photos",
    icon: <Image className="h-8 w-8" />,
    href: "https://photos.google.com",
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
    isExternal: true,
  },
]

export function AppLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isAuthenticated } = useAuth()

  // Séparer les applications SAR et Google
  const sarApps = apps.filter(app => 
    !app.id.startsWith('google-') && 
    !['gmail'].includes(app.id) &&
    (app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     app.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  const googleApps = apps.filter(app => 
    (app.id.startsWith('google-') || ['gmail'].includes(app.id)) &&
    (app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     app.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredApps = [...sarApps, ...googleApps]

  // Fonction pour gérer le clic sur une application Google
  const handleGoogleAppClick = (app: App) => {
    console.log('🔍 [APP_LAUNCHER] Clic sur application Google:', app.name)
    console.log('🔍 [APP_LAUNCHER] isAuthenticated:', isAuthenticated)
    console.log('🔍 [APP_LAUNCHER] user:', user)
    
    if (!isAuthenticated || !user) {
      console.log('❌ [APP_LAUNCHER] Utilisateur non authentifié')
      return
    }

    console.log('🔍 [APP_LAUNCHER] is_google_connected:', user.is_google_connected)
    console.log('🔍 [APP_LAUNCHER] google_email:', user.google_email)
    console.log('🔍 [APP_LAUNCHER] google_id:', user.google_id)
    console.log('🔍 [APP_LAUNCHER] email:', user.email)

    if (!user.is_google_connected) {
      console.log('❌ [APP_LAUNCHER] Utilisateur non connecté à Google')
      // Optionnel : afficher une notification pour connecter Google
      alert('Veuillez d\'abord connecter votre compte Google pour accéder à cette application.')
      return
    }

    // Ouvrir l'application Google avec l'email de l'utilisateur
    const googleEmail = user.google_email || user.email
    const appUrl = app.href + (googleEmail ? `?authuser=${encodeURIComponent(googleEmail)}` : '')
    
    console.log(`🔗 [APP_LAUNCHER] Ouverture de ${app.name} avec l'email: ${googleEmail}`)
    console.log(`🔗 [APP_LAUNCHER] URL finale: ${appUrl}`)
    window.open(appUrl, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-navbar-foreground hover:bg-navbar-foreground/10"
        >
          <Grid3X3 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[480px] sm:w-[600px] p-0">
        {/* Header avec style Chrome */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Grid3X3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Raccourcis SAR</h2>
                <p className="text-sm text-gray-500">Applications et ressources utiles</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Search Bar avec style Chrome */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Apps Grid avec style Chrome */}
          <div className="px-6 pb-6">
            {/* Section Applications SAR */}
            {sarApps.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  Applications SAR
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {sarApps.map((app) => {
                    const AppComponent = app.isExternal ? 'a' : Link
                    const appProps = app.isExternal 
                      ? { 
                          href: app.href, 
                          target: "_blank", 
                          rel: "noopener noreferrer",
                          className: "group",
                          onClick: () => setIsOpen(false)
                        }
                      : { 
                          href: app.href, 
                          className: "group",
                          onClick: () => setIsOpen(false)
                        }

                    return (
                      <AppComponent
                        key={app.id}
                        {...appProps}
                      >
                        <div className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group-hover:scale-105 cursor-pointer">
                          {/* App Icon avec style Chrome */}
                          <div className="relative mb-3">
                            <div className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                              {app.icon}
                            </div>
                            {app.isNew && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">N</span>
                              </div>
                            )}
                            {app.isExternal && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <ExternalLink className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* App Name */}
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] group-hover:text-blue-600 transition-colors">
                              {app.name}
                            </p>
                          </div>
                        </div>
                      </AppComponent>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Section Applications Google */}
            {googleApps.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  Applications Google
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {googleApps.map((app) => {
                    return (
                      <div
                        key={app.id}
                        className="group cursor-pointer"
                        onClick={() => handleGoogleAppClick(app)}
                      >
                        <div className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group-hover:scale-105">
                          {/* App Icon avec style Chrome */}
                          <div className="relative mb-3">
                            <div className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                              {app.icon}
                            </div>
                            {app.isNew && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">N</span>
                              </div>
                            )}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <ExternalLink className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          
                          {/* App Name */}
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] group-hover:text-blue-600 transition-colors">
                              {app.name}
                            </p>
                            {user?.is_google_connected && (
                              <p className="text-xs text-green-600 mt-1">
                                Connecté
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Message si aucun résultat */}
            {filteredApps.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Aucune ressource trouvée</p>
                <p className="text-gray-400 text-sm mt-1">Essayez avec d'autres mots-clés</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer avec style Chrome */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Gérer les raccourcis</span>
            </div>
            <div className="flex items-center gap-2">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Plus d'options</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
