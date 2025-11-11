# Scripts de Test

## Scripts disponibles

### 1. `test-env-parsing.js`
Teste le parsing du fichier `.env.local` pour vérifier que les variables d'environnement sont correctement lues.

**Usage:**
```bash
node scripts/test-env-parsing.js
```

### 2. `test-chat-api.js`
Teste une seule requête à l'API `/api/chat`.

**Usage:**
```bash
node scripts/test-chat-api.js
```

### 3. `test-chat-multiple.js`
Teste plusieurs requêtes à l'API `/api/chat` avec différents messages.

**Usage:**
```bash
node scripts/test-chat-multiple.js
```

## Problème résolu

Le fichier `.env.local` était encodé en **UTF-16** (avec BOM) au lieu d'**UTF-8**. Cela causait des problèmes de parsing car chaque caractère était suivi d'un byte null (`\u0000`).

**Solution:** Le fichier a été converti en UTF-8 et le code de parsing a été amélioré pour gérer le BOM UTF-8 si présent.

## Résultat

✅ Tous les tests passent avec succès
✅ Les variables d'environnement sont correctement parsées
✅ L'API `/api/chat` fonctionne correctement
✅ Les clés API Claude sont correctement chargées


