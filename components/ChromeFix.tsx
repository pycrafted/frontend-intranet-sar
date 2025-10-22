"use client"

import { useEffect, useState } from 'react'

export function ChromeFix() {
  const [isChrome, setIsChrome] = useState(false)
  const [needsFix, setNeedsFix] = useState(false)

  useEffect(() => {
    // Détecter Chrome
    const isChromeBrowser = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
    setIsChrome(isChromeBrowser)

    if (isChromeBrowser) {
      // Vérifier si on a des erreurs de chunks
      const checkForChunkErrors = () => {
        const scriptTags = document.querySelectorAll('script[src*="_next/static/chunks/"]')
        let hasErrors = false

        scriptTags.forEach(script => {
          script.addEventListener('error', () => {
            console.warn('🚨 [CHROME_FIX] Erreur de chargement de chunk détectée:', script.src)
            hasErrors = true
            setNeedsFix(true)
          })
        })

        // Vérifier après 3 secondes si des chunks n'ont pas chargé
        setTimeout(() => {
          if (hasErrors) {
            console.log('🔧 [CHROME_FIX] Correction nécessaire détectée')
            setNeedsFix(true)
          }
        }, 3000)
      }

      checkForChunkErrors()

      // Nettoyer le cache si nécessaire
      const clearCacheIfNeeded = () => {
        if (localStorage.getItem('chrome-cache-cleared') !== 'true') {
          console.log('🧹 [CHROME_FIX] Nettoyage du cache Chrome...')
          
          // Nettoyer le cache du service worker
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
              registrations.forEach(registration => {
                registration.unregister()
              })
            })
          }

          // Nettoyer le cache
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              )
            })
          }

          localStorage.setItem('chrome-cache-cleared', 'true')
        }
      }

      clearCacheIfNeeded()
    }
  }, [])

  if (needsFix && isChrome) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Optimisation Chrome en cours...
          </h2>
          <p className="text-gray-600 mb-6">
            Nous optimisons l'affichage pour Chrome. Veuillez patienter.
          </p>
          <button
            onClick={() => {
              window.location.reload()
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    )
  }

  return null
}
