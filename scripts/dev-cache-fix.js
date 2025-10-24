#!/usr/bin/env node

/**
 * Script de correction des problèmes de cache en développement
 * Usage: node scripts/dev-cache-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [DEV_CACHE_FIX] Correction des problèmes de cache...');

// 1. Nettoyer le dossier .next
const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  console.log('🗑️ [DEV_CACHE_FIX] Suppression du dossier .next...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// 2. Nettoyer le cache npm
console.log('🗑️ [DEV_CACHE_FIX] Nettoyage du cache npm...');
const { execSync } = require('child_process');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ [DEV_CACHE_FIX] Erreur lors du nettoyage du cache npm:', error.message);
}

// 3. Créer un fichier de marqueur pour forcer le rechargement
const markerFile = path.join(__dirname, '..', 'public', 'cache-marker.txt');
const timestamp = new Date().toISOString();
fs.writeFileSync(markerFile, `Cache cleared at: ${timestamp}`);

console.log('✅ [DEV_CACHE_FIX] Cache nettoyé avec succès!');
console.log('📝 [DEV_CACHE_FIX] Marqueur de cache créé:', markerFile);
console.log('🚀 [DEV_CACHE_FIX] Vous pouvez maintenant relancer le serveur de développement');
