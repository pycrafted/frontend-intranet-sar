# =============================================================================
# Script pour mettre a jour le web.config avec le bon port Next.js
# =============================================================================
# Ce script met a jour le web.config pour pointer vers localhost:3000
# au lieu de localhost:3001 car IIS utilise le port 3001
# =============================================================================

$webConfigPath = "C:\intranet\frontend-intranet-sar\web.config"

if (-not (Test-Path $webConfigPath)) {
    Write-Host "[ERREUR] Le fichier web.config n'existe pas: $webConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "Mise a jour du web.config..." -ForegroundColor Yellow

# Lire le contenu actuel
$content = Get-Content $webConfigPath -Raw

# Remplacer les ports dans l'URL de rewrite (3001 ou 3000 -> 4321)
$newContent = $content -replace 'http://localhost:3001/', 'http://localhost:4321/'
$newContent = $newContent -replace 'http://localhost:3000/', 'http://localhost:4321/'

if ($content -eq $newContent) {
    Write-Host "[INFO] Le web.config utilise deja le port 4321" -ForegroundColor Gray
} else {
    # Sauvegarder le nouveau contenu
    $newContent | Out-File -FilePath $webConfigPath -Encoding UTF8 -Force
    Write-Host "[OK] web.config mis a jour: port 4321" -ForegroundColor Green
}

# Afficher le contenu pour verification
Write-Host "`nContenu du web.config:" -ForegroundColor Cyan
Get-Content $webConfigPath

Write-Host "`n[OK] Mise a jour terminee !" -ForegroundColor Green
Write-Host "Redemarrez IIS avec: iisreset" -ForegroundColor Yellow

