"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { FORUM_SORT_OPTIONS } from "@/lib/types/forum"
import type { ForumFilters } from "@/lib/types/forum"

interface ForumFiltersProps {
  filters: ForumFilters
  onFiltersChange: (filters: ForumFilters) => void
}

export function ForumFiltersComponent({ filters, onFiltersChange }: ForumFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    })
  }

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sort: value as ForumFilters["sort"],
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      sort: "recent",
    })
  }

  const hasActiveFilters = filters.search || filters.sort !== "recent"

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un forum..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tri */}
      <Select
        value={filters.sort || "recent"}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          {FORUM_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Bouton pour effacer les filtres */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="icon"
          onClick={clearFilters}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

