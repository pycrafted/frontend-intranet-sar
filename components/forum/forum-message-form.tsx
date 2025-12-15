"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { EmojiPicker } from "@/components/social/emoji-picker"

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
    // Accepter les messages même s'ils ne contiennent que des emojis
    if (!content || content.length === 0 || loading) return

    try {
      await onSubmit(content)
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

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji)
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
          className="min-h-[140px] w-full rounded-xl border border-border/60 bg-white px-5 py-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:shadow-md resize-none"
        />
        <div className="absolute bottom-3 right-3 z-50">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/70 italic">Soyez respectueux et constructif dans vos échanges</p>
        <Button
          type="submit"
          disabled={!content || content.length === 0 || loading}
          className="flex items-center gap-2.5 rounded-xl bg-white text-[#344256] px-6 py-3 text-sm font-medium shadow-md transition-all hover:bg-white/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Publier ma réponse
        </Button>
      </div>
    </form>
  )
}

