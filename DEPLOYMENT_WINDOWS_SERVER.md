# Guide de Déploiement sur Windows Server

Ce document explique comment déployer l'application intranet SAR sur un serveur Windows.

## Problèmes Identifiés et Solutions

### 1. Erreur 403 - Authentification

**Problème :** Les cookies de session ne sont pas envoyés, causant des erreurs 403.

**Solution :** Configuration CORS côté backend Django nécessaire.

#### Configuration Django (settings.py)

```python
# Configuration CORS pour Windows Server
CORS_ALLOWED_ORIGINS = [
    "http://sar-intranet.sar.sn:3000",
    "http://sar-intranet:3000",
    "http://localhost:3000",
]

# Autoriser l'envoi de cookies
CORS_ALLOW_CREDENTIALS = True

# Headers autorisés
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Configuration des cookies de session
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False  # Mettre à True si vous utilisez HTTPS
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_NAME = 'sessionid'
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = False  # Mettre à True si vous utilisez HTTPS

# Autoriser le domaine pour les cookies
SESSION_COOKIE_DOMAIN = None  # Laisser None pour le même domaine
```

### 2. Erreur DNS - sar-intrant.sar.sn

**Problème :** Faute de frappe dans l'URL (`sar-intrant` au lieu de `sar-intranet`).

**Solution :** Vérifier le fichier `.env` et utiliser l'URL correcte :
```
NEXT_PUBLIC_API_URL=http://sar-intranet.sar.sn:8000/api
```

⚠️ **IMPORTANT :** Vérifiez toujours que l'URL ne contient pas de fautes de frappe.

### 3. Avertissement CORS Next.js

**Problème :** Next.js détecte des requêtes cross-origin pour les ressources `/_next/*`.

**Solution :** Déjà corrigé dans `next.config.mjs` avec `allowedDevOrigins`.

### 4. Configuration des Variables d'Environnement

Créez un fichier `.env` (ou `.env.local`) à la racine du projet frontend avec :

```env
# Configuration Backend
NEXT_PUBLIC_API_URL=http://sar-intranet.sar.sn:8000/api

# Configuration Claude API
NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key_here

# Configuration NextAuth
NEXTAUTH_URL=http://sar-intranet.sar.sn:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Étapes de Déploiement

### 1. Préparer l'Environnement

```bash
# Installer les dépendances
npm install

# Vérifier la configuration
cat .env
```

### 2. Build de Production

```bash
npm run build
```

### 3. Démarrer le Serveur

```bash
# Mode production
npm start

# Ou avec PM2 pour la gestion des processus
pm2 start npm --name "intranet-frontend" -- start
```

### 4. Configuration du Backend Django

Assurez-vous que le backend Django est configuré avec :

1. **CORS activé** (voir configuration ci-dessus)
2. **Port 8000** accessible
3. **Cookies de session** correctement configurés

### 5. Vérifications

- [ ] L'application frontend est accessible sur `http://sar-intranet.sar.sn:3000`
- [ ] Le backend est accessible sur `http://sar-intranet.sar.sn:8000/api`
- [ ] Les cookies sont envoyés avec les requêtes (vérifier dans les DevTools)
- [ ] Aucune erreur CORS dans la console
- [ ] L'authentification fonctionne

## Dépannage

### Les cookies ne sont pas envoyés

1. Vérifier la configuration CORS côté backend
2. Vérifier que `credentials: 'include'` est présent dans les requêtes
3. Vérifier les paramètres des cookies dans Django (`SESSION_COOKIE_SAMESITE`, etc.)

### Erreurs 403

1. Vérifier que le backend accepte les requêtes depuis le frontend
2. Vérifier la configuration CSRF
3. Vérifier que le token CSRF est récupéré avant les requêtes POST/PUT/DELETE

### Erreurs de résolution DNS

1. Vérifier l'URL dans `.env` (pas de fautes de frappe)
2. Vérifier que le serveur est accessible depuis le navigateur
3. Vérifier la configuration DNS/hosts

## Support

En cas de problème, vérifier :
1. Les logs du navigateur (Console et Network)
2. Les logs du serveur Next.js
3. Les logs du backend Django


