"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Menu,
  Users,
  FileText,
  Lightbulb,
  Shield,
  Calendar,
  Building2,
} from "lucide-react"

const controlCenterSections = [
  {
    title: "Gestion de l'Annuaire",
    items: [
      { name: "Employés", section: "employees", icon: Users },
      { name: "Départements", section: "departments", icon: Building2 },
    ],
  },
  {
    title: "Gestion des Utilisateurs",
    items: [
      { name: "Utilisateurs", section: "users", icon: Users },
    ],
  },
  {
    title: "Gestion de l'Organigramme",
    items: [
      { name: "Directions", section: "organigramme-directions", icon: Building2 },
      { name: "Agents", section: "organigramme-agents", icon: Users },
    ],
  },
  {
    title: "Gestion de Contenu",
    items: [
      { name: "Articles", section: "articles", icon: FileText },
      { name: "Idées", section: "ideas", icon: Lightbulb },
    ],
  },
  {
    title: "Services Internes",
    items: [
      { name: "Sécurité", section: "safety", icon: Shield },
      { name: "Menu", section: "menu", icon: Menu },
      { name: "Événements", section: "events", icon: Calendar },
    ],
  },
]

interface MobileControlCenterMenuProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function MobileControlCenterMenu({ 
  activeSection = "employees", 
  onSectionChange 
}: MobileControlCenterMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileSectionChange = (section: string) => {
    onSectionChange?.(section)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm px-4 py-2 -mx-2 xs:-mx-3 sm:-mx-4 md:-mx-5 lg:mx-0 mb-4">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5 mr-2" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0" style={{backgroundColor: "#344256"}}>
          <SheetHeader className="p-4 border-b border-slate-200/20">
            <SheetTitle className="text-white">Menu de navigation</SheetTitle>
          </SheetHeader>
          <div className="relative flex flex-col h-full">
            <nav className="flex-1 px-4 pt-4 space-y-8 overflow-y-auto">
              {controlCenterSections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <div className="px-3">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                      {section.title}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeSection === item.section
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleMobileSectionChange(item.section)}
                          className={cn(
                            "group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden w-full text-left",
                            isActive
                              ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-sm border border-blue-400/30"
                              : "text-slate-200 hover:bg-slate-500/20 hover:text-white hover:shadow-sm"
                          )}
                        >
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300",
                            "group-hover:opacity-100"
                          )} />
                          
                          <div className="flex items-center relative z-10">
                            <div className={cn(
                              "p-2 rounded-lg transition-all duration-300",
                              isActive 
                                ? "bg-blue-500/30 text-white shadow-sm" 
                                : "bg-slate-500/20 text-slate-300 group-hover:bg-blue-500/30 group-hover:text-white"
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="ml-3 font-medium">{item.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 relative z-10">
                            {isActive && (
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}








