"use client"

import { Search, HelpCircle, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type DocumentsHeaderProps = {
  searchTerm?: string
  onSearchChange?: (value: string) => void
}

export function DocumentsHeader({ searchTerm = "", onSearchChange }: DocumentsHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Documents</h1>
        </div>

        <div className="mx-auto flex w-full max-w-2xl items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher dans les documents"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-secondary pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
