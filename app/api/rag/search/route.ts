import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

const BACKEND_URL = config.backend.apiUrl

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 MAI Frontend - Requête reçue:', body.query)
    console.log('🌐 MAI Frontend - URL backend:', `${BACKEND_URL}/api/mai/context/`)
    
    // Appeler l'API MAI du backend Django
    const response = await fetch(`${BACKEND_URL}/api/mai/context/?question=${encodeURIComponent(body.query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('📡 MAI Frontend - Réponse backend:', response.status, response.statusText)

    if (!response.ok) {
      console.error('Erreur API MAI backend:', response.status, response.statusText)
      return NextResponse.json(
        { 
          success: false, 
          context: '',
          error: 'Erreur lors de la récupération du contexte MAI'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: data.success || false,
      context: data.context || '',
      query: data.query || body.query || ''
    })

  } catch (error) {
    console.error('Erreur route MAI:', error)
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