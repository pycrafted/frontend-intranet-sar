#!/bin/bash

echo "🧪 ========== SUITE DE TESTS COMPLÈTE =========="
echo ""

echo "1️⃣ Test du parsing .env.local..."
node scripts/test-env-parsing.js
echo ""

echo "2️⃣ Test de l'API Chat..."
node scripts/test-chat-api.js
echo ""

echo "✅ Tests terminés!"

