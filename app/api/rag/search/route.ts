import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

const BACKEND_URL = config.backend.apiUrl

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 MAI Frontend - Requête hybride reçue:', body.query)
    
    // Utiliser le nouveau système hybride en priorité
    const hybridResponse = await fetch(`${BACKEND_URL}/mai/hybrid-context/?question=${encodeURIComponent(body.query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('📡 MAI Frontend - Réponse hybride:', hybridResponse.status, hybridResponse.statusText)

    if (hybridResponse.ok) {
      const hybridData = await hybridResponse.json()
      
      if (hybridData.success) {
        console.log('✅ MAI Frontend - Contexte hybride trouvé:', hybridData.method)
        return NextResponse.json({
          success: true,
          context: hybridData.context || '',
          query: hybridData.query || body.query || '',
          method: hybridData.method || 'hybrid',
          response_time_ms: hybridData.response_time_ms || 0
        })
      }
    }
    
    // Fallback vers l'ancien système si le hybride échoue
    console.log('🔄 MAI Frontend - Fallback vers système heuristique')
    const fallbackResponse = await fetch(`${BACKEND_URL}/mai/context/?question=${encodeURIComponent(body.query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('📡 MAI Frontend - Réponse fallback:', fallbackResponse.status, fallbackResponse.statusText)

    if (!fallbackResponse.ok) {
      console.error('Erreur API MAI backend (fallback):', fallbackResponse.status, fallbackResponse.statusText)
      return NextResponse.json(
        { 
          success: false, 
          context: '',
          error: 'Erreur lors de la récupération du contexte MAI'
        },
        { status: fallbackResponse.status }
      )
    }

    const fallbackData = await fallbackResponse.json()
    
    return NextResponse.json({
      success: fallbackData.success || false,
      context: fallbackData.context || '',
      query: fallbackData.query || body.query || '',
      method: 'heuristic_fallback'
    })

  } catch (error) {
    console.error('Erreur route MAI hybride:', error)
    return NextResponse.json(
      { 
        success: false, 
        context: '',
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}