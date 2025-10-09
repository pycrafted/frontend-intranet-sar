"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface ComingSoonCardProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function ComingSoonCard({ icon: Icon, title, description = "Cette fonctionnalité sera bientôt disponible" }: ComingSoonCardProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          En développement
        </Badge>
      </CardContent>
    </Card>
  )
}
