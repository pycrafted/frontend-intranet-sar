# =============================================================================
# Script de test pour le reverse proxy IIS -> Next.js
# =============================================================================

$nextjsPort = 5000
$httpsPort = 4321

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test du reverse proxy IIS -> Next.js" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Tester la connexion directe a Next.js
Write-Host "1. Test de connexion directe a Next.js (localhost:$nextjsPort)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$nextjsPort" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] Next.js repond correctement" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Content-Length: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "   [ERREUR] Next.js ne repond pas: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Assurez-vous que Next.js tourne: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# 2. Tester la connexion via IIS
Write-Host "2. Test de connexion via IIS (https://sar-intranet.sar.sn:$httpsPort)..." -ForegroundColor Yellow
try {
    # Ignorer les erreurs SSL pour le test local
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    $response = Invoke-WebRequest -Uri "https://sar-intranet.sar.sn:$httpsPort" -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] IIS reverse proxy fonctionne" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Content-Length: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "   [ERREUR] IIS reverse proxy ne fonctionne pas: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Verifier les logs IIS
Write-Host "3. Verification des logs IIS..." -ForegroundColor Yellow
$logPath = "C:\inetpub\logs\LogFiles\W3SVC*"
$latestLog = Get-ChildItem -Path $logPath -Recurse -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($latestLog) {
    Write-Host "   [INFO] Dernier log: $($latestLog.FullName)" -ForegroundColor Gray
    Write-Host "   [INFO] Derniere modification: $($latestLog.LastWriteTime)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Dernieres lignes du log:" -ForegroundColor Yellow
    Get-Content $latestLog.FullName -Tail 10 | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
} else {
    Write-Host "   [ATTENTION] Aucun log IIS trouve" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Fin du test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""




