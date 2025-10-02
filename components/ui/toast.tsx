"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export interface ToastProps {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto-close
    const autoCloseTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(autoCloseTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300) // Attendre l'animation de sortie
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        p-4 rounded-lg border shadow-lg
        ${getStyles()}
      `}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="font-medium">{title}</div>
            {description && (
              <div className="text-sm mt-1 opacity-90">{description}</div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook pour gérer les toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: (id) => setToasts(prev => prev.filter(t => t.id !== id))
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const success = (title: string, description?: string) => 
    addToast({ title, description, type: 'success' })
  
  const error = (title: string, description?: string) => 
    addToast({ title, description, type: 'error' })
  
  const warning = (title: string, description?: string) => 
    addToast({ title, description, type: 'warning' })
  
  const info = (title: string, description?: string) => 
    addToast({ title, description, type: 'info' })

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}

// Composant pour afficher tous les toasts
export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}


