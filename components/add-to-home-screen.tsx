"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Smartphone, Share2, Plus, Home } from 'lucide-react'
import { detectBrowser } from '@/lib/browser-detection'

const STORAGE_KEY = 'add-to-home-screen-prompted'
const STORAGE_KEY_DISMISSED = 'add-to-home-screen-dismissed'

interface AddToHomeScreenProps {
  delay?: number // Délai en millisecondes avant d'afficher le prompt (défaut: 3 secondes)
}

// Type pour l'événement BeforeInstallPrompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function AddToHomeScreen({ delay = 3000 }: AddToHomeScreenProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Capturer l'événement BeforeInstallPrompt (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      // Vérifier si on est en mode standalone (app installée)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return true
      }

      // Vérifier si on est dans un navigateur mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (!isMobile) {
        setDeviceType('desktop')
        return false
      }

      // Détecter le type d'appareil
      const userAgent = navigator.userAgent
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        setDeviceType('ios')
      } else if (/Android/i.test(userAgent)) {
        setDeviceType('android')
      }

      return false
    }

    if (checkIfInstalled()) {
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    // Vérifier si l'utilisateur a déjà été invité ou a fermé le prompt
    const hasBeenPrompted = localStorage.getItem(STORAGE_KEY) === 'true'
    const hasDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED) === 'true'

    // Ne pas afficher si déjà invité ou si l'utilisateur a fermé
    if (hasBeenPrompted || hasDismissed) {
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    // Attendre le délai avant d'afficher
    const timer = setTimeout(() => {
      setShowPrompt(true)
      // Marquer comme invité
      localStorage.setItem(STORAGE_KEY, 'true')
    }, delay)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [delay])

  const handleClose = () => {
    setShowPrompt(false)
    localStorage.setItem(STORAGE_KEY_DISMISSED, 'true')
  }

  const handleInstall = async () => {
    // Pour Android Chrome, déclencher le prompt natif si disponible
    if (deferredPrompt && deviceType === 'android') {
      try {
        // Afficher le prompt natif
        await deferredPrompt.prompt()
        
        // Attendre la réponse de l'utilisateur
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          console.log('✅ Utilisateur a accepté l\'installation')
        } else {
          console.log('❌ Utilisateur a refusé l\'installation')
        }
        
        // Réinitialiser le prompt
        setDeferredPrompt(null)
        handleClose()
      } catch (error) {
        console.error('Erreur lors de l\'affichage du prompt:', error)
        handleClose()
      }
    } else {
      // Pour iOS et autres, on ferme juste le dialog
      // L'utilisateur doit suivre les instructions manuelles
      handleClose()
    }
  }

  // Ne rien afficher si déjà installé ou sur desktop
  if (isInstalled || deviceType === 'desktop' || !showPrompt) {
    return null
  }

  const getInstructions = () => {
    if (deviceType === 'ios') {
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Share2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Étape 1</p>
              <p className="text-sm text-blue-700">Appuyez sur le bouton <strong>Partager</strong> en bas de l'écran</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Plus className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Étape 2</p>
              <p className="text-sm text-blue-700">Sélectionnez <strong>"Sur l'écran d'accueil"</strong></p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Home className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Étape 3</p>
              <p className="text-sm text-blue-700">Appuyez sur <strong>"Ajouter"</strong> pour confirmer</p>
            </div>
          </div>
        </div>
      )
    } else if (deviceType === 'android') {
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Share2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Option 1 : Menu du navigateur</p>
              <p className="text-sm text-green-700">Ouvrez le menu (⋮) en haut à droite, puis sélectionnez <strong>"Ajouter à l'écran d'accueil"</strong></p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Smartphone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Option 2 : Prompt automatique</p>
              <p className="text-sm text-green-700">Si une notification apparaît, appuyez sur <strong>"Installer"</strong> ou <strong>"Ajouter"</strong></p>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            Cette fonctionnalité est disponible uniquement sur les appareils mobiles (iPhone, iPad, Android).
          </p>
        </div>
      )
    }
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Ajouter à l'écran d'accueil</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Ajoutez l'Intranet SAR à votre écran d'accueil pour un accès rapide et une expérience optimale.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {getInstructions()}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Plus tard
          </Button>
          <Button
            onClick={handleInstall}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Home className="h-4 w-4 mr-2" />
            {deferredPrompt && deviceType === 'android' ? 'Installer maintenant' : 'J\'ai compris'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

