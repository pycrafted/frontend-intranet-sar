import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/accueil',
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
  const { pathname } = request.nextUrl
  
  // Vérifier si c'est une route API protégée
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Si c'est une route API protégée, vérifier l'authentification
  if (isProtectedApiRoute) {
    // Vérifier la présence du cookie de session
    const sessionCookie = request.cookies.get('sessionid')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Non authentifié' }, 
        { status: 401 }
      )
    }
  }
  
  // Si c'est une route protégée, rediriger vers login si pas authentifié
  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('sessionid')
    
    if (!sessionCookie) {
      // Rediriger vers la page de login avec l'URL de retour
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Les routes publiques sont accessibles à tous, connectés ou non
  // Pas de redirection automatique
  
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
