"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface ForumMessageFormProps {
  onSubmit: (content: string) => Promise<void>
  loading?: boolean
  placeholder?: string
}

export function ForumMessageForm({
  onSubmit,
  loading = false,
  placeholder = "Écrivez votre message...",
}: ForumMessageFormProps) {
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return

    try {
      await onSubmit(content.trim())
      setContent("")
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          className="min-h-[140px] w-full rounded-xl border border-border/60 bg-white px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:shadow-md resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground italic">Soyez respectueux et constructif dans vos échanges</p>
        <Button
          type="submit"
          disabled={!content.trim() || loading}
          className="flex items-center gap-2.5 rounded-xl bg-[#344256] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#3d4d63] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="h-4 w-4" />
          Publier ma réponse
        </Button>
      </div>
    </form>
  )
}

