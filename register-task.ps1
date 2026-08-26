try {
    $action = New-ScheduledTaskAction -Execute "C:\Program Files\nodejs\node.exe" -Argument '"C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\agent\server.js"' -WorkingDirectory "C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\agent"
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
    Register-ScheduledTask -TaskName "NexusPCAgent" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Nexus PC Agent boot service" -Force
    Set-Content -Path "C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\task_install.log" -Value "SUCCESS"
} catch {
    Set-Content -Path "C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\task_install.log" -Value $_.Exception.Message
}
