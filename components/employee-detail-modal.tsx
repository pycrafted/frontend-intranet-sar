"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  Smartphone, 
  MessageCircle, 
  Building2, 
  User, 
  Calendar,
  MapPin,
  Clock,
  X
} from "lucide-react"
import { Employee } from "@/hooks/useEmployees"

interface EmployeeDetailModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
}

export function EmployeeDetailModal({ employee, isOpen, onClose }: EmployeeDetailModalProps) {
  if (!employee) return null

  const handleEmailClick = () => {
    window.location.href = `mailto:${employee.email}`
  }

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleChatClick = () => {
    // TODO: Implémenter la fonctionnalité de chat
    console.log(`Ouvrir le chat avec ${employee.full_name}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            Détails de l'employé
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec photo et infos principales */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-primary shadow-lg">
                <AvatarImage
                  src={employee.avatar || "/placeholder-user.jpg"}
                  alt={employee.full_name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              {employee.hierarchy_level === 1 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">👑</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {employee.full_name}
              </h2>
              <p className="text-lg text-muted-foreground mb-3">
                {employee.job_title}
              </p>
              <Badge variant="secondary" className="text-sm">
                {employee.main_direction_name}
              </Badge>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Informations de contact
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${employee.email}`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors break-all"
                  >
                    {employee.email}
                  </a>
                </div>
              </div>

              {/* Téléphone fixe */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Téléphone fixe</p>
                  {employee.phone_fixed ? (
                    <a
                      href={`tel:${employee.phone_fixed}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {employee.phone_fixed}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Non renseigné</span>
                  )}
                </div>
              </div>

              {/* Téléphone mobile */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Téléphone mobile</p>
                  {employee.phone_mobile ? (
                    <a
                      href={`tel:${employee.phone_mobile}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {employee.phone_mobile}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Non renseigné</span>
                  )}
                </div>
              </div>

              {/* Matricule */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Matricule</p>
                  <span className="text-sm font-medium text-foreground font-mono">
                    {employee.matricule}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Informations professionnelles
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Département */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Département</p>
                  <span className="text-sm font-medium text-foreground">
                    {employee.main_direction_name}
                  </span>
                </div>
              </div>

              {/* Date d'embauche */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Date d'embauche</p>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Horaire de travail */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Horaire de travail</p>
                  <span className="text-sm font-medium text-foreground">
                    {employee.work_schedule}
                  </span>
                </div>
              </div>

              {/* Niveau hiérarchique */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Niveau hiérarchique</p>
                  <span className="text-sm font-medium text-foreground">
                    Niveau {employee.hierarchy_level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleEmailClick}
              className="flex-1 gap-2"
              variant="outline"
            >
              <Mail className="w-4 h-4" />
              Envoyer un email
            </Button>
            <Button
              onClick={handleChatClick}
              className="flex-1 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Ouvrir le chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

