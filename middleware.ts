import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/',
  '/actualites',
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
  
  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
  
    // Si la route est protégée, vérifier l'authentification
    if (isProtectedRoute) {
      // Vérifier la présence du cookie de session
      const sessionCookie = request.cookies.get('sessionid')
      
      // Pour les routes protégées, on peut laisser passer si elles ont leur propre logique
      // ou rediriger vers /login si nécessaire
      if (!sessionCookie && pathname !== '/') {
        // Pour les routes protégées, on peut rediriger vers /login
        // ou laisser la page gérer la redirection côté client
        // Pour l'instant, on laisse passer et la page gérera la redirection
      }
    }
  
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
