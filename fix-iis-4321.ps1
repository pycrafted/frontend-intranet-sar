# =============================================================================
# Script de correction automatique pour IIS sur le port 4321
# =============================================================================

Import-Module WebAdministration

$siteName = "sar-frontend"
$httpsPort = 4321
$nextjsPort = 5000

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Correction automatique IIS - Port 4321" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Activer les variables serveur ARR (CRITIQUE)
Write-Host "1. Activation des variables serveur ARR..." -ForegroundColor Yellow
try {
    # Verifier si ARR est installe
    $arrModule = Get-WebGlobalModule | Where-Object { $_.Name -like "*ARR*" -or $_.Name -like "*ApplicationRequestRouting*" }
    if (-not $arrModule) {
        Write-Host "   [ATTENTION] Module ARR peut ne pas etre installe" -ForegroundColor Yellow
        Write-Host "   Installez-le depuis: https://www.iis.net/downloads/microsoft/application-request-routing" -ForegroundColor Yellow
    }
    
    $requiredVars = @("HTTP_X_FORWARDED_PROTO", "HTTP_X_FORWARDED_HOST", "HTTP_X_FORWARDED_PORT")
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
        Write-Host "   [INFO] Redemarrage d'IIS pour appliquer les changements..." -ForegroundColor Yellow
        iisreset /noforce
        Start-Sleep -Seconds 3
        Write-Host "   [OK] IIS redemarre" -ForegroundColor Green
    }
} catch {
    Write-Host "   [ATTENTION] Erreur lors de l'activation des variables" -ForegroundColor Yellow
    Write-Host "   Le module ARR peut ne pas etre installe" -ForegroundColor Yellow
}

