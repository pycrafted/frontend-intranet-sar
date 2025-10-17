"use client"

import { useState, useEffect } from 'react'

interface DebugInfo {
  timestamp: string
  environment: string
  apiUrl: string
  testResults: {
    agents: { status: number; ok: boolean; error?: string }
    directions: { status: number; ok: boolean; error?: string }
    tree: { status: number; ok: boolean; error?: string }
  }
}

export function OrganigrammeDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testApiEndpoint = async (endpoint: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const fullUrl = `${apiUrl}/organigramme${endpoint}`
    
    try {
      console.log(`🧪 [DEBUG] Test de l'endpoint: ${fullUrl}`)
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      })
      
      const result = {
        status: response.status,
        ok: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      }
      
      console.log(`🧪 [DEBUG] Résultat pour ${endpoint}:`, result)
      return result
    } catch (error) {
      const result = {
        status: 0,
        ok: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
      console.error(`🧪 [DEBUG] Erreur pour ${endpoint}:`, error)
      return result
    }
  }

  const runDebugTest = async () => {
    setIsLoading(true)
    console.log('🧪 [DEBUG] Début du test de débogage de l\'organigramme')
    
    const timestamp = new Date().toISOString()
    const environment = process.env.NODE_ENV || 'unknown'
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    
    // Tester les trois endpoints principaux
    const [agentsResult, directionsResult, treeResult] = await Promise.all([
      testApiEndpoint('/agents/'),
      testApiEndpoint('/directions/'),
      testApiEndpoint('/tree/')
    ])
    
    const debugData: DebugInfo = {
      timestamp,
      environment,
      apiUrl,
      testResults: {
        agents: agentsResult,
        directions: directionsResult,
        tree: treeResult
      }
    }
    
    setDebugInfo(debugData)
    setIsLoading(false)
    
    console.log('🧪 [DEBUG] Test terminé:', debugData)
  }

  useEffect(() => {
    runDebugTest()
  }, [])

  if (isLoading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🧪 Test de débogage de l'organigramme</h3>
        <p className="text-yellow-700">Test en cours...</p>
      </div>
    )
  }

  if (!debugInfo) {
    return null
  }

  const allTestsPassed = Object.values(debugInfo.testResults).every(result => result.ok)

  return (
    <div className={`p-4 border rounded-lg ${allTestsPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <h3 className="text-lg font-semibold mb-4">
        🧪 Test de débogage de l'organigramme
        {allTestsPassed ? ' ✅' : ' ❌'}
      </h3>
      
      <div className="space-y-3">
        <div>
          <strong>Timestamp:</strong> {debugInfo.timestamp}
        </div>
        <div>
          <strong>Environment:</strong> {debugInfo.environment}
        </div>
        <div>
          <strong>API URL:</strong> {debugInfo.apiUrl}
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Résultats des tests:</h4>
          <div className="space-y-2">
            {Object.entries(debugInfo.testResults).map(([endpoint, result]) => (
              <div key={endpoint} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${result.ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-mono text-sm">
                  {endpoint}: {result.ok ? 'OK' : `Erreur ${result.status}`}
                </span>
                {result.error && (
                  <span className="text-red-600 text-sm">({result.error})</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={runDebugTest}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Relancer le test
        </button>
      </div>
    </div>
  )
}
