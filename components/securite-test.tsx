"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, AlertTriangle, Clock, Users } from "lucide-react"
import Link from "next/link"

export function SecuriteTest() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Test de la Page Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Fonctionnalités testées :</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  ✅ Page créée
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  ✅ Navigation ajoutée
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  ✅ Badge "Dev"
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  ✅ Coming Soon Card
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Navigation :</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Sidebar → Tableau de Bord → Sécurité</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Icône : Shield</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Badge : "Dev"</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Pages de test :</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/securite">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Page Sécurité
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Accueil
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Note de développement</h4>
                <p className="text-blue-700 text-sm">
                  La page "Sécurité" est maintenant disponible dans le sidebar principal sous "Tableau de Bord". 
                  Elle utilise le même pattern que la page "Réseau Social" avec un badge "Dev" pour indiquer 
                  qu'elle est en développement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