# 2. Demarrer le pool d'applications
Write-Host ""
Write-Host "2. Demarrage du pool d'applications..." -ForegroundColor Yellow
$poolName = (Get-ItemProperty "IIS:\Sites\$siteName").applicationPool
try {
    $poolState = Get-WebAppPoolState -Name $poolName
    if ($poolState.Value -ne 'Started') {
        Start-WebAppPool -Name $poolName
        Start-Sleep -Seconds 2
        Write-Host "   [OK] Pool '$poolName' demarre" -ForegroundColor Green
    } else {
        Write-Host "   [INFO] Pool '$poolName' deja demarre" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [ERREUR] Impossible de demarrer le pool: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Demarrer le site IIS
Write-Host ""
Write-Host "3. Demarrage du site IIS..." -ForegroundColor Yellow
try {
    $site = Get-Website -Name $siteName
    if ($site.State -ne 'Started') {
        # Essayer de demarrer normalement
        try {
            Start-Website -Name $siteName
            Start-Sleep -Seconds 2
            Write-Host "   [OK] Site '$siteName' demarre" -ForegroundColor Green
        } catch {
            Write-Host "   [ATTENTION] Erreur au demarrage normal: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "   Tentative avec iisreset..." -ForegroundColor Yellow
            iisreset
            Start-Sleep -Seconds 5
            Start-Website -Name $siteName
            Write-Host "   [OK] Site demarre apres iisreset" -ForegroundColor Green
        }
    } else {
        Write-Host "   [INFO] Site '$siteName' deja demarre" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [ERREUR] Impossible de demarrer le site: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Verifier le web.config
Write-Host ""
Write-Host "4. Verification du web.config..." -ForegroundColor Yellow
$webConfigPath = "C:\intranet\frontend-intranet-sar\web.config"
if (Test-Path $webConfigPath) {
    $content = Get-Content $webConfigPath -Raw
    if ($content -like "*localhost:$nextjsPort*") {
        Write-Host "   [OK] web.config pointe vers localhost:$nextjsPort" -ForegroundColor Green
    } else {
        Write-Host "   [ATTENTION] web.config ne pointe pas vers localhost:$nextjsPort" -ForegroundColor Yellow
        Write-Host "   Mise a jour en cours..." -ForegroundColor Yellow
        $newContent = $content -replace 'http://localhost:\d+/', "http://localhost:$nextjsPort/"
        $newContent | Out-File -FilePath $webConfigPath -Encoding UTF8 -Force
        Write-Host "   [OK] web.config mis a jour" -ForegroundColor Green
    }
} else {
    Write-Host "   [ERREUR] web.config n'existe pas !" -ForegroundColor Red
}

# 5. Verifier que Next.js tourne
Write-Host ""
Write-Host "5. Verification de Next.js..." -ForegroundColor Yellow
$nextjsProcess = netstat -ano | Select-String ":${nextjsPort}.*LISTENING"
if ($nextjsProcess) {
    Write-Host "   [OK] Next.js ecoute sur le port $nextjsPort" -ForegroundColor Green
} else {
    Write-Host "   [ATTENTION] Next.js n'ecoute pas sur le port $nextjsPort" -ForegroundColor Yellow
    Write-Host "   Demarrez Next.js avec: npm run dev" -ForegroundColor Yellow
}

# 6. Verifier le pare-feu
Write-Host ""
Write-Host "6. Configuration du pare-feu..." -ForegroundColor Yellow
try {
    $firewallRule = Get-NetFirewallRule -DisplayName "IIS Port $httpsPort" -ErrorAction SilentlyContinue
    if (-not $firewallRule) {
        Write-Host "   Creation de la regle pare-feu pour le port $httpsPort..." -ForegroundColor Yellow
        New-NetFirewallRule -DisplayName "IIS Port $httpsPort" -Direction Inbound -LocalPort $httpsPort -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
        Write-Host "   [OK] Regle pare-feu creee" -ForegroundColor Green
    } else {
        Write-Host "   [INFO] Regle pare-feu existe deja" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [ATTENTION] Impossible de creer la regle pare-feu (droits admin requis)" -ForegroundColor Yellow
}

# 7. Verification finale
Write-Host ""
Write-Host "7. Verification finale..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$site = Get-Website -Name $siteName
$pool = Get-WebAppPoolState -Name $poolName
$nextjsListening = netstat -ano | Select-String ":${nextjsPort}.*LISTENING"
$iisListening = netstat -ano | Select-String ":${httpsPort}.*LISTENING"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Resume:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$siteColor = if($site.State -eq 'Started'){'Green'}else{'Red'}
$poolColor = if($pool.Value -eq 'Started'){'Green'}else{'Red'}
$nextjsColor = if($nextjsListening){'Green'}else{'Red'}
$iisColor = if($iisListening){'Green'}else{'Red'}

Write-Host "  Site IIS: $($site.State)" -ForegroundColor $siteColor
Write-Host "  Pool: $($pool.Value)" -ForegroundColor $poolColor
Write-Host "  Next.js (port $nextjsPort): $(if($nextjsListening){'[OK]'}else{'[ERREUR]'})" -ForegroundColor $nextjsColor
Write-Host "  IIS (port $httpsPort): $(if($iisListening){'[OK]'}else{'[ERREUR]'})" -ForegroundColor $iisColor
Write-Host ""

if ($site.State -eq 'Started' -and $pool.Value -eq 'Started' -and $nextjsListening -and $iisListening) {
    Write-Host "[OK] Tout est configure correctement !" -ForegroundColor Green
    Write-Host "Testez: https://sar-intranet.sar.sn:4321" -ForegroundColor Cyan
} else {
    Write-Host "[ATTENTION] Certains elements ne sont pas correctement configures" -ForegroundColor Yellow
    if ($site.State -ne 'Started') {
        Write-Host "  - Demarrez le site: Start-Website -Name '$siteName'" -ForegroundColor White
    }
    if (-not $nextjsListening) {
        Write-Host "  - Demarrez Next.js: npm run dev" -ForegroundColor White
    }
}
Write-Host ""

