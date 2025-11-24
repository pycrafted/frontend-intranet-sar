#!/usr/bin/env node
/**
 * Script de démarrage du serveur de développement Next.js
 * Lit le port depuis NEXT_PUBLIC_FRONTEND_PORT dans .env.local
 */
require('dotenv').config({ path: '.env.local' })

const { spawn } = require('child_process')
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

if (!frontendUrl) {
  console.error('❌ Erreur: NEXT_PUBLIC_FRONTEND_URL n\'est pas définie dans .env.local')
  process.exit(1)
}

// Extraire le port depuis l'URL
let port
try {
  const url = new URL(frontendUrl)
  port = url.port || (url.protocol === 'https:' ? '443' : '3000')
} catch (error) {
  console.error('❌ Erreur: NEXT_PUBLIC_FRONTEND_URL doit être une URL valide (ex: http://127.0.0.1:3000 ou http://example.com:3000)')
  process.exit(1)
}

console.log(`🚀 Démarrage du serveur Next.js...`)
console.log(`   URL configurée: ${frontendUrl}`)
console.log(`   Port: ${port}\n`)

const nextProcess = spawn('next', ['dev', '-p', port], {
  stdio: 'inherit',
  shell: true
})

nextProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error)
  process.exit(1)
})

nextProcess.on('exit', (code) => {
  process.exit(code || 0)
})

