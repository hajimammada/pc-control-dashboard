try {
    # Stop any running node processes first
    Stop-Process -Name 'node' -Force -ErrorAction SilentlyContinue

    $action = New-ScheduledTaskAction -Execute "C:\Program Files\nodejs\node.exe" -Argument '"C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\agent\server.js"' -WorkingDirectory "C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\agent"
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 365)
    Register-ScheduledTask -TaskName "NexusPCAgent" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Nexus PC Companion Agent Boot Service" -Force
    Start-ScheduledTask -TaskName "NexusPCAgent"
    Set-Content -Path "C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\task_install.log" -Value "SUCCESS"
} catch {
    Set-Content -Path "C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\task_install.log" -Value $_.Exception.Message
}
