"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Plus,
  Star,
  Mic,
  Image as ImageIcon,
  X,
  Menu,
} from "lucide-react"

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: number
  online?: boolean
}

interface Message {
  id: string
  text: string
  time: string
  sent: boolean
}

export function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<string>("1")
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Afficher uniquement le sidebar secondaire si largeur < 1024px
  useEffect(() => {
    const applyLayout = () => {
      const isSmall = window.innerWidth < 1024
      setIsSidebarOpen(isSmall)
    }
    applyLayout()
    window.addEventListener('resize', applyLayout)
    return () => window.removeEventListener('resize', applyLayout)
  }, [])

  const conversations: Conversation[] = [
    { id: "1", name: "Sophie Martin", avatar: "/sophie-martin.jpg", lastMessage: "Les slides sont parfaits, merci !", time: "13:53", unread: 2, online: true },
    { id: "2", name: "Marie Laurent", avatar: "/marie-laurent.jpg", lastMessage: "Réunion à 15h aujourd'hui", time: "12:30", online: true },
    { id: "3", name: "Thomas Dubois", avatar: "/thomas-dubois.jpg", lastMessage: "Peux-tu vérifier les specs ?", time: "11:15" },
    { id: "4", name: "Alex Bernard", avatar: "/alex-bernard.jpg", lastMessage: "Les nouveaux mockups sont prêts", time: "Hier" },
    { id: "5", name: "Julie Rousseau", avatar: "/julie-rousseau.jpg", lastMessage: "Sprint planning demain matin", time: "Hier" },
  ]

  const messages: Message[] = [
    { id: "1", text: "Salut ! Tu es disponible ?", time: "13:45", sent: false },
    { id: "2", text: "Oui, je suis là. Qu'est-ce qu'il y a ?", time: "13:47", sent: true },
    { id: "3", text: "J'ai terminé les slides pour la présentation de demain. Tu peux y jeter un œil ?", time: "13:48", sent: false },
    { id: "4", text: "Bien sûr ! Envoie-moi le lien.", time: "13:49", sent: true },
    { id: "5", text: "Les slides sont parfaits, merci ! Juste une petite modification sur la dernière diapo et ce sera bon.", time: "13:53", sent: false },
  ]

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (messageInput.trim()) setMessageInput("")
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
    // Si largeur < 1024px, rester sur le sidebar uniquement
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(true)
    } else {
      setIsSidebarOpen(false)
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedChat)

  // Important: ne pas utiliser h-screen pour laisser le footer visible
  return (
    <div
      className="flex w-full h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-10rem)] overflow-hidden rounded-lg border border-border"
      style={{ backgroundColor: '#fdfdfe', minHeight: 'calc(100svh - 10rem)' }}
    >
      {/* Sidebar conversations */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-10 w-full max-w-full sm:w-[320px] lg:w-[340px] border-r border-border flex flex-col shadow-sm transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ backgroundColor: '#fdfdfe' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Messages</h1>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted">
                <Plus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 bg-muted/30 border-0 focus-visible:bg-muted/50 transition-colors rounded-lg" />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery("")}> 
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="px-3 py-3 border-b border-border flex gap-2 overflow-x-auto scrollbar-thin">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer whitespace-nowrap">Tous</Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-muted whitespace-nowrap">Non lus</Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-muted whitespace-nowrap">
            <Star className="h-3 w-3 mr-1" /> Favoris
          </Badge>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectChat(conv.id)}
                className={`w-full p-3 sm:p-3.5 rounded-xl flex items-start gap-3 transition-all duration-200 ${selectedChat === conv.id ? "bg-primary/10 shadow-sm" : "hover:bg-muted/50"}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-11 w-11 sm:h-12 sm:w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={conv.avatar || "/placeholder.svg"} alt={conv.name} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                    <AvatarFallback className="text-sm font-medium">{conv.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  {conv.online && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-[2.5px] border-card shadow-sm" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm truncate">{conv.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-medium">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground truncate leading-relaxed">{conv.lastMessage}</p>
                    {conv.unread && <Badge className="flex-shrink-0 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center font-semibold shadow-sm">{conv.unread}</Badge>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-0 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main chat area */}
      <div className={`${isSidebarOpen ? 'hidden' : 'flex'} lg:flex flex-1 flex-col w-full lg:w-auto min-h-0`}>
        <div className="h-12 sm:h-14 md:h-16 border-b border-border px-2 sm:px-4 md:px-6 flex items-center justify-between" style={{ backgroundColor: '#fdfdfe' }}>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted lg:hidden flex-shrink-0" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative flex-shrink-0">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-background shadow-sm">
                <AvatarImage src={selectedConversation?.avatar || "/placeholder.svg"} alt={selectedConversation?.name} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                <AvatarFallback>{selectedConversation?.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {selectedConversation?.online && <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-[2.5px] border-card" />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-sm sm:text-base truncate">{selectedConversation?.name}</h2>
              <p className="text-xs text-muted-foreground font-medium">{selectedConversation?.online ? "En ligne" : "Hors ligne"}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted"><Phone className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted"><Video className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted hidden sm:flex"><Star className="h-5 w-5" /></Button>
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted"><MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ backgroundColor: '#fdfdfe', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          <div className="py-2 sm:py-4 md:py-5 px-2 sm:px-4 md:px-8 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center my-4 sm:my-6">
              <div className="bg-muted/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 rounded-full">
                <span className="text-xs font-medium text-muted-foreground">Aujourd'hui</span>
              </div>
            </div>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sent ? "justify-end" : "justify-start"} group`}>
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
                  {!message.sent && (
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mb-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                      <AvatarImage src={selectedConversation?.avatar || "/placeholder.svg"} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                      <AvatarFallback className="text-xs">{selectedConversation?.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`${message.sent ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-foreground shadow-sm border border-border/50"} rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 hover:shadow-lg`}>
                    <p className="text-sm sm:text-[15px] leading-relaxed">{message.text}</p>
                    <span className={`text-[11px] mt-1 sm:mt-1.5 block font-medium ${message.sent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{message.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border p-2 sm:p-3 md:p-5" style={{ backgroundColor: '#fdfdfe' }}>
          <div className="px-0 sm:px-3">
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="hidden sm:flex gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-lg hover:bg-muted flex-shrink-0"><Paperclip className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-lg hover:bg-muted flex-shrink-0"><ImageIcon className="h-5 w-5" /></Button>
              </div>
              <div className="flex-1 bg-muted/50 rounded-2xl px-2 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 flex items-center gap-2 sm:gap-3 border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-all">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Écrivez votre message..."
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm md:text-[15px] placeholder:text-muted-foreground/60"
                />
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-muted/50 flex-shrink-0"><Smile className="h-4 w-4 md:h-5 md:w-5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-muted/50 flex-shrink-0 hidden sm:flex"><Mic className="h-5 w-5" /></Button>
                </div>
              </div>
              <Button onClick={handleSendMessage} size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex-shrink-0">
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


