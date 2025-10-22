// Script de nettoyage du cache pour Chrome
// Ce script nettoie le cache et force le rechargement des ressources

(function() {
  'use strict';
  
  console.log('🧹 [CACHE_CLEANER] Nettoyage du cache Chrome...');
  
  // Nettoyer le cache du service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        console.log('🗑️ [CACHE_CLEANER] Suppression du service worker:', registration.scope);
        registration.unregister();
      }
    });
  }
  
  // Nettoyer le cache du navigateur
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('🗑️ [CACHE_CLEANER] Suppression du cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('✅ [CACHE_CLEANER] Tous les caches ont été supprimés');
    });
  }
  
  // Nettoyer le localStorage et sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ [CACHE_CLEANER] Storage nettoyé');
  } catch (e) {
    console.warn('⚠️ [CACHE_CLEANER] Erreur lors du nettoyage du storage:', e);
  }
  
  // Forcer le rechargement des ressources
  if (window.location.search.indexOf('reload=true') === -1) {
    console.log('🔄 [CACHE_CLEANER] Rechargement de la page...');
    window.location.href = window.location.href + (window.location.search ? '&' : '?') + 'reload=true';
  }
})();
