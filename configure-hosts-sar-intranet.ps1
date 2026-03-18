# =============================================================================
# Script de configuration du fichier hosts pour "sar-intranet"
# =============================================================================
# Ce script ajoute une entrée dans le fichier hosts Windows pour que
# "sar-intranet" soit résolu localement et redirigé vers le serveur IIS
# =============================================================================

# Vérifier si le script est exécuté en tant qu'administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script doit être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "Clic droit sur PowerShell -> Exécuter en tant qu'administrateur" -ForegroundColor Yellow
    exit 1
}

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostname = "sar-intranet"
$targetDomain = "sar-intranet.sar.sn"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration du fichier hosts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Résoudre l'IP de sar-intranet.sar.sn
Write-Host "1. Résolution DNS de $targetDomain..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name $targetDomain -ErrorAction Stop
    $ipAddress = ($dnsResult | Where-Object { $_.Type -eq "A" -or $_.Type -eq "CNAME" } | Select-Object -First 1).IPAddress
    
    if (-not $ipAddress) {
        # Si c'est un CNAME, résoudre l'IP finale
        $cnameRecord = $dnsResult | Where-Object { $_.Type -eq "CNAME" } | Select-Object -First 1
        if ($cnameRecord) {
            $finalDns = Resolve-DnsName -Name $cnameRecord.NameHost -ErrorAction Stop
            $ipAddress = ($finalDns | Where-Object { $_.Type -eq "A" } | Select-Object -First 1).IPAddress
        }
    }
    
    if ($ipAddress) {
        Write-Host "   [OK] IP trouvée: $ipAddress" -ForegroundColor Green
    } else {
        Write-Host "   [ATTENTION] Impossible de résoudre l'IP automatiquement" -ForegroundColor Yellow
        Write-Host "   Veuillez entrer l'IP du serveur IIS manuellement:" -ForegroundColor Yellow
        $ipAddress = Read-Host "   IP du serveur"
        if (-not $ipAddress) {
            Write-Host "   [ERREUR] IP non fournie" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   [ATTENTION] Erreur DNS: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Veuillez entrer l'IP du serveur IIS manuellement:" -ForegroundColor Yellow
    $ipAddress = Read-Host "   IP du serveur"
    if (-not $ipAddress) {
        Write-Host "   [ERREUR] IP non fournie" -ForegroundColor Red
        exit 1
    }
}

# 2. Lire le fichier hosts actuel
Write-Host ""
Write-Host "2. Lecture du fichier hosts..." -ForegroundColor Yellow
if (-not (Test-Path $hostsPath)) {
    Write-Host "   [ERREUR] Fichier hosts introuvable: $hostsPath" -ForegroundColor Red
    exit 1
}

$hostsContent = Get-Content $hostsPath
Write-Host "   [OK] Fichier hosts lu" -ForegroundColor Green

# 3. Vérifier si l'entrée existe déjà
Write-Host ""
Write-Host "3. Vérification des entrées existantes..." -ForegroundColor Yellow
$existingEntry = $hostsContent | Where-Object { 
    $_ -match "^\s*$ipAddress\s+$hostname\s*$" -or 
    $_ -match "^\s*$ipAddress\s+$hostname\s+#" -or
    $_ -match "^\s*[0-9\.]+\s+$hostname\s*"
}

if ($existingEntry) {
    Write-Host "   [INFO] Entrée existante trouvée:" -ForegroundColor Cyan
    $existingEntry | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    
    $response = Read-Host "   Voulez-vous la remplacer? (O/N)"
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "   [INFO] Opération annulée" -ForegroundColor Yellow
        exit 0
    }
    
    # Supprimer l'ancienne entrée
    $hostsContent = $hostsContent | Where-Object { 
        -not ($_ -match "^\s*[0-9\.]+\s+$hostname\s*")
    }
    Write-Host "   [OK] Ancienne entrée supprimée" -ForegroundColor Green
}

# 4. Ajouter la nouvelle entrée
Write-Host ""
Write-Host "4. Ajout de l'entrée dans le fichier hosts..." -ForegroundColor Yellow
$newEntry = "$ipAddress`t$hostname`t# Redirection vers sar-intranet.sar.sn (configuré automatiquement)"
$hostsContent += $newEntry

try {
    # Sauvegarder une copie de sauvegarde
    $backupPath = "$hostsPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $hostsPath $backupPath -Force
    Write-Host "   [OK] Sauvegarde créée: $backupPath" -ForegroundColor Green
    
    # Écrire le nouveau contenu
    $hostsContent | Out-File -FilePath $hostsPath -Encoding ASCII -Force
    Write-Host "   [OK] Entrée ajoutée: $ipAddress -> $hostname" -ForegroundColor Green
} catch {
    Write-Host "   [ERREUR] Impossible d'écrire dans le fichier hosts: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Vider le cache DNS
Write-Host ""
Write-Host "5. Vidage du cache DNS..." -ForegroundColor Yellow
try {
    ipconfig /flushdns | Out-Null
    Write-Host "   [OK] Cache DNS vidé" -ForegroundColor Green
} catch {
    Write-Host "   [ATTENTION] Impossible de vider le cache DNS" -ForegroundColor Yellow
}

# 6. Test de résolution
Write-Host ""
Write-Host "6. Test de résolution..." -ForegroundColor Yellow
try {
    $testResult = Resolve-DnsName -Name $hostname -ErrorAction Stop
    $testIP = ($testResult | Where-Object { $_.Type -eq "A" } | Select-Object -First 1).IPAddress
    if ($testIP -eq $ipAddress) {
        Write-Host "   [OK] Résolution réussie: $hostname -> $testIP" -ForegroundColor Green
    } else {
        Write-Host "   [ATTENTION] Résolution différente: $hostname -> $testIP (attendu: $ipAddress)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ATTENTION] Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Essayez de redémarrer votre navigateur ou d'attendre quelques secondes" -ForegroundColor Yellow
}

# 7. Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] Configuration terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Résumé:" -ForegroundColor Yellow
Write-Host "  - Fichier hosts: $hostsPath" -ForegroundColor White
Write-Host "  - Entrée ajoutée: $ipAddress -> $hostname" -ForegroundColor White
Write-Host "  - Sauvegarde: $backupPath" -ForegroundColor White
Write-Host ""
Write-Host "Maintenant vous pouvez:" -ForegroundColor Yellow
Write-Host "  1. Taper 'sar-intranet' dans la barre d'adresse" -ForegroundColor Cyan
Write-Host "  2. Le navigateur devrait résoudre vers $ipAddress" -ForegroundColor Cyan
Write-Host "  3. IIS redirigera vers https://sar-intranet.sar.sn/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Si cela ne fonctionne pas immédiatement:" -ForegroundColor Yellow
Write-Host "  - Redémarrez votre navigateur" -ForegroundColor White
Write-Host "  - Videz le cache du navigateur (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "  - Essayez en mode navigation privée" -ForegroundColor White
Write-Host ""
Write-Host "Pour supprimer cette configuration:" -ForegroundColor Yellow
Write-Host "  - Ouvrez $hostsPath en tant qu'administrateur" -ForegroundColor White
Write-Host "  - Supprimez la ligne contenant '$hostname'" -ForegroundColor White
Write-Host "  - Ou restaurez depuis la sauvegarde: $backupPath" -ForegroundColor White
Write-Host ""
