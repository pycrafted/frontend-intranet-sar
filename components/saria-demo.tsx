"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MaiChatbot } from "./saria-chatbot"
import { MessageCircle, Bot, Sparkles } from "lucide-react"

export function SariaDemo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Démonstration du Chatbot SARIA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            SARIA est votre assistant virtuel intégré. Cliquez sur le bouton flottant en bas à droite 
            pour commencer une conversation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <MessageCircle className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Interface Moderne</h4>
                <p className="text-sm text-muted-foreground">
                  Design élégant et responsive
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Intelligence Artificielle</h4>
                <p className="text-sm text-muted-foreground">
                  Réponses intelligentes et contextuelles
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Toujours Disponible</h4>
                <p className="text-sm text-muted-foreground">
                  Assistance 24/7 pour vos questions
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Fonctionnalités</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Interface de chat intuitive avec animations fluides</li>
              <li>• Possibilité de réduire/agrandir la fenêtre de chat</li>
              <li>• Support du mode sombre/clair</li>
              <li>• Indicateur de frappe en temps réel</li>
              <li>• Design responsive pour mobile et desktop</li>
              <li>• Intégration parfaite avec l'UI existante</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Le chatbot est rendu ici */}
      <MaiChatbot />
    </div>
  )
}
