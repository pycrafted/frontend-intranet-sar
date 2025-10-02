"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { StandardLoader } from "@/components/ui/standard-loader"
import {
  MessageSquare,
  Users,
  Plus,
  Search,
  Send,
  Bot,
  Pin,
  Heart,
  MessageCircle,
  Clock,
  User,
  Hash,
} from "lucide-react"

const forumTopics = [
  {
    id: 1,
    title: "Nouvelle procédure de sécurité - Vos questions",
    author: "Mariama Cissé",
    authorRole: "Ingénieure Sécurité",
    category: "Sécurité",
    replies: 23,
    views: 156,
    lastActivity: "2024-03-15T14:30:00",
    isPinned: true,
    likes: 12,
    avatar: "/placeholder.svg?height=40&width=40&text=MC",
    initials: "MC",
  },
  {
    id: 2,
    title: "Retour d'expérience - Formation IA",
    author: "Ousmane Diouf",
    authorRole: "Responsable IT",
    category: "Formation",
    replies: 18,
    views: 89,
    lastActivity: "2024-03-15T11:20:00",
    isPinned: false,
    likes: 8,
    avatar: "/placeholder.svg?height=40&width=40&text=OD",
    initials: "OD",
  },
  {
    id: 3,
    title: "Idées pour améliorer la cantine",
    author: "Bineta Thiam",
    authorRole: "Responsable Communication",
    category: "Général",
    replies: 45,
    views: 234,
    lastActivity: "2024-03-15T09:15:00",
    isPinned: false,
    likes: 15,
    avatar: "/placeholder.svg?height=40&width=40&text=BT",
    initials: "BT",
  },
  {
    id: 4,
    title: "Partage de bonnes pratiques - Maintenance",
    author: "Mamadou Sy",
    authorRole: "Technicien Maintenance",
    category: "Technique",
    replies: 12,
    views: 67,
    lastActivity: "2024-03-14T16:45:00",
    isPinned: false,
    likes: 6,
    avatar: "/placeholder.svg?height=40&width=40&text=MS",
    initials: "MS",
  },
  {
    id: 5,
    title: "Événement team building - Propositions",
    author: "Ndeye Diop",
    authorRole: "Assistante RH",
    category: "RH",
    replies: 31,
    views: 178,
    lastActivity: "2024-03-14T13:20:00",
    isPinned: false,
    likes: 22,
    avatar: "/placeholder.svg?height=40&width=40&text=ND",
    initials: "ND",
  },
]

const chatGroups = [
  {
    id: 1,
    name: "Équipe Production",
    members: 12,
    lastMessage: "Rapport de production prêt",
    lastMessageTime: "14:30",
    unreadCount: 3,
    isActive: true,
  },
  {
    id: 2,
    name: "IT Support",
    members: 8,
    lastMessage: "Mise à jour système programmée",
    lastMessageTime: "13:45",
    unreadCount: 0,
    isActive: false,
  },
  {
    id: 3,
    name: "Sécurité & Qualité",
    members: 15,
    lastMessage: "Nouvelle checklist disponible",
    lastMessageTime: "12:20",
    unreadCount: 1,
    isActive: false,
  },
  {
    id: 4,
    name: "Direction Générale",
    members: 5,
    lastMessage: "Réunion reportée à demain",
    lastMessageTime: "11:15",
    unreadCount: 0,
    isActive: false,
  },
  {
    id: 5,
    name: "Ressources Humaines",
    members: 6,
    lastMessage: "Formulaire congés mis à jour",
    lastMessageTime: "10:30",
    unreadCount: 2,
    isActive: false,
  },
]

const chatMessages = [
  {
    id: 1,
    author: "Moussa Ba",
    message: "Bonjour à tous, le rapport de production de mars est maintenant disponible.",
    time: "14:30",
    avatar: "/placeholder.svg?height=32&width=32&text=MB",
    initials: "MB",
  },
  {
    id: 2,
    author: "Cheikh Ndao",
    message: "Merci Moussa ! J'ai quelques questions sur les chiffres de la section 3.",
    time: "14:32",
    avatar: "/placeholder.svg?height=32&width=32&text=CN",
    initials: "CN",
  },
  {
    id: 3,
    author: "Aïssatou Ndiaye",
    message: "Les indicateurs qualité sont excellents ce mois-ci. Félicitations à toute l'équipe !",
    time: "14:35",
    avatar: "/placeholder.svg?height=32&width=32&text=AN",
    initials: "AN",
  },
]

