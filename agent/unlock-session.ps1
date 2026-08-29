# Robust Session Reconnect & Console Unlock Script for PC Control Dashboard
# Supports active unlock, disconnected session attach, and fresh-boot handshake
try {
    function Get-UserSessionInfo {
        $lines = query session 2>$null
        $found = $null
        foreach ($line in $lines) {
            if ($line -match '(\S+)\s+(\S+)?\s+(\d+)\s+(Active|Disc)') {
                $sessName = $matches[1]
                $userName = $matches[2]
                $id = $matches[3]
                $state = $matches[4]
                if ($id -ne '0' -and $id -ne '65536') {
                    $found = [PSCustomObject]@{ Id = $id; State = $state; User = $userName; SessionName = $sessName }
                    if ($userName -match 'aliye' -or $sessName -match 'console') {
                        return $found
                    }
                }
            }
        }
        return $found
    }

    $sess = Get-UserSessionInfo

    # If no session initialized yet on fresh boot, force session handshake
    if (-not $sess) {
        Write-Host "No session found (Fresh Boot). Initializing session handshake..."
        & tsdiscon.exe 1 2>$null
        & tsdiscon.exe 2 2>$null
        & rundll32.exe user32.dll,LockWorkStation 2>$null
        Start-Sleep -Milliseconds 400
        $sess = Get-UserSessionInfo
    }

    $targetId = if ($sess -and $sess.Id) { $sess.Id } else { "1" }

    Write-Host "Re-attaching Session ID: $targetId to physical console..."

    # If already active, cycle session (tsdiscon -> 300ms pause -> tscon) to refresh console display
    if ($sess -and $sess.State -eq "Active") {
        Write-Host "Session is currently Active. Cycling session to refresh console..."
        & tsdiscon.exe $targetId 2>$null
        Start-Sleep -Milliseconds 300
    }

    # Attach to console
    & tscon.exe $targetId /dest:console 2>$null
    if ($LASTEXITCODE -ne 0) {
        # Fallback to session 1 and session 2
        & tscon.exe 1 /dest:console 2>$null
        & tscon.exe 2 /dest:console 2>$null
    }

    # Dismiss Windows lock screen clock/wallpaper overlay
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
        [System.Windows.Forms.SendKeys]::SendWait("{ESC}")
    } catch {}

    Write-Host "Unlock sequence completed successfully."
} catch {
    Write-Host "Unlock Exception: $_"
}