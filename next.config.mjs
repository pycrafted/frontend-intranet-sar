/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs de Google Fonts pendant le build
  experimental: {
    serverComponentsExternalPackages: ['@radix-ui/react-avatar'],
  },
  // Configuration pour autoriser les origines de développement
  // Utilise NEXT_PUBLIC_FRONTEND_URL depuis les variables d'environnement (.env.local)
  allowedDevOrigins: process.env.NEXT_PUBLIC_FRONTEND_URL 
    ? [process.env.NEXT_PUBLIC_FRONTEND_URL]
    : process.env.NODE_ENV === 'development'
      ? [
          // En développement uniquement, utilise localhost si FRONTEND_URL n'est pas défini
          'http://localhost:3001',
        ]
      : [],
  images: {
    unoptimized: true,
    // Domaines configurés via variables d'environnement
    domains: process.env.NEXT_PUBLIC_IMAGE_DOMAINS 
      ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(',')
      : process.env.NEXT_PUBLIC_API_URL
        ? (() => {
            try {
              const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''));
              return [apiUrl.hostname];
            } catch {
              return [];
            }
          })()
        : [],
    remotePatterns: [
      // Configuration dynamique basée sur NEXT_PUBLIC_API_URL depuis .env.local
      ...(process.env.NEXT_PUBLIC_API_URL 
        ? (() => {
            try {
              const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''));
              return [{
                protocol: apiUrl.protocol.replace(':', ''),
                hostname: apiUrl.hostname,
                port: apiUrl.port || '',
                pathname: '/media/**',
              }];
            } catch {
              return [];
            }
          })()
        : []
      ),
    ],
  },
  // Configuration optimisée pour Vercel et Chrome
  experimental: {
    serverComponentsExternalPackages: ['@radix-ui/react-avatar'],
  },
  // Optimisations pour Chrome
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimiser les chunks pour Chrome
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  // Headers de sécurité et compatibilité Chrome
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Headers de cache adaptés à l'environnement
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'public, max-age=0, must-revalidate' 
              : 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'public, max-age=0, must-revalidate' 
              : 'public, max-age=86400, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