export default function ReseauSocialPage() {
  const [activeTab, setActiveTab] = useState("forum")
  const [newMessage, setNewMessage] = useState("")
  const [selectedGroup, setSelectedGroup] = useState(chatGroups[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Il y a quelques minutes"
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else {
      return date.toLocaleDateString("fr-FR")
    }
  }

  // Gestion du loading et des erreurs
  if (isLoading || error) {
    return (
      <LayoutWrapper>
        <StandardLoader 
          title={isLoading ? "Chargement du réseau social..." : undefined}
          message={isLoading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
          error={error}
          showRetry={!!error}
          onRetry={() => window.location.reload()}
        />
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Réseau social d'entreprise</h1>
            <p className="text-muted-foreground">Échangez et collaborez avec vos collègues</p>
          </div>
          {/* Bouton de test pour le loader */}
          <Button 
            variant="outline" 
            onClick={() => {
              setIsLoading(true)
              setTimeout(() => setIsLoading(false), 3000)
            }}
          >
            Test Loader
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Forum de discussion
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groupes de chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
              {/* Forum Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Catégories</span>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {[
                        { name: "Sécurité", count: 12, color: "bg-red-500", isActive: true },
                        { name: "Formation", count: 8, color: "bg-blue-500", isActive: false },
                        { name: "Technique", count: 15, color: "bg-green-500", isActive: false },
                        { name: "RH", count: 6, color: "bg-purple-500", isActive: false },
                        { name: "Général", count: 23, color: "bg-orange-500", isActive: false },
                      ].map((category, index) => (
                        <div
                          key={index}
                          className={`p-3 cursor-pointer transition-colors ${
                            category.isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{category.name}</h4>
                              <p className="text-xs opacity-75">{category.count} sujets</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Forum Topics Area */}
              <div className="lg:col-span-3">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="Rechercher dans les discussions..." className="pl-10" />
                      </div>
                      <Button className="ml-4 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nouveau sujet
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Topics List */}
                  <CardContent className="flex-1 p-0 overflow-y-auto">
                    <div className="space-y-0">
                      {forumTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={topic.avatar || "/placeholder.svg"} alt={topic.author} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {topic.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {topic.isPinned && <Pin className="h-3 w-3 text-primary" />}
                                    <h3 className="font-semibold text-sm hover:text-primary">{topic.title}</h3>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                    <span>{topic.author}</span>
                                    <span>•</span>
                                    <span>{topic.authorRole}</span>
                                    <span>•</span>
                                    <span>{formatTime(topic.lastActivity)}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <MessageCircle className="h-3 w-3" />
                                        <span>{topic.replies}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Heart className="h-3 w-3" />
                                        <span>{topic.likes}</span>
                                      </div>
                                      <span>{topic.views} vues</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
              {/* Chat Groups Sidebar */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Groupes</span>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {chatGroups.map((group) => (
                        <div
                          key={group.id}
                          className={`p-3 cursor-pointer transition-colors ${
                            selectedGroup.id === group.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedGroup(group)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{group.name}</h4>
                            {group.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-xs h-5 w-5 p-0 flex items-center justify-center"
                              >
                                {group.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs opacity-75 truncate">{group.lastMessage}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-60">{group.members} membres</span>
                            <span className="text-xs opacity-60">{group.lastMessageTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Messages Area */}
              <div className="lg:col-span-3">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          {selectedGroup.name}
                        </CardTitle>
                        <CardDescription>{selectedGroup.members} membres</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Voir les membres
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.author} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {message.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.author}</span>
                              <span className="text-xs text-muted-foreground">{message.time}</span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[40px] max-h-[120px]"
                        rows={1}
                      />
                      <Button size="sm" className="self-end">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Chatbot Assistant Placeholder */}
            <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Assistant IA SAR</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Bientôt disponible : un assistant intelligent pour vous aider à trouver des informations, répondre à
                    vos questions et faciliter vos échanges.
                  </p>
                </div>
                <Button variant="outline" disabled>
                  <Bot className="h-4 w-4 mr-2" />
                  Discuter avec l'assistant
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}
