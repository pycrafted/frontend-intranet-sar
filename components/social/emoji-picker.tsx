"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Smile, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
}

// Catégories d'émojis les plus utilisés
const EMOJI_CATEGORIES = {
  "Sourires": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
  "Émotions": ["😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓"],
  "Gestes": ["🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"],
  "Cœurs": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  "Main": ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "🤙", "👌", "🤏", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐", "✋", "🖖", "👏", "🙌", "🤲", "🤝", "🙏"],
  "Personnes": ["👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👮", "👷", "💂", "🕵️", "👩‍⚕️", "👨‍⚕️", "👩‍🌾", "👨‍🌾", "👩‍🍳", "👨‍🍳", "👩‍🎓", "👨‍🎓", "👩‍🎤", "👨‍🎤", "👩‍🏫", "👨‍🏫", "👩‍🏭", "👨‍🏭", "👩‍💻", "👨‍💻"],
  "Activités": ["🎮", "🕹️", "🎯", "🎲", "🧩", "♟️", "🎨", "🧵", "🧶", "🎤", "🎧", "🎺", "🎷", "🥁", "🎸", "🎹", "🎻", "🎬", "🏹", "🎣", "🥊", "🥋", "🎽", "⛸️", "🛷", "🎿", "⛷️", "🏂"],
  "Nourriture": ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨"],
  "Objets": ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️"],
  "Symboles": ["✅", "❌", "⭐", "🌟", "💫", "✨", "💯", "🔥", "💥", "💢", "💤", "💨", "👁️", "👀", "🧠", "🗣️", "👤", "👥", "🗨️", "💬", "💭", "🗯️", "💞", "💓", "💗", "💕", "💖", "💝"],
}

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>("Sourires")
  const pickerRef = useRef<HTMLDivElement>(null)

  // Fermer le picker quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    // Ne pas fermer automatiquement pour permettre d'insérer plusieurs émojis
  }

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-muted/50 flex-shrink-0"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Sélecteur d'émojis"
      >
        <Smile className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay pour fermer au clic extérieur */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 w-80 h-96 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col">
            {/* En-tête avec catégories */}
            <div className="flex items-center justify-between p-2 border-b border-border">
              <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    className="text-xs px-2 py-1 h-auto whitespace-nowrap flex-shrink-0"
                    onClick={() => setSelectedCategory(category as keyof typeof EMOJI_CATEGORIES)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 ml-2"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Grille d'émojis */}
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_CATEGORIES[selectedCategory].map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-xl hover:bg-muted transition-colors hover:scale-110"
                    onClick={() => handleEmojiClick(emoji)}
                    aria-label={`Émoji ${emoji}`}
                    title={emoji}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

