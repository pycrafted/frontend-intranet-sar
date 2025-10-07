"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info, Download } from "lucide-react"

type InfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  showDownloadIcon?: boolean
}

export function InfoModal({ 
  open, 
  onOpenChange, 
  title, 
  message, 
  actionLabel = "Compris", 
  onAction,
  showDownloadIcon = false 
}: InfoModalProps) {
  const handleAction = () => {
    if (onAction) {
      onAction()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        {showDownloadIcon && (
          <div className="flex items-center justify-center py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Download className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={handleAction} className="w-full">
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
