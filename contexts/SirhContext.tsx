"use client"

import { createContext, useContext, useEffect, useRef } from 'react'
import { useSirh } from '@/hooks/useSirh'
import { useAuth } from '@/hooks/useAuth'

type SirhContextType = ReturnType<typeof useSirh>

const SirhContext = createContext<SirhContextType | null>(null)

export function SirhProvider({ children }: { children: React.ReactNode }) {
  const sirh = useSirh()
  const { isAuthenticated } = useAuth()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !hasFetched.current) {
      hasFetched.current = true
      sirh.fetchAll()
      sirh.fetchReferentials()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return <SirhContext.Provider value={sirh}>{children}</SirhContext.Provider>
}

export function useSirhContext(): SirhContextType {
  const ctx = useContext(SirhContext)
  if (!ctx) throw new Error('useSirhContext must be used within SirhProvider')
  return ctx
}
