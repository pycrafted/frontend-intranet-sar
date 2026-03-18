# =============================================================================
# Script de configuration IIS pour HTTPS sur le port 4321
# =============================================================================
# Ce script supprime les anciens sites et cree un nouveau site propre
# avec HTTPS sur le port 4321
# =============================================================================

Import-Module WebAdministration

$siteName = "sar-frontend"
$certThumbprint = "A82DCB945CEE25D6B869B1E4022FA069F1D4A8EC"  # Certificat wildcard *.sar.sn
$hostHeader = "sar-intranet.sar.sn"
$httpsPort = 4321  # Port HTTPS public
$nextjsPort = 5000  # Port interne pour Next.js (localhost uniquement)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Configuration IIS HTTPS sur port 4321" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Supprimer les anciens bindings sur les ports 3001 et 3002
Write-Host "Suppression des anciens bindings..." -ForegroundColor Yellow
$site = Get-Website -Name $siteName -ErrorAction SilentlyContinue

if ($site) {
    # Supprimer tous les bindings HTTPS sur 3001 et 3002
    $bindings = Get-WebBinding -Name $siteName
    foreach ($binding in $bindings) {
        if ($binding.bindingInformation -like "*:3001:*" -or 
            $binding.bindingInformation -like "*:3002:*" -or
            $binding.bindingInformation -like "*:3000:*") {
            Write-Host "  Suppression: $($binding.protocol) $($binding.bindingInformation)" -ForegroundColor Gray
            Remove-WebBinding -Name $siteName -BindingInformation $binding.bindingInformation -ErrorAction SilentlyContinue
        }
    }
    Write-Host "[OK] Anciens bindings supprimes" -ForegroundColor Green
} else {
    Write-Host "[ATTENTION] Le site '$siteName' n'existe pas, il sera cree" -ForegroundColor Yellow
}

# 2. Verifier si le site existe, sinon le creer
if (-not $site) {
    Write-Host ""
    Write-Host "Creation du site IIS..." -ForegroundColor Yellow
    $physicalPath = "C:\intranet\frontend-intranet-sar"
    
    # Creer le dossier si necessaire
    if (-not (Test-Path $physicalPath)) {
        Write-Host "  Creation du dossier: $physicalPath" -ForegroundColor Gray
        New-Item -ItemType Directory -Path $physicalPath -Force | Out-Null
    }
    
    # Creer le site
    New-Website -Name $siteName -PhysicalPath $physicalPath -Port 80 -ErrorAction SilentlyContinue
    Write-Host "[OK] Site cree: $siteName" -ForegroundColor Green
}

# 3. Supprimer le binding HTTP par defaut si existe
Write-Host ""
Write-Host "Nettoyage des bindings HTTP..." -ForegroundColor Yellow
$httpBindings = Get-WebBinding -Name $siteName -Protocol http -ErrorAction SilentlyContinue
foreach ($binding in $httpBindings) {
    if ($binding.bindingInformation -like "*:80:*" -or $binding.bindingInformation -like "*:80:") {
        Remove-WebBinding -Name $siteName -BindingInformation $binding.bindingInformation -ErrorAction SilentlyContinue
        Write-Host "  Binding HTTP supprime: $($binding.bindingInformation)" -ForegroundColor Gray
    }
}

# 4. Ajouter le binding HTTPS sur le port 4321
Write-Host ""
Write-Host "Ajout du binding HTTPS sur le port $httpsPort..." -ForegroundColor Yellow

    # Verifier si le binding existe deja
    $portPattern = "*:${httpsPort}:*"
    $existingHttps = Get-WebBinding -Name $siteName -Protocol https -ErrorAction SilentlyContinue | Where-Object {
        $_.bindingInformation -like $portPattern
    }

if ($existingHttps) {
    Write-Host "  [INFO] Binding HTTPS sur $httpsPort existe deja" -ForegroundColor Gray
} else {
    try {
        New-WebBinding -Name $siteName -Protocol https -Port $httpsPort -HostHeader $hostHeader -SslFlags 0
        Write-Host "[OK] Binding HTTPS ajoute sur le port $httpsPort" -ForegroundColor Green
    } catch {
        Write-Host "  [ATTENTION] Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  Tentative avec format alternatif..." -ForegroundColor Yellow
        New-WebBinding -Name $siteName -Protocol https -Port $httpsPort -IPAddress "*" -HostHeader $hostHeader -SslFlags 0
        Write-Host "[OK] Binding HTTPS ajoute (format alternatif)" -ForegroundColor Green
    }
}

# 5. Configurer le certificat SSL
Write-Host ""
Write-Host "Configuration du certificat SSL..." -ForegroundColor Yellow
try {
    $portPattern = "*:${httpsPort}:*"
    $binding = Get-WebBinding -Name $siteName -Protocol https | Where-Object {
        $_.bindingInformation -like $portPattern
    }
    
    if ($binding) {
        $currentCert = $binding.certificateHash
        if ($currentCert -and $currentCert -eq $certThumbprint) {
            Write-Host "  [OK] Certificat deja configure" -ForegroundColor Green
        } else {
            $binding.AddSslCertificate($certThumbprint, "My")
            Write-Host "[OK] Certificat SSL configure" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  [ERREUR] Erreur lors de la configuration du certificat: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Creer le web.config pour reverse proxy
Write-Host ""
Write-Host "Creation du web.config pour reverse proxy..." -ForegroundColor Yellow
$webConfigPath = "C:\intranet\frontend-intranet-sar\web.config"

$webConfigDir = Split-Path $webConfigPath
if (-not (Test-Path $webConfigDir)) {
    New-Item -ItemType Directory -Path $webConfigDir -Force | Out-Null
}

$webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:$nextjsPort/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_FORWARDED_PROTO" value="https" />
            <set name="HTTP_X_FORWARDED_HOST" value="$hostHeader" />
            <set name="HTTP_X_FORWARDED_PORT" value="$httpsPort" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>
    <httpErrors errorMode="Detailed" />
  </system.webServer>
</configuration>
"@

try {
    $webConfig | Out-File -FilePath $webConfigPath -Encoding UTF8 -Force
    Write-Host "[OK] web.config cree: $webConfigPath" -ForegroundColor Green
    Write-Host "     Reverse proxy: https://$hostHeader`:$httpsPort -> http://localhost:$nextjsPort" -ForegroundColor Gray
} catch {
    Write-Host "  [ERREUR] Erreur lors de la creation du web.config: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Configurer les permissions
Write-Host ""
Write-Host "Configuration des permissions..." -ForegroundColor Yellow
try {
    icacls $webConfigPath /grant "IIS_IUSRS:R" /T 2>&1 | Out-Null
    icacls $webConfigPath /grant "IIS AppPool\sar-frontend-pool:R" /T 2>&1 | Out-Null
    Write-Host "[OK] Permissions configurees" -ForegroundColor Green
} catch {
    Write-Host "  [ATTENTION] Erreur lors de la configuration des permissions" -ForegroundColor Yellow
}

# 8. Activer les variables serveur ARR
Write-Host ""
Write-Host "Activation des variables serveur ARR..." -ForegroundColor Yellow
try {
    $allowedVars = Get-WebConfigurationProperty -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
    
    $requiredVars = @("HTTP_X_FORWARDED_PROTO", "HTTP_X_FORWARDED_HOST", "HTTP_X_FORWARDED_PORT")
    foreach ($var in $requiredVars) {
        $exists = $allowedVars | Where-Object { $_.name -eq $var }
        if (-not $exists) {
            Add-WebConfigurationProperty -Filter "system.webServer/rewrite/allowedServerVariables" -Name "." -Value @{name=$var}
            Write-Host "  [OK] Variable '$var' activee" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  [ATTENTION] Erreur lors de l'activation des variables (ARR peut ne pas etre installe)" -ForegroundColor Yellow
}

# 9. Redemarrer le site
Write-Host ""
Write-Host "Redemarrage du site..." -ForegroundColor Yellow
try {
    Stop-Website -Name $siteName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Start-Website -Name $siteName -ErrorAction SilentlyContinue
    Write-Host "[OK] Site redemarre" -ForegroundColor Green
} catch {
    Write-Host "  [ATTENTION] Erreur lors du redemarrage: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "     Redemarrez manuellement avec: iisreset" -ForegroundColor Yellow
}

# 10. Resume final
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "[OK] Configuration terminee !" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resume de la configuration:" -ForegroundColor Yellow
Write-Host "  Site IIS: $siteName" -ForegroundColor White
Write-Host "  URL publique HTTPS: https://$hostHeader`:$httpsPort" -ForegroundColor Cyan
Write-Host "  Reverse proxy vers: http://localhost:$nextjsPort" -ForegroundColor White
Write-Host "  Certificat: $certThumbprint" -ForegroundColor White
Write-Host ""
Write-Host "Actions suivantes:" -ForegroundColor Yellow
Write-Host "  1. Modifier .env.local: NEXTJS_INTERNAL_PORT=$nextjsPort" -ForegroundColor White
Write-Host "  2. Demarrer Next.js: npm run dev" -ForegroundColor White
Write-Host "  3. Tester: https://$hostHeader`:$httpsPort" -ForegroundColor White
Write-Host ""
Write-Host "Verifications:" -ForegroundColor Yellow
Write-Host "  - Bindings: Get-WebBinding -Name '$siteName'" -ForegroundColor Gray
Write-Host "  - Etat: Get-Website -Name '$siteName'" -ForegroundColor Gray
Write-Host ""

