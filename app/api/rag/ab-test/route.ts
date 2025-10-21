import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

const BACKEND_URL = config.backend.apiUrl

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 A/B Test Frontend - Requête reçue:', body.query)
    
    // Appeler l'endpoint A/B test du backend
    const response = await fetch(`${BACKEND_URL}/mai/ab-test/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        test_mode: body.test_mode || 'both'
      })
    })
    
    console.log('📡 A/B Test Frontend - Réponse backend:', response.status, response.statusText)

    if (!response.ok) {
      console.error('Erreur API A/B test backend:', response.status, response.statusText)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors du test A/B'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: data.success || false,
      query: data.query || body.query || '',
      test_mode: data.test_mode || 'both',
      results: data.results || {},
      comparison: data.comparison || {},
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur route A/B test:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = searchParams.get('hours') || '24'
    
    console.log('📊 Monitoring Frontend - Récupération métriques:', hours, 'heures')
    
    // Appeler l'endpoint de monitoring du backend
    const response = await fetch(`${BACKEND_URL}/mai/monitoring/?hours=${hours}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('📡 Monitoring Frontend - Réponse backend:', response.status, response.statusText)

    if (!response.ok) {
      console.error('Erreur API monitoring backend:', response.status, response.statusText)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la récupération des métriques'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: data.success || false,
      period_hours: data.period_hours || parseInt(hours),
      performance: data.performance || {},
      vector_stats: data.vector_stats || {},
      timestamp: data.timestamp || new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur route monitoring:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}
