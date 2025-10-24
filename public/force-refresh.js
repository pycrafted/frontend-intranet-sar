// Script de forçage du rafraîchissement pour le développement
// Ce script force le rechargement des ressources sans cache

(function() {
  'use strict';
  
  console.log('🔄 [FORCE_REFRESH] Forçage du rafraîchissement...');
  
  // Vérifier si nous sommes en mode développement
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isDev) {
    // En développement, forcer le rechargement sans cache
    const timestamp = new Date().getTime();
    const currentUrl = new URL(window.location.href);
    
    // Ajouter un paramètre de timestamp pour forcer le rechargement
    currentUrl.searchParams.set('_t', timestamp.toString());
    
    // Nettoyer le cache du navigateur
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('🗑️ [FORCE_REFRESH] Suppression du cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('✅ [FORCE_REFRESH] Cache nettoyé, rechargement...');
        window.location.href = currentUrl.toString();
      });
    } else {
      // Si pas de support des caches, recharger directement
      window.location.href = currentUrl.toString();
    }
  } else {
    // En production, utiliser le cache normal
    console.log('📦 [FORCE_REFRESH] Mode production - cache normal');
  }
})();
