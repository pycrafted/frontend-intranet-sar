import { useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number // Maximum number of entries (default: 100)
}

export function useCache<T = any>(options: CacheOptions = {}) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    if (!entry) return null

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      return null
    }

    return entry.data
  }, [])

  const set = useCallback((key: string, data: T, customTtl?: number): void => {
    // Nettoyer le cache si nécessaire
    if (cache.current.size >= maxSize) {
      const oldestKey = cache.current.keys().next().value
      if (oldestKey) {
        cache.current.delete(oldestKey)
      }
    }

    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    })
  }, [ttl, maxSize])

  const clear = useCallback((): void => {
    cache.current.clear()
  }, [])

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    if (!entry) return false

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      return false
    }

    return true
  }, [])

  const size = useCallback((): number => {
    return cache.current.size
  }, [])

  return {
    get,
    set,
    clear,
    has,
    size
  }
}

// Hook pour les requêtes avec cache
export function useCachedFetch<T = any>(options: CacheOptions = {}) {
  const cache = useCache<T>(options)

  const fetchWithCache = useCallback(async (
    url: string,
    fetchOptions?: RequestInit,
    cacheKey?: string
  ): Promise<T> => {
    const key = cacheKey || url

    // Vérifier le cache d'abord
    const cachedData = cache.get(key)
    if (cachedData) {
      console.log(`🎯 [CACHE] Données récupérées du cache: ${key}`)
      return cachedData
    }

    // Faire la requête
    console.log(`🌐 [CACHE] Requête réseau: ${key}`)
    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const data = await response.json()
    
    // Mettre en cache
    cache.set(key, data)
    
    return data
  }, [cache])

  return {
    fetchWithCache,
    cache
  }
}
