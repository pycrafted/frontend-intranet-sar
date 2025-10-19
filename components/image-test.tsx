"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'

interface ImageTestProps {
  imageUrl: string
}

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: any
  timestamp: string
}

export function ImageTest({ imageUrl }: ImageTestProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setResults([])
    setImageLoaded(false)

    const tests: TestResult[] = []

    // Test 1: Vérifier l'URL
    tests.push({
      test: 'URL Validation',
      status: 'loading',
      message: 'Vérification de l\'URL...',
      timestamp: new Date().toISOString()
    })
    setResults([...tests])

    try {
      const url = new URL(imageUrl)
      tests[0] = {
        test: 'URL Validation',
        status: 'success',
        message: `URL valide: ${url.protocol}//${url.host}${url.pathname}`,
        details: {
          protocol: url.protocol,
          host: url.host,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash
        },
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      tests[0] = {
        test: 'URL Validation',
        status: 'error',
        message: `URL invalide: ${error.message}`,
        details: { error: error.message },
        timestamp: new Date().toISOString()
      }
    }
    setResults([...tests])

    // Test 2: Test HEAD
    tests.push({
      test: 'HEAD Request',
      status: 'loading',
      message: 'Test de la requête HEAD...',
      timestamp: new Date().toISOString()
    })
    setResults([...tests])

    try {
      const headResponse = await fetch(imageUrl, { 
        method: 'HEAD',
        mode: 'cors',
        credentials: 'omit'
      })
      
      tests[1] = {
        test: 'HEAD Request',
        status: headResponse.ok ? 'success' : 'error',
        message: `HEAD: ${headResponse.status} ${headResponse.statusText}`,
        details: {
          status: headResponse.status,
          statusText: headResponse.statusText,
          ok: headResponse.ok,
          headers: Object.fromEntries(headResponse.headers.entries()),
          url: headResponse.url,
          redirected: headResponse.redirected,
          type: headResponse.type
        },
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      tests[1] = {
        test: 'HEAD Request',
        status: 'error',
        message: `Erreur HEAD: ${error.message}`,
        details: { error: error.message, name: error.name },
        timestamp: new Date().toISOString()
      }
    }
    setResults([...tests])

    // Test 3: Test GET
    tests.push({
      test: 'GET Request',
      status: 'loading',
      message: 'Test de la requête GET...',
      timestamp: new Date().toISOString()
    })
    setResults([...tests])

    try {
      const getResponse = await fetch(imageUrl, { 
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      })
      
      tests[2] = {
        test: 'GET Request',
        status: getResponse.ok ? 'success' : 'error',
        message: `GET: ${getResponse.status} ${getResponse.statusText}`,
        details: {
          status: getResponse.status,
          statusText: getResponse.statusText,
          ok: getResponse.ok,
          contentType: getResponse.headers.get('content-type'),
          contentLength: getResponse.headers.get('content-length'),
          url: getResponse.url,
          redirected: getResponse.redirected,
          type: getResponse.type
        },
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      tests[2] = {
        test: 'GET Request',
        status: 'error',
        message: `Erreur GET: ${error.message}`,
        details: { error: error.message, name: error.name },
        timestamp: new Date().toISOString()
      }
    }
    setResults([...tests])

    // Test 4: Test de l'élément img
    tests.push({
      test: 'Image Element',
      status: 'loading',
      message: 'Test de l\'élément img...',
      timestamp: new Date().toISOString()
    })
    setResults([...tests])

    return new Promise<void>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        setImageLoaded(true)
        tests[3] = {
          test: 'Image Element',
          status: 'success',
          message: `Image chargée: ${img.naturalWidth}x${img.naturalHeight}px`,
          details: {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            crossOrigin: img.crossOrigin
          },
          timestamp: new Date().toISOString()
        }
        setResults([...tests])
        setIsRunning(false)
        resolve()
      }
      
      img.onerror = (error) => {
        tests[3] = {
          test: 'Image Element',
          status: 'error',
          message: `Erreur de chargement de l'image`,
          details: { error: error.type },
          timestamp: new Date().toISOString()
        }
        setResults([...tests])
        setIsRunning(false)
        resolve()
      }
      
      img.src = imageUrl
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">🧪 Test d'Image</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Lancer les tests
                </>
              )}
            </Button>
            <Button
              onClick={() => window.open(imageUrl, '_blank')}
              size="sm"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 break-all">
            <strong>URL:</strong> {imageUrl}
          </p>
          {imageLoaded && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Image chargée avec succès</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result, index) => (
            <Alert key={index} className={getStatusColor(result.status)}>
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {result.test}
                    </Badge>
                    <span className="text-sm font-medium">{result.message}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer hover:text-gray-600">
                        Détails techniques
                      </summary>
                      <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </Alert>
          ))}
          
          {results.length === 0 && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Cliquez sur "Lancer les tests" pour diagnostiquer le problème d'affichage de l'image.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}