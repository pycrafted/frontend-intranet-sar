"use client"

import { useFloatingChats } from "@/contexts/FloatingChatContext"
import { useSocialNetwork } from "@/hooks/useSocialNetwork"
import { useState, useEffect } from "react"
import { Employee } from "@/hooks/useEmployees"

interface ChatButtonProps {
  employee: Employee
  className?: string
  children?: React.ReactNode
}

export function ChatButton({ employee, className, children }: ChatButtonProps) {
  const { openChat } = useFloatingChats()
  const { searchUsers, searchResults } = useSocialNetwork()
  const [searchingForEmployee, setSearchingForEmployee] = useState<Employee | null>(null)

  // Effet pour gérer la recherche d'utilisateur après que searchUsers soit appelé
  useEffect(() => {
    if (searchingForEmployee && searchResults.length > 0) {
      // Trouver l'utilisateur correspondant dans les résultats
      const user = searchResults.find(u => {
        const emailMatch = u.email?.toLowerCase() === searchingForEmployee.email.toLowerCase()
        const nameMatch = u.first_name && u.last_name && 
          `${u.first_name} ${u.last_name}`.toLowerCase() === searchingForEmployee.full_name.toLowerCase()
        return emailMatch || nameMatch
      })

      if (user) {
        openChat(
          user.id,
          user.full_name || user.username || searchingForEmployee.full_name,
          user.avatar_url || searchingForEmployee.avatar
        )
        setSearchingForEmployee(null)
      } else {
        console.warn(`Utilisateur non trouvé pour ${searchingForEmployee.full_name} (${searchingForEmployee.email})`)
        setSearchingForEmployee(null)
      }
    } else if (searchingForEmployee && searchResults.length === 0) {
      const timeoutId = setTimeout(() => {
        if (searchingForEmployee) {
          searchUsers(searchingForEmployee.full_name)
        }
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchResults, searchingForEmployee, openChat, searchUsers])

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setSearchingForEmployee(employee)
      await searchUsers(employee.email)
    } catch (error) {
      console.error("Erreur lors de l'ouverture du chat:", error)
      setSearchingForEmployee(null)
    }
  }

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  )
}

