# Script PowerShell pour corriger les problèmes de cache Next.js
# Usage: .\fix-cache.ps1

Write-Host "🧹 Nettoyage du cache Next.js..." -ForegroundColor Yellow

# Supprimer le dossier .next
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cache .next supprimé" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Aucun cache .next trouvé" -ForegroundColor Gray
}

# Supprimer node_modules/.cache si existe
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✅ Cache node_modules supprimé" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Nettoyage terminé !" -ForegroundColor Green
Write-Host "💡 Redémarrez le serveur avec : npm run dev" -ForegroundColor Cyan

