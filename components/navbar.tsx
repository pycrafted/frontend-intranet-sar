"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, User, ChevronDown, Menu, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppLauncher } from "@/components/app-launcher"
import { ProfileModal } from "@/components/profile-modal"
import { useAuth, useLogout } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-api"

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { logout } = useLogout()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      // Redirection immédiate après déconnexion
      window.location.href = '/login'
    } catch (error) {
      // En cas d'erreur, rediriger quand même
      window.location.href = '/login'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navbar-border bg-navbar text-navbar-foreground shadow-enterprise">
      <div className="flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4 lg:px-6 navbar-mobile-optimized">
        {/* Left section - Responsive */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 min-w-0 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-navbar-foreground hover:bg-navbar-foreground/10 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 p-0"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0 hover:opacity-80 transition-opacity duration-200">
            <div className="flex h-6 w-8 sm:h-8 sm:w-12 lg:h-10 lg:w-16 items-center justify-center flex-shrink-0 navbar-logo">
              <img 
                src="/sarlogo.png" 
                alt="SAR Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold text-white truncate navbar-text">
                Société Africaine de Raffinage
              </h1>
            </div>
          </Link>
        </div>


        {/* Right section - Responsive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* App Launcher - hidden on very small screens */}
          <div className="hidden sm:block">
            <AppLauncher />
          </div>

          {/* Notifications - Responsive */}
          <Button variant="ghost" size="sm" className="relative text-navbar-foreground hover:bg-navbar-foreground/10 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 p-0">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 navbar-icon" />
            <Badge className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 rounded-full p-0 text-xs bg-destructive text-destructive-foreground flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* User menu - Responsive */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 sm:gap-2 text-white hover:bg-[#2a323d] flex-shrink-0 min-w-0 h-8 sm:h-10 px-1 sm:px-2"
                  style={{ backgroundColor: '#353E4B' }}
                >
                  <Avatar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0 navbar-avatar">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg?height=32&width=32"} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                      {authUtils.getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate text-white">
                      {authUtils.getFullName(user)}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">{authUtils.getFullName(user)}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Matricule: {user.matricule || 'N/A'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)} className="text-sm">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/login'}
              className="text-navbar-foreground hover:bg-navbar-foreground/10 h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Se connecter</span>
              <span className="sm:hidden">Login</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  )
}
