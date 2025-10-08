import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/',
  '/actualites',
  '/reseau-social',
  '/centre-de-controle',
  '/admin',
  '/profile',
  '/settings'
]

// Routes publiques (pas d'authentification requise)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/help',
  '/support'
]

// Routes API qui nécessitent une authentification
const protectedApiRoutes = [
  '/api/auth/current-user',
  '/api/auth/change-password',
  '/api/auth/upload-avatar',
  '/api/events',
  '/api/users',
  '/api/articles',
  '/api/menu'
]

export function middleware(request: NextRequest) {
  // AUTHENTIFICATION COMPLÈTEMENT DÉSACTIVÉE
  // Toutes les pages et API sont accessibles sans connexion
  console.log(`🌐 [MIDDLEWARE] Accès libre à: ${request.nextUrl.pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
