# =============================================================================
# Script pour forcer l'activation des variables serveur ARR
# =============================================================================

Import-Module WebAdministration

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Activation forcee des variables ARR" -ForegroundColor Cyan
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
    $arrModule | ForEach-Object { Write-Host "     - $($_.Name)" -ForegroundColor Gray }
    Write-Host ""
}

# Activer les variables serveur ARR
Write-Host "Activation des variables serveur ARR..." -ForegroundColor Yellow
$requiredVars = @("HTTP_X_FORWARDED_PROTO", "HTTP_X_FORWARDED_HOST", "HTTP_X_FORWARDED_PORT", "HTTP_X_REAL_IP")
$varsAdded = $false

# Utiliser appcmd.exe pour activer les variables au niveau serveur
$appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"

if (Test-Path $appcmdPath) {
    Write-Host "   Utilisation de appcmd.exe pour activer les variables..." -ForegroundColor Gray
    foreach ($var in $requiredVars) {
        try {
            # Verifier si la variable existe deja
            $checkResult = & $appcmdPath list config -section:system.webServer/rewrite/allowedServerVariables 2>&1
            $exists = $checkResult | Select-String -Pattern "name=`"$var`""
            
            if (-not $exists) {
                Write-Host "   Ajout de la variable '$var'..." -ForegroundColor Yellow
                # Ajouter la variable au niveau serveur
                $result = & $appcmdPath set config -section:system.webServer/rewrite/allowedServerVariables /+"[name='$var']" /commit:apphost 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "   [OK] Variable '$var' activee" -ForegroundColor Green
                    $varsAdded = $true
                } else {
                    Write-Host "   [ERREUR] Echec de l'activation: $result" -ForegroundColor Red
                }
            } else {
                Write-Host "   [INFO] Variable '$var' deja activee" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   [ERREUR] Impossible d'activer '$var': $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   [ERREUR] appcmd.exe introuvable !" -ForegroundColor Red
    Write-Host "   Tentative avec PowerShell..." -ForegroundColor Yellow
    
    # Methode alternative avec PowerShell
    foreach ($var in $requiredVars) {
        try {
            # Utiliser PSPath explicite pour le niveau serveur
            $allowedVars = Get-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
            $exists = $allowedVars | Where-Object { $_.name -eq $var }
            
            if (-not $exists) {
                Write-Host "   Ajout de la variable '$var'..." -ForegroundColor Yellow
                Add-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/rewrite/allowedServerVariables" -Name "." -Value @{name=$var} -ErrorAction Stop
                Write-Host "   [OK] Variable '$var' activee" -ForegroundColor Green
                $varsAdded = $true
            } else {
                Write-Host "   [INFO] Variable '$var' deja activee" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   [ERREUR] Impossible d'activer '$var': $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Si des variables ont ete ajoutees, redemarrer IIS
if ($varsAdded) {
    Write-Host ""
    Write-Host "Redemarrage d'IIS pour appliquer les changements..." -ForegroundColor Yellow
    iisreset /noforce
    Start-Sleep -Seconds 5
    Write-Host "[OK] IIS redemarre" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[INFO] Toutes les variables sont deja activees" -ForegroundColor Gray
}

# Verification finale
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verifier avec appcmd.exe si disponible
$appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"
$allActive = $true

if (Test-Path $appcmdPath) {
    foreach ($var in $requiredVars) {
        $checkResult = & $appcmdPath list config -section:system.webServer/rewrite/allowedServerVariables 2>&1
        $exists = $checkResult | Select-String -Pattern "name=`"$var`""
        if ($exists) {
            Write-Host "   [OK] Variable '$var' activee" -ForegroundColor Green
        } else {
            Write-Host "   [ERREUR] Variable '$var' non activee !" -ForegroundColor Red
            $allActive = $false
        }
    }
} else {
    # Methode alternative avec PowerShell
    $allowedVars = Get-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
    foreach ($var in $requiredVars) {
        $exists = $allowedVars | Where-Object { $_.name -eq $var }
        if ($exists) {
            Write-Host "   [OK] Variable '$var' activee" -ForegroundColor Green
        } else {
            Write-Host "   [ERREUR] Variable '$var' non activee !" -ForegroundColor Red
            $allActive = $false
        }
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
    Write-Host "Verifiez que vous avez les droits administrateur et que le module ARR est installe" -ForegroundColor Yellow
}
Write-Host ""

