# =============================================================================
# Script de Diagnostic - Redirection sar-intranet vers https://sar-intranet.sar.sn/
# =============================================================================
# Ce script analyse la configuration IIS et DNS pour comprendre pourquoi
# http://sar-intranet ne redirige pas vers https://sar-intranet.sar.sn/
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC DE REDIRECTION IIS/DNS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le script est exécuté en tant qu'administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ATTENTION] Ce script devrait être exécuté en tant qu'administrateur pour accéder à toutes les informations IIS" -ForegroundColor Yellow
    Write-Host ""
}

# =============================================================================
# 1. ANALYSE DNS
# =============================================================================
Write-Host "1. ANALYSE DNS" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$hostnames = @("sar-intranet", "sar-intranet.sar.sn")

foreach ($hostname in $hostnames) {
    Write-Host "`n  Résolution DNS pour: $hostname" -ForegroundColor Cyan
    try {
        $dnsResult = Resolve-DnsName -Name $hostname -ErrorAction Stop
        Write-Host "    [OK] Résolu avec succès:" -ForegroundColor Green
        foreach ($record in $dnsResult) {
            Write-Host "      - Type: $($record.Type), IP: $($record.IPAddress)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "    [ERREUR] Impossible de résoudre: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test de ping
    try {
        $ping = Test-Connection -ComputerName $hostname -Count 1 -ErrorAction SilentlyContinue
        if ($ping) {
            Write-Host "    [OK] Ping réussi: $($ping.IPV4Address.IPAddressToString)" -ForegroundColor Green
        } else {
            Write-Host "    [ATTENTION] Ping échoué" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    [ATTENTION] Ping échoué: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Vérifier le fichier hosts local
Write-Host "`n  Fichier hosts local (C:\Windows\System32\drivers\etc\hosts):" -ForegroundColor Cyan
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
if (Test-Path $hostsPath) {
    $hostsContent = Get-Content $hostsPath | Where-Object { $_ -match "sar-intranet" }
    if ($hostsContent) {
        Write-Host "    [TROUVÉ] Entrées pour sar-intranet:" -ForegroundColor Yellow
        $hostsContent | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    } else {
        Write-Host "    [OK] Aucune entrée pour sar-intranet dans hosts" -ForegroundColor Green
    }
} else {
    Write-Host "    [ERREUR] Fichier hosts introuvable" -ForegroundColor Red
}

# =============================================================================
# 2. ANALYSE IIS - SITES WEB
# =============================================================================
Write-Host "`n`n2. ANALYSE IIS - SITES WEB" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

try {
    Import-Module WebAdministration -ErrorAction Stop
    Write-Host "  [OK] Module WebAdministration chargé" -ForegroundColor Green
} catch {
    Write-Host "  [ERREUR] Impossible de charger WebAdministration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  [INFO] Essayez d'installer IIS Management Tools" -ForegroundColor Yellow
    exit 1
}

# Lister tous les sites
$sites = Get-WebSite
Write-Host "`n  Sites IIS configurés:" -ForegroundColor Cyan
foreach ($site in $sites) {
    Write-Host "    - $($site.Name) (ID: $($site.Id), State: $($site.State))" -ForegroundColor Gray
}

# Chercher les sites contenant "sar" ou "intranet"
$relevantSites = $sites | Where-Object { $_.Name -match "sar|intranet" -or $_.Name -match "frontend" }
if ($relevantSites) {
    Write-Host "`n  Sites pertinents trouvés:" -ForegroundColor Cyan
    foreach ($site in $relevantSites) {
        Write-Host "`n    === Site: $($site.Name) ===" -ForegroundColor Green
        Write-Host "      ID: $($site.Id)" -ForegroundColor Gray
        Write-Host "      État: $($site.State)" -ForegroundColor Gray
        Write-Host "      Chemin physique: $($site.physicalPath)" -ForegroundColor Gray
        
        # Analyser les bindings
        $bindings = Get-WebBinding -Name $site.Name
        Write-Host "`n      Bindings configurés:" -ForegroundColor Cyan
        if ($bindings) {
            foreach ($binding in $bindings) {
                $protocol = $binding.protocol
                $bindingInfo = $binding.bindingInformation
                $hostHeader = $binding.hostHeader
                $certHash = $binding.certificateHash
                
                Write-Host "        - Protocole: $protocol" -ForegroundColor Gray
                Write-Host "          Binding: $bindingInfo" -ForegroundColor Gray
                if ($hostHeader) {
                    Write-Host "          Host Header: $hostHeader" -ForegroundColor Gray
                } else {
                    Write-Host "          Host Header: (aucun - accepte tous)" -ForegroundColor Yellow
                }
                
                if ($protocol -eq "https" -and $certHash) {
                    Write-Host "          Certificat: $certHash" -ForegroundColor Gray
                    # Essayer de trouver les détails du certificat
                    try {
                        $cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Thumbprint -eq $certHash }
                        if ($cert) {
                            Write-Host "          Sujet: $($cert.Subject)" -ForegroundColor Gray
                            Write-Host "          Émetteur: $($cert.Issuer)" -ForegroundColor Gray
                            Write-Host "          Valide jusqu'à: $($cert.NotAfter)" -ForegroundColor Gray
                        }
                    } catch {
                        Write-Host "          [ATTENTION] Impossible de lire les détails du certificat" -ForegroundColor Yellow
                    }
                }
                
                # Vérifier si ce binding correspond à sar-intranet
                if ($hostHeader -eq "sar-intranet" -or $hostHeader -eq "sar-intranet.sar.sn" -or -not $hostHeader) {
                    Write-Host "          [PERTINENT] Ce binding correspond à sar-intranet" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "        [ATTENTION] Aucun binding configuré" -ForegroundColor Yellow
        }
        
        # Vérifier le web.config du site
        $webConfigPath = Join-Path $site.physicalPath "web.config"
        if (Test-Path $webConfigPath) {
            Write-Host "`n      web.config trouvé: $webConfigPath" -ForegroundColor Cyan
        } else {
            Write-Host "`n      [ATTENTION] web.config non trouvé dans: $webConfigPath" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n  [ATTENTION] Aucun site contenant 'sar' ou 'intranet' trouvé" -ForegroundColor Yellow
    Write-Host "  Vérification de tous les sites pour des bindings pertinents..." -ForegroundColor Cyan
    
    foreach ($site in $sites) {
        $bindings = Get-WebBinding -Name $site.Name
        $relevantBindings = $bindings | Where-Object { 
            $_.hostHeader -eq "sar-intranet" -or 
            $_.hostHeader -eq "sar-intranet.sar.sn" -or 
            (-not $_.hostHeader -and $_.protocol -eq "http")
        }
        if ($relevantBindings) {
            Write-Host "`n    Site avec binding pertinent: $($site.Name)" -ForegroundColor Green
            foreach ($binding in $relevantBindings) {
                Write-Host "      - $($binding.protocol) : $($binding.bindingInformation)" -ForegroundColor Gray
            }
        }
    }
}

# =============================================================================
# 3. ANALYSE DU WEB.CONFIG
# =============================================================================
Write-Host "`n`n3. ANALYSE DU WEB.CONFIG" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$webConfigPath = "C:\Users\mmbaye\Desktop\intranet\frontend-intranet-sar\web.config"
if (-not (Test-Path $webConfigPath)) {
    Write-Host "  [ERREUR] web.config non trouvé: $webConfigPath" -ForegroundColor Red
} else {
    Write-Host "  [OK] web.config trouvé: $webConfigPath" -ForegroundColor Green
    
    [xml]$webConfig = Get-Content $webConfigPath
    $rules = $webConfig.configuration.system.webServer.rewrite.rules.rule
    
    Write-Host "`n  Ordre des règles de rewrite (IMPORTANT pour la redirection):" -ForegroundColor Cyan
    
    $ruleIndex = 0
    foreach ($rule in $rules) {
        $ruleIndex++
        $ruleName = $rule.name
        $stopProcessing = $rule.stopProcessing
        $matchUrl = $rule.match.url
        $actionType = $rule.action.type
        $actionUrl = $rule.action.url
        $conditions = $rule.conditions
        
        Write-Host "`n    Règle #$ruleIndex : $ruleName" -ForegroundColor $(if ($ruleName -match "sar-intranet|Redirect") { "Green" } else { "Gray" })
        Write-Host "      stopProcessing: $stopProcessing" -ForegroundColor Gray
        Write-Host "      Match URL: $matchUrl" -ForegroundColor Gray
        Write-Host "      Action Type: $actionType" -ForegroundColor Gray
        if ($actionUrl) {
            Write-Host "      Action URL: $actionUrl" -ForegroundColor Gray
        }
        
        if ($conditions) {
            Write-Host "      Conditions:" -ForegroundColor Gray
            foreach ($condition in $conditions.add) {
                $input = $condition.input
                $pattern = $condition.pattern
                Write-Host "        - Input: $input, Pattern: $pattern" -ForegroundColor Gray
            }
        }
        
        # Analyser si cette règle peut affecter sar-intranet
        if ($ruleName -match "sar-intranet") {
            Write-Host "      [PERTINENT] Cette règle concerne sar-intranet" -ForegroundColor Green
        } elseif ($matchUrl -eq "(.*)" -or $matchUrl -eq ".*") {
            Write-Host "      [ATTENTION] Cette règle capture TOUTES les URLs (peut intercepter sar-intranet)" -ForegroundColor Yellow
        }
    }
    
    # Analyse de l'ordre des règles - problème potentiel
    Write-Host "`n  ANALYSE DE L'ORDRE DES RÈGLES:" -ForegroundColor Cyan
    Write-Host "  ----------------------------------------" -ForegroundColor Cyan
    
    $httpToHttpsRule = $rules | Where-Object { $_.name -match "HTTP to HTTPS" }
    $sarIntranetRule = $rules | Where-Object { $_.name -match "sar-intranet" }
    $nextJsRule = $rules | Where-Object { $_.name -match "Next.js Frontend" }
    
    if ($httpToHttpsRule) {
        $httpToHttpsIndex = [array]::IndexOf($rules, $httpToHttpsRule) + 1
        Write-Host "  Règle 'HTTP to HTTPS redirect' à la position #$httpToHttpsIndex" -ForegroundColor Gray
        Write-Host "    Cette règle redirige vers: https://{HTTP_HOST}/{R:1}" -ForegroundColor Gray
        Write-Host "    [PROBLÈME POTENTIEL] Si l'utilisateur tape http://sar-intranet," -ForegroundColor Yellow
        Write-Host "    cette règle le redirigera vers https://sar-intranet (sans .sar.sn)" -ForegroundColor Yellow
    }
    
    if ($sarIntranetRule) {
        $sarIntranetIndex = [array]::IndexOf($rules, $sarIntranetRule) + 1
        Write-Host "  Règle 'Redirect sar-intranet → HTTPS' à la position #$sarIntranetIndex" -ForegroundColor Gray
        Write-Host "    Cette règle redirige vers: https://sar-intranet.sar.sn/" -ForegroundColor Gray
        
        if ($nextJsRule) {
            $nextJsIndex = [array]::IndexOf($rules, $nextJsRule) + 1
            if ($sarIntranetIndex -gt $nextJsIndex) {
                Write-Host "    [PROBLÈME CRITIQUE] Cette règle est APRÈS la règle 'Next.js Frontend'" -ForegroundColor Red
                Write-Host "    La règle Next.js capture TOUT avec (.*) et stopProcessing=true," -ForegroundColor Red
                Write-Host "    donc la règle sar-intranet ne sera JAMAIS évaluée !" -ForegroundColor Red
            } else {
                Write-Host "    [OK] Cette règle est avant la règle Next.js" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  [ERREUR] Règle de redirection sar-intranet non trouvée" -ForegroundColor Red
    }
}

# =============================================================================
# 4. TEST DE CONNECTIVITÉ
# =============================================================================
Write-Host "`n`n4. TEST DE CONNECTIVITÉ" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$testUrls = @(
    "http://sar-intranet",
    "https://sar-intranet",
    "http://sar-intranet.sar.sn",
    "https://sar-intranet.sar.sn"
)

foreach ($url in $testUrls) {
    Write-Host "`n  Test: $url" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -MaximumRedirection 0 -ErrorAction Stop
        Write-Host "    [OK] Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "    Headers:" -ForegroundColor Gray
        $response.Headers.GetEnumerator() | ForEach-Object {
            Write-Host "      $($_.Key): $($_.Value)" -ForegroundColor Gray
        }
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "    Status: $statusCode" -ForegroundColor $(if ($statusCode -eq 301 -or $statusCode -eq 302) { "Green" } else { "Yellow" })
            
            # Vérifier la redirection
            if ($statusCode -eq 301 -or $statusCode -eq 302) {
                $location = $_.Exception.Response.Headers.Location
                Write-Host "    [REDIRECTION] Vers: $location" -ForegroundColor $(if ($location -eq "https://sar-intranet.sar.sn/") { "Green" } else { "Yellow" })
                if ($location -ne "https://sar-intranet.sar.sn/") {
                    Write-Host "    [PROBLÈME] La redirection ne pointe pas vers https://sar-intranet.sar.sn/" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "    [ERREUR] $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# =============================================================================
# 5. RÉSUMÉ ET RECOMMANDATIONS
# =============================================================================
Write-Host "`n`n5. RÉSUMÉ ET RECOMMANDATIONS" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host ""

Write-Host "PROBLÈMES IDENTIFIÉS:" -ForegroundColor Cyan
Write-Host "1. Ordre des règles dans web.config:" -ForegroundColor Yellow
Write-Host "   - La règle 'Redirect sar-intranet → HTTPS' doit être AVANT" -ForegroundColor Yellow
Write-Host "     la règle 'Next.js Frontend' qui capture tout avec (.*)" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Règle 'HTTP to HTTPS redirect':" -ForegroundColor Yellow
Write-Host "   - Redirige vers https://{HTTP_HOST} ce qui donne https://sar-intranet" -ForegroundColor Yellow
Write-Host "   - Ne redirige pas vers https://sar-intranet.sar.sn/" -ForegroundColor Yellow
Write-Host ""
Write-Host "SOLUTION RECOMMANDÉE:" -ForegroundColor Cyan
Write-Host "1. Déplacer la règle 'Redirect sar-intranet → HTTPS' au DÉBUT" -ForegroundColor Green
Write-Host "   (avant toutes les autres règles)" -ForegroundColor Green
Write-Host ""
Write-Host "2. Modifier la règle pour qu'elle capture à la fois HTTP et HTTPS:" -ForegroundColor Green
Write-Host "   - Condition: HTTP_HOST = sar-intranet (sans vérifier HTTPS)" -ForegroundColor Green
Write-Host "   - Action: Rediriger vers https://sar-intranet.sar.sn/" -ForegroundColor Green
Write-Host ""
Write-Host "3. Vérifier que le binding IIS accepte 'sar-intranet' comme host header" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC TERMINÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
