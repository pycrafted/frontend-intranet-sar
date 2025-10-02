"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Smile, 
  Heart, 
  ThumbsUp, 
  Laugh, 
  Angry, 
  Sad,
  Wow,
  Clap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EmojiReaction {
  emoji: string
  count: number
  users: string[]
}

interface EmojiReactionsProps {
  reactions?: EmojiReaction[]
  onReaction?: (emoji: string) => void
  className?: string
}

const EMOJI_OPTIONS = [
  { emoji: "👍", label: "J'aime", icon: ThumbsUp },
  { emoji: "❤️", label: "J'adore", icon: Heart },
  { emoji: "😂", label: "Haha", icon: Laugh },
  { emoji: "😮", label: "Wow", icon: Wow },
  { emoji: "😢", label: "Triste", icon: Sad },
  { emoji: "😡", label: "En colère", icon: Angry },
  { emoji: "👏", label: "Bravo", icon: Clap },
  { emoji: "😊", label: "Content", icon: Smile },
]

export function EmojiReactions({ 
  reactions = [], 
  onReaction,
  className 
}: EmojiReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [userReactions, setUserReactions] = useState<{ [emoji: string]: boolean }>({})

  const handleReaction = (emoji: string) => {
    setUserReactions(prev => ({
      ...prev,
      [emoji]: !prev[emoji]
    }))
    onReaction?.(emoji)
    setShowPicker(false)
  }

  const getReactionCount = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji)
    const userReacted = userReactions[emoji]
    return (reaction?.count || 0) + (userReacted ? 1 : 0)
  }

  const hasUserReaction = (emoji: string) => {
    return userReactions[emoji] || false
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        {/* Afficher les réactions existantes */}
        {reactions.map((reaction) => {
          const count = getReactionCount(reaction.emoji)
          const userReacted = hasUserReaction(reaction.emoji)
          
          if (count === 0) return null

          return (
            <Button
              key={reaction.emoji}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(reaction.emoji)}
              className={cn(
                "h-8 px-2 py-1 rounded-full text-sm transition-all duration-200",
                userReacted
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <span className="text-base mr-1">{reaction.emoji}</span>
              <span className="font-medium">{count}</span>
            </Button>
          )
        })}

        {/* Bouton pour ajouter une réaction */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="h-8 w-8 p-0 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </div>

      {/* Picker d'emojis */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_OPTIONS.map((option) => {
              const Icon = option.icon
              const count = getReactionCount(option.emoji)
              const userReacted = hasUserReaction(option.emoji)
              
              return (
                <Button
                  key={option.emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(option.emoji)}
                  className={cn(
                    "h-10 w-10 p-0 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-200",
                    userReacted
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  )}
                  title={option.label}
                >
                  <span className="text-lg">{option.emoji}</span>
                  {count > 0 && (
                    <span className="text-xs font-medium">{count}</span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Overlay pour fermer le picker */}
      {showPicker && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

