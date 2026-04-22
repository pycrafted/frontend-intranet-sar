"use client"

import { ReactNode } from "react"
import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/theme-provider"
import { ConfirmProvider } from "@/components/ui/confirm-dialog"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ConfirmProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ConfirmProvider>
    </ThemeProvider>
  )
}
