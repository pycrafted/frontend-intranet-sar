# =============================================================================
# Script pour activer les variables ARR de maniere directe
# =============================================================================

Import-Module WebAdministration

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Activation directe des variables ARR" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier si ARR est installe
Write-Host "Verification du module ARR..." -ForegroundColor Yellow
$arrModule = Get-WebGlobalModule | Where-Object { $_.Name -like "*ARR*" -or $_.Name -like "*ApplicationRequestRouting*" }
if (-not $arrModule) {
    Write-Host "   [ERREUR] Module ARR n'est pas installe !" -ForegroundColor Red
    Write-Host "   Installez-le depuis: https://www.iis.net/downloads/microsoft/application-request-routing" -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    Write-Host "   [OK] Module ARR installe" -ForegroundColor Green
    Write-Host ""
}

# Methode 1: Utiliser Add-WebConfigurationProperty avec le bon chemin
Write-Host "Methode 1: Activation via WebConfigurationProperty..." -ForegroundColor Yellow
$requiredVars = @("HTTP_X_FORWARDED_PROTO", "HTTP_X_FORWARDED_HOST", "HTTP_X_FORWARDED_PORT")

foreach ($var in $requiredVars) {
    try {
        # Verifier si la variable existe
        $allowedVars = Get-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
        $exists = $allowedVars | Where-Object { $_.name -eq $var }
        
        if (-not $exists) {
            Write-Host "   Ajout de '$var'..." -ForegroundColor Yellow
            # Utiliser le PSPath explicite
            Add-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/rewrite/allowedServerVariables" -Name "." -Value @{name=$var} -ErrorAction Stop
            Write-Host "   [OK] Variable '$var' ajoutee" -ForegroundColor Green
        } else {
            Write-Host "   [INFO] Variable '$var' existe deja" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   [ERREUR] Impossible d'ajouter '$var': $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Methode 2: Utiliser appcmd.exe (methode alternative)
Write-Host "Methode 2: Activation via appcmd.exe..." -ForegroundColor Yellow
$appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"

if (Test-Path $appcmdPath) {
    foreach ($var in $requiredVars) {
        try {
            Write-Host "   Activation de '$var' via appcmd..." -ForegroundColor Yellow
            $result = & $appcmdPath set config -section:system.webServer/rewrite/allowedServerVariables /+"[name='$var']" /commit:apphost 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   [OK] Variable '$var' activee via appcmd" -ForegroundColor Green
            } else {
                Write-Host "   [ATTENTION] appcmd a retourne un code: $LASTEXITCODE" -ForegroundColor Yellow
                Write-Host "   Sortie: $result" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   [ERREUR] Erreur avec appcmd pour '$var': $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   [ATTENTION] appcmd.exe introuvable" -ForegroundColor Yellow
}

Write-Host ""

# Redemarrer IIS
Write-Host "Redemarrage d'IIS..." -ForegroundColor Yellow
iisreset /noforce
Start-Sleep -Seconds 5
Write-Host "[OK] IIS redemarre" -ForegroundColor Green
Write-Host ""

# Verification finale avec un delai
Write-Host "Verification finale (apres 3 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$allowedVars = Get-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
$allActive = $true

Write-Host ""
foreach ($var in $requiredVars) {
    $exists = $allowedVars | Where-Object { $_.name -eq $var }
    if ($exists) {
        Write-Host "   [OK] Variable '$var' activee" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] Variable '$var' non activee !" -ForegroundColor Red
        $allActive = $false
    }
}

Write-Host ""
if ($allActive) {
    Write-Host "[OK] Toutes les variables ARR sont activees !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "  1. Verifiez que Next.js tourne: npm run dev" -ForegroundColor White
    Write-Host "  2. Verifiez que le site IIS est demarre: Start-Website -Name 'sar-frontend'" -ForegroundColor White
    Write-Host "  3. Testez: https://sar-intranet.sar.sn:4321" -ForegroundColor White
} else {
    Write-Host "[ERREUR] Certaines variables ne sont pas activees" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez de les activer manuellement via:" -ForegroundColor Yellow
    Write-Host "  1. Ouvrez IIS Manager" -ForegroundColor White
    Write-Host "  2. Selectionnez le serveur (racine)" -ForegroundColor White
    Write-Host "  3. Double-cliquez sur 'URL Rewrite'" -ForegroundColor White
    Write-Host "  4. Cliquez sur 'View Server Variables' dans le panneau de droite" -ForegroundColor White
    Write-Host "  5. Ajoutez les variables: HTTP_X_FORWARDED_PROTO, HTTP_X_FORWARDED_HOST, HTTP_X_FORWARDED_PORT" -ForegroundColor White
}
Write-Host ""




