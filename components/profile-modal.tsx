"use client"

import { useState } from "react"
import { X, Mail, Phone, MapPin, Calendar, Building, Shield, Edit, Camera, Users, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { useUsers } from "@/hooks/useUsers"
import { EditProfileModal } from "@/components/edit-profile-modal"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth()
  const { users } = useUsers()
  const [showEditModal, setShowEditModal] = useState(false)
  
  if (!isOpen) return null

  // Données du profil utilisateur
  const profileData = {
    fullName: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Utilisateur",
    username: user?.username || "utilisateur",
    email: user?.email || "utilisateur@sar.sn",
    role: user?.is_superuser ? "Administrateur" : user?.is_staff ? "Staff" : "Employé",
    department: user?.department || "Non renseigné",
    position: user?.position || "Non renseigné",
    matricule: user?.matricule || "Non renseigné",
    manager: user?.manager_info ? `${user.manager_info.first_name} ${user.manager_info.last_name}` : "Aucun",
    managerPosition: user?.manager_info?.position || "",
    phone: user?.phone_number || "Non renseigné",
    officePhone: user?.office_phone || "Non renseigné",
    location: "Dakar, Sénégal",
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : "Non renseigné",
    lastLogin: user?.last_login ? new Date(user.last_login).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : "Jamais",
    status: "En ligne",
    avatar: user?.avatar_url || "/placeholder.svg?height=120&width=120"
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-semibold">
                  {profileData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white text-red-600 hover:bg-red-50 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold truncate">{profileData.fullName}</h2>
              <p className="text-red-100 text-lg">{profileData.position}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {profileData.role}
                </Badge>
                <div className="flex items-center space-x-1 text-red-100">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">{profileData.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Informations personnelles */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Mail className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profileData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Phone className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone personnel</p>
                    <p className="font-medium text-gray-900">{profileData.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Phone className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone fixe</p>
                    <p className="font-medium text-gray-900">{profileData.officePhone}</p>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Informations professionnelles</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Building className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Département</p>
                    <p className="font-medium text-gray-900">{profileData.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <User className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Matricule</p>
                    <p className="font-medium text-gray-900">{profileData.matricule}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Users className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Manager</p>
                    <div>
                      <p className="font-medium text-gray-900">{profileData.manager}</p>
                      {profileData.managerPosition && (
                        <p className="text-sm text-gray-500">{profileData.managerPosition}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dernière connexion</p>
                    <p className="font-medium text-gray-900">{profileData.lastLogin}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Modal d'édition du profil */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          // Le hook useAuth se mettra à jour automatiquement
        }}
      />
    </div>
  )
}
