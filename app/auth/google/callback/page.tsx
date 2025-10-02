"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage(`Erreur d'authentification: ${error}`)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('Code d\'autorisation manquant')
          return
        }

        // Envoyer le code à notre backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/google/callback/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (response.ok) {
          const data = await response.json()
          setStatus('success')
          setMessage('Connexion Google réussie !')
          
          // Rediriger vers l'accueil après 2 secondes
          setTimeout(() => {
            router.push('/accueil')
          }, 2000)
        } else {
          const errorData = await response.json()
          setStatus('error')
          setMessage(`Erreur backend: ${errorData.error || 'Erreur inconnue'}`)
        }
      } catch (error) {
        console.error('Erreur lors du traitement du callback:', error)
        setStatus('error')
        setMessage('Erreur lors du traitement de la connexion')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Connexion Google
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Traitement de votre connexion...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-gray-500">Redirection en cours...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <p className="text-red-600 font-medium">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



