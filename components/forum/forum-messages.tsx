"use client"

import { useEffect, useRef } from "react"
import { ForumMessageItem } from "./forum-message-item"
import { StandardLoader } from "@/components/ui/standard-loader"
import type { ForumMessage } from "@/lib/types/forum"

interface ForumMessagesProps {
  messages: ForumMessage[]
  loading?: boolean
  currentUserId?: number
  onEdit?: (message: ForumMessage) => void
  onDelete?: (message: ForumMessage) => void
}

export function ForumMessages({
  messages,
  loading,
  currentUserId,
  onEdit,
  onDelete,
}: ForumMessagesProps) {
  const messagesBottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas quand de nouveaux messages arrivent (les plus récents sont en bas)
  useEffect(() => {
    if (messages.length > 0) {
      messagesBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <StandardLoader />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] gap-4 rounded-lg border-2 border-dashed border-border bg-card p-6 sm:p-8 md:p-12">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Aucun message</h3>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Soyez le premier à participer à cette discussion
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <ForumMessageItem
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <div ref={messagesBottomRef} />
    </div>
  )
}

