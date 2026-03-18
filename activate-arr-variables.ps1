# =============================================================================
# Script pour activer les variables serveur ARR (Application Request Routing)
# =============================================================================

Import-Module WebAdministration

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Activation des variables serveur ARR" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier si ARR est installe
Write-Host "Verification du module ARR..." -ForegroundColor Yellow
$arrModule = Get-WebGlobalModule | Where-Object { $_.Name -like "*ARR*" -or $_.Name -like "*ApplicationRequestRouting*" }
if (-not $arrModule) {
    Write-Host "   [ATTENTION] Module ARR peut ne pas etre installe" -ForegroundColor Yellow
    Write-Host "   Installez-le depuis: https://www.iis.net/downloads/microsoft/application-request-routing" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "   [OK] Module ARR installe" -ForegroundColor Green
    Write-Host ""
}

# Activer les variables serveur ARR
Write-Host "Activation des variables serveur ARR..." -ForegroundColor Yellow
$requiredVars = @("HTTP_X_FORWARDED_PROTO", "HTTP_X_FORWARDED_HOST", "HTTP_X_FORWARDED_PORT", "HTTP_X_REAL_IP")
$varsAdded = $false

foreach ($var in $requiredVars) {
    try {
        # Verifier si la variable existe
        $allowedVars = Get-WebConfigurationProperty -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
        $exists = $allowedVars | Where-Object { $_.name -eq $var }
        
        if (-not $exists) {
            # Ajouter la variable
            Add-WebConfigurationProperty -Filter "system.webServer/rewrite/allowedServerVariables" -Name "." -Value @{name=$var} -ErrorAction Stop
            Write-Host "   [OK] Variable '$var' activee" -ForegroundColor Green
            $varsAdded = $true
        } else {
            Write-Host "   [INFO] Variable '$var' deja activee" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   [ERREUR] Impossible d'activer '$var': $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Si des variables ont ete ajoutees, redemarrer IIS
if ($varsAdded) {
    Write-Host ""
    Write-Host "Redemarrage d'IIS pour appliquer les changements..." -ForegroundColor Yellow
    iisreset /noforce
    Start-Sleep -Seconds 3
    Write-Host "[OK] IIS redemarre" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[INFO] Toutes les variables sont deja activees" -ForegroundColor Gray
}

# Verification finale
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
$allowedVars = Get-WebConfigurationProperty -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
$allActive = $true

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
} else {
    Write-Host "[ATTENTION] Certaines variables ne sont pas activees" -ForegroundColor Yellow
    Write-Host "Verifiez que le module ARR est installe et que vous avez les droits administrateur" -ForegroundColor Yellow
}
Write-Host ""




