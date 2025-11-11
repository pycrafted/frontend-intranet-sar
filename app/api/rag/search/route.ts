import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString()
  console.log(`\n🔍 [RAG API] ========== NOUVELLE REQUÊTE RAG [${requestId}] ==========`)
  
  try {
    const body = await request.json()
    // ⚠️ IMPORTANT: Utiliser getApiUrl() (avec /api) et non getApiBaseUrl() pour les endpoints MAI
    const BACKEND_URL = config.backend.apiUrl || 'http://localhost:8000'
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    
    console.log(`🔍 [RAG API] [${requestId}] Requête reçue:`, body.query?.substring(0, 100) + (body.query?.length > 100 ? '...' : ''))
    console.log(`🔍 [RAG API] [${requestId}] URL backend configurée:`, BACKEND_URL)
    console.log(`🔍 [RAG API] [${requestId}] API_BASE_URL (avec /api):`, API_BASE_URL)
    console.log(`🔍 [RAG API] [${requestId}] Variables d'env API_URL:`, process.env.NEXT_PUBLIC_API_URL || 'Non définie')
    
    // Construire l'URL complète avec /api/mai/...
    const hybridUrl = `${API_BASE_URL}/mai/hybrid-context/?question=${encodeURIComponent(body.query)}`
    console.log(`🔍 [RAG API] [${requestId}] URL complète de la requête:`, hybridUrl)
    
    // Utiliser le nouveau système hybride en priorité
    console.log(`🌐 [RAG API] [${requestId}] Appel au backend Django (hybride)...`)
    const hybridResponse = await fetch(hybridUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`📡 [RAG API] [${requestId}] Réponse hybride reçue - Status:`, hybridResponse.status, hybridResponse.statusText)
    console.log(`📡 [RAG API] [${requestId}] Headers de réponse:`, Object.fromEntries(hybridResponse.headers.entries()))

    if (hybridResponse.ok) {
      const hybridData = await hybridResponse.json()
      console.log(`✅ [RAG API] [${requestId}] Données hybrides reçues:`, {
        success: hybridData.success,
        method: hybridData.method,
        contextLength: hybridData.context?.length || 0,
        responseTime: hybridData.response_time_ms
      })
      
      if (hybridData.success) {
        console.log(`✅ [RAG API] [${requestId}] Contexte hybride trouvé via méthode:`, hybridData.method)
        console.log(`✅ [RAG API] [${requestId}] Contexte (premiers 200 chars):`, hybridData.context?.substring(0, 200) + (hybridData.context?.length > 200 ? '...' : ''))
        console.log(`✅ [RAG API] [${requestId}] ========== REQUÊTE RAG RÉUSSIE ==========\n`)
        
        return NextResponse.json({
          success: true,
          context: hybridData.context || '',
          query: hybridData.query || body.query || '',
          method: hybridData.method || 'hybrid',
          response_time_ms: hybridData.response_time_ms || 0
        })
      } else {
        console.log(`⚠️ [RAG API] [${requestId}] Réponse hybride OK mais success=false`)
      }
    } else {
      const errorText = await hybridResponse.text().catch(() => 'Impossible de lire la réponse')
      console.error(`❌ [RAG API] [${requestId}] Erreur réponse hybride:`, {
        status: hybridResponse.status,
        statusText: hybridResponse.statusText,
        body: errorText.substring(0, 500)
      })
    }
    
    // Fallback vers l'ancien système si le hybride échoue
    console.log(`🔄 [RAG API] [${requestId}] Fallback vers système heuristique...`)
    const fallbackUrl = `${API_BASE_URL}/mai/context/?question=${encodeURIComponent(body.query)}`
    console.log(`🔄 [RAG API] [${requestId}] URL fallback:`, fallbackUrl)
    
    const fallbackResponse = await fetch(fallbackUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`📡 [RAG API] [${requestId}] Réponse fallback reçue - Status:`, fallbackResponse.status, fallbackResponse.statusText)

    if (!fallbackResponse.ok) {
      const errorText = await fallbackResponse.text().catch(() => 'Impossible de lire la réponse')
      console.error(`❌ [RAG API] [${requestId}] Erreur API MAI backend (fallback):`, {
        status: fallbackResponse.status,
        statusText: fallbackResponse.statusText,
        body: errorText.substring(0, 500),
        backendUrl: BACKEND_URL,
        apiBaseUrl: API_BASE_URL,
        possibleCauses: [
          'Backend Django non démarré',
          'URL backend incorrecte',
          'Endpoint /mai/context/ n\'existe pas',
          'Problème de CORS',
          'Problème de réseau'
        ]
      })
      
      return NextResponse.json(
        { 
          success: false, 
          context: '',
          error: `Erreur lors de la récupération du contexte MAI (${fallbackResponse.status} ${fallbackResponse.statusText})`,
          details: `Backend URL: ${BACKEND_URL}, API Base URL: ${API_BASE_URL}`,
          type: 'backend_error'
        },
        { status: fallbackResponse.status }
      )
    }

    const fallbackData = await fallbackResponse.json()
    console.log(`✅ [RAG API] [${requestId}] Données fallback reçues:`, {
      success: fallbackData.success,
      contextLength: fallbackData.context?.length || 0
    })
    console.log(`✅ [RAG API] [${requestId}] ========== REQUÊTE RAG RÉUSSIE (FALLBACK) ==========\n`)
    
    return NextResponse.json({
      success: fallbackData.success || false,
      context: fallbackData.context || '',
      query: fallbackData.query || body.query || '',
      method: 'heuristic_fallback'
    })

  } catch (error) {
    console.error(`\n❌ [RAG API] [${requestId}] ========== ERREUR EXCEPTION ==========`)
    console.error(`❌ [RAG API] [${requestId}] Type d'erreur:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(`❌ [RAG API] [${requestId}] Message:`, error instanceof Error ? error.message : String(error))
    console.error(`❌ [RAG API] [${requestId}] Stack:`, error instanceof Error ? error.stack : 'N/A')
    console.error(`❌ [RAG API] [${requestId}] ======================================\n`)
    
    return NextResponse.json(
      { 
        success: false, 
        context: '',
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        type: 'server_error'
      },
      { status: 500 }
    )
  }
}