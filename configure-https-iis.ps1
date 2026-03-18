# =============================================================================
# Script de configuration HTTPS pour sar-intranet.sar.sn:3001
# =============================================================================
# Ce script configure IIS pour servir l'application Next.js en HTTPS
# via un reverse proxy vers le serveur Node.js local
# =============================================================================

Import-Module WebAdministration

$siteName = "sar-frontend"
$certThumbprint = "A82DCB945CEE25D6B869B1E4022FA069F1D4A8EC"  # Certificat wildcard *.sar.sn
$hostHeader = "sar-intranet.sar.sn"
$httpsPort = 3001  # Port HTTPS public (IIS)
$nextjsPort = 4321  # Port interne ou Next.js ecoute (localhost uniquement)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Configuration HTTPS pour sar-intranet.sar.sn:3001" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que le site existe
$site = Get-Website -Name $siteName -ErrorAction SilentlyContinue
if (-not $site) {
    Write-Host "[ERREUR] Le site '$siteName' n'existe pas" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Site trouve: $siteName" -ForegroundColor Green

# 2. Verifier les bindings existants
Write-Host ""
Write-Host "Bindings actuels:" -ForegroundColor Yellow
Get-WebBinding -Name $siteName | ForEach-Object {
    Write-Host "  - $($_.protocol) : $($_.bindingInformation)" -ForegroundColor White
}

# 3. Supprimer le binding HTTP sur 3001 (si existe)
Write-Host ""
Write-Host "Suppression du binding HTTP sur 3001..." -ForegroundColor Yellow
$httpBindings = Get-WebBinding -Name $siteName -Protocol http | Where-Object { 
    $_.bindingInformation -like "*:3001:*" -or $_.bindingInformation -like "*:3001:" 
}
foreach ($binding in $httpBindings) {
    Remove-WebBinding -Name $siteName -BindingInformation $binding.bindingInformation
    Write-Host "  [OK] Binding HTTP supprime: $($binding.bindingInformation)" -ForegroundColor Green
}

# 4. Verifier si le binding HTTPS existe deja
$existingHttps = Get-WebBinding -Name $siteName -Protocol https | Where-Object { 
    $_.bindingInformation -like "*:3001:*" 
}

if ($existingHttps) {
    Write-Host ""
    Write-Host "[ATTENTION] Binding HTTPS sur 3001 existe deja" -ForegroundColor Yellow
    Write-Host "  Voulez-vous le supprimer et le recreer ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'O' -or $response -eq 'o') {
        Remove-WebBinding -Name $siteName -BindingInformation $existingHttps.bindingInformation
        Write-Host "  [OK] Ancien binding HTTPS supprime" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] Conservation du binding existant" -ForegroundColor Yellow
    }
}

# 5. Ajouter le binding HTTPS sur 3001
if (-not $existingHttps -or ($response -eq 'O' -or $response -eq 'o')) {
    Write-Host ""
    Write-Host "Ajout du binding HTTPS sur 3001..." -ForegroundColor Yellow
    try {
        New-WebBinding -Name $siteName -Protocol https -Port $httpsPort -HostHeader $hostHeader -SslFlags 0
        Write-Host "  [OK] Binding HTTPS ajoute" -ForegroundColor Green
    } catch {
        Write-Host "  [ATTENTION] Erreur lors de l'ajout du binding: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  Tentative avec un autre format..." -ForegroundColor Yellow
        New-WebBinding -Name $siteName -Protocol https -Port $httpsPort -IPAddress "*" -HostHeader $hostHeader -SslFlags 0
        Write-Host "  [OK] Binding HTTPS ajoute (format alternatif)" -ForegroundColor Green
    }
}

# 6. Configurer le certificat SSL
Write-Host ""
Write-Host "Configuration du certificat SSL..." -ForegroundColor Yellow
try {
    $binding = Get-WebBinding -Name $siteName -Protocol https | Where-Object { 
        $_.bindingInformation -like "*:3001:*" 
    }
    
    if ($binding) {
        # Verifier si le certificat est deja configure
        $currentCert = $binding.certificateHash
        if ($currentCert -and $currentCert -eq $certThumbprint) {
            Write-Host "  [OK] Certificat deja configure correctement" -ForegroundColor Green
        } else {
            $binding.AddSslCertificate($certThumbprint, "My")
            Write-Host "  [OK] Certificat SSL configure: $certThumbprint" -ForegroundColor Green
        }
    } else {
        Write-Host "  [ERREUR] Impossible de trouver le binding HTTPS sur 3001" -ForegroundColor Red
    }
} catch {
    Write-Host "  [ERREUR] Erreur lors de la configuration du certificat: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Creer le web.config pour reverse proxy
Write-Host ""
Write-Host "Creation du web.config pour reverse proxy..." -ForegroundColor Yellow
$webConfigPath = "C:\intranet\frontend-intranet-sar\web.config"

# Verifier que le dossier existe
$webConfigDir = Split-Path $webConfigPath
if (-not (Test-Path $webConfigDir)) {
    Write-Host "  [ATTENTION] Le dossier n'existe pas, creation..." -ForegroundColor Yellow
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
    Write-Host "  [OK] web.config cree: $webConfigPath" -ForegroundColor Green
} catch {
    Write-Host "  [ERREUR] Erreur lors de la creation du web.config: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Configurer les permissions
Write-Host ""
Write-Host "Configuration des permissions..." -ForegroundColor Yellow
try {
    icacls $webConfigPath /grant "IIS_IUSRS:R" /T 2>&1 | Out-Null
    icacls $webConfigPath /grant "IIS AppPool\sar-frontend-pool:R" /T 2>&1 | Out-Null
    Write-Host "  [OK] Permissions configurees" -ForegroundColor Green
} catch {
    Write-Host "  [ATTENTION] Erreur lors de la configuration des permissions (peut necessiter des droits admin)" -ForegroundColor Yellow
}

# 9. Activer les variables serveur pour ARR
Write-Host ""
Write-Host "Activation des variables serveur ARR..." -ForegroundColor Yellow
try {
    # Verifier si les variables existent deja
    $allowedVars = Get-WebConfigurationProperty -Filter "system.webServer/rewrite/allowedServerVariables" -Name "collection" -ErrorAction SilentlyContinue
    
    $requiredVars = @("HTTP_X_FORWARDED_PROTO", "HTTP_X_FORWARDED_HOST", "HTTP_X_FORWARDED_PORT")
    foreach ($var in $requiredVars) {
        $exists = $allowedVars | Where-Object { $_.name -eq $var }
        if (-not $exists) {
            Add-WebConfigurationProperty -Filter "system.webServer/rewrite/allowedServerVariables" -Name "." -Value @{name=$var}
            Write-Host "  [OK] Variable '$var' activee" -ForegroundColor Green
        } else {
            Write-Host "  [INFO] Variable '$var' deja activee" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  [ATTENTION] Erreur lors de l'activation des variables (ARR peut ne pas etre installe)" -ForegroundColor Yellow
    Write-Host "     Installez Application Request Routing (ARR) depuis Web Platform Installer" -ForegroundColor Yellow
    Write-Host "     URL: https://www.iis.net/downloads/microsoft/application-request-routing" -ForegroundColor Yellow
}

# 10. Redemarrer le site et le pool
Write-Host ""
Write-Host "Redemarrage du site et du pool..." -ForegroundColor Yellow
try {
    Restart-WebAppPool -Name "sar-frontend-pool" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Stop-Website -Name $siteName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Start-Website -Name $siteName -ErrorAction SilentlyContinue
    Write-Host "  [OK] Site redemarre" -ForegroundColor Green
} catch {
    Write-Host "  [ATTENTION] Erreur lors du redemarrage: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "     Redemarrez manuellement avec: iisreset" -ForegroundColor Yellow
}

# 11. Verification finale
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "[OK] Configuration terminee !" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resume de la configuration:" -ForegroundColor Yellow
Write-Host "  Site: $siteName" -ForegroundColor White
Write-Host "  URL HTTPS: https://$hostHeader`:$httpsPort" -ForegroundColor Cyan
Write-Host "  Reverse proxy vers: http://localhost:$nextjsPort" -ForegroundColor White
Write-Host "  Certificat: $certThumbprint" -ForegroundColor White
Write-Host ""
Write-Host "Verifications:" -ForegroundColor Yellow
Write-Host "  1. Verifiez que Next.js tourne sur http://localhost:$nextjsPort" -ForegroundColor White
Write-Host "  2. Testez l'acces: https://$hostHeader`:$httpsPort" -ForegroundColor White
Write-Host "  3. Verifiez les logs IIS en cas d'erreur" -ForegroundColor White
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  - Verifier les bindings: Get-WebBinding -Name '$siteName'" -ForegroundColor Gray
Write-Host "  - Verifier l'etat du site: Get-Website -Name '$siteName'" -ForegroundColor Gray
Write-Host "  - Redemarrer IIS: iisreset" -ForegroundColor Gray
Write-Host ""
