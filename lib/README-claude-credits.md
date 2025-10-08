# Guide de Résolution - Problème de Crédits Claude API

## 🚫 Problème Identifié

L'erreur suivante indique que les crédits du compte Anthropic sont épuisés :
```
Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.
```

## 💳 Solutions pour Recharger les Crédits

### Option 1 : Achat de Crédits (Recommandé)
1. **Connectez-vous** à votre compte Anthropic : https://console.anthropic.com/
2. **Allez dans** "Plans & Billing"
3. **Achetez des crédits** selon vos besoins :
   - $5 minimum pour commencer
   - $20 pour un usage modéré
   - $100+ pour un usage intensif

### Option 2 : Plan Pay-as-you-go
1. **Activez** le mode "Pay-as-you-go"
2. **Ajoutez** une méthode de paiement
3. **Configurez** des limites de dépenses

### Option 3 : Plan Pro (Recommandé pour la production)
1. **Souscrivez** au plan Pro ($20/mois)
2. **Bénéficiez** de :
   - Crédits inclus
   - Priorité d'accès
   - Support prioritaire
   - Limites plus élevées

## 🔧 Configuration Alternative

### Utiliser une Nouvelle Clé API
Si vous avez un autre compte avec des crédits :

1. **Générez** une nouvelle clé API
2. **Remplacez** la clé dans `frontend/lib/config.ts`
3. **Redémarrez** l'application

### Mode Développement avec Fallback
Le système est configuré pour fonctionner même sans Claude :

- **Réponses intelligentes** basées sur les mots-clés
- **Aide contextuelle** pour l'intranet
- **Messages d'erreur** informatifs

## 📊 Estimation des Coûts

### Modèle Claude 3.5 Sonnet
- **Entrée** : ~$3 par million de tokens
- **Sortie** : ~$15 par million de tokens

### Exemple de Coût par Conversation
- **Message court** (50 tokens) : ~$0.0001
- **Conversation moyenne** (500 tokens) : ~$0.001
- **Conversation longue** (2000 tokens) : ~$0.004

### Budget Recommandé
- **Développement** : $5-10
- **Test** : $10-20
- **Production légère** : $20-50/mois
- **Production intensive** : $100+/mois

## 🛠️ Solutions Temporaires

### 1. Mode Fallback Actif
Le chatbot fonctionne avec des réponses prédéfinies :
- ✅ Réponses aux salutations
- ✅ Aide contextuelle
- ✅ Guide des fonctionnalités
- ✅ Support de base

### 2. Désactiver Temporairement Claude
Pour désactiver complètement Claude et utiliser seulement le fallback :

```typescript
// Dans useSariaChatbot.ts, remplacer l'appel API par :
const fallbackResponse = findFallbackResponse(content.trim())
addMessage({
  content: fallbackResponse,
  sender: 'saria'
})
```

## 🔍 Vérification du Statut

### Vérifier les Crédits
1. **Console Anthropic** : https://console.anthropic.com/
2. **Section Billing** : Voir le solde restant
3. **Usage** : Consulter l'historique d'utilisation

### Tester la Connexion
```bash
# Test direct de l'API
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

## 📞 Support

### Anthropic Support
- **Email** : support@anthropic.com
- **Documentation** : https://docs.anthropic.com/
- **Status Page** : https://status.anthropic.com/

### Équipe Développement
- **Vérifier** les logs de l'application
- **Tester** avec une nouvelle clé API
- **Configurer** les limites de dépenses

## ✅ Checklist de Résolution

- [ ] Vérifier le solde des crédits Anthropic
- [ ] Acheter des crédits ou souscrire à un plan
- [ ] Vérifier la validité de la clé API
- [ ] Tester la connexion API
- [ ] Redémarrer l'application
- [ ] Tester le chatbot
- [ ] Configurer les alertes de crédits
- [ ] Documenter la solution

## 🎯 Recommandations

1. **Commencez petit** : $5-10 pour les tests
2. **Surveillez l'usage** : Configurez des alertes
3. **Optimisez les prompts** : Réduisez les tokens
4. **Utilisez le fallback** : Pour les cas d'urgence
5. **Planifiez le budget** : Selon l'usage prévu























