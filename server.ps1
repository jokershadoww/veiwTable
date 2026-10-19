<#
    server.ps1 — Control script for "Jadawil Mansatat" Next.js dev server
    Usage:
      .\server.ps1            -> interactive menu
      .\server.ps1 start      -> start dev server (new window)
      .\server.ps1 stop       -> stop dev server
      .\server.ps1 restart    -> stop then start
      .\server.ps1 status     -> show server status
      .\server.ps1 build      -> production build
      .\server.ps1 prod       -> build + start production server
      .\server.ps1 open       -> open http://localhost:3000 in browser
#>

param([string]$Command = "menu")

$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path }
$Port = 3000
$Url = "http://localhost:$Port"
$NodeExe = "node.exe"

function Write-Line($text, $color = "Gray") { Write-Host $text -ForegroundColor $color }

# All node processes that belong to THIS project (never touches other projects / OpenCode)
function Get-ServerProcesses {
    Get-CimInstance Win32_Process -Filter "Name='$NodeExe'" | Where-Object {
        $_.CommandLine -and
        $_.CommandLine -like "*$ProjectRoot*" -and
        ( $_.CommandLine -like "*next*" -or $_.CommandLine -like "*turbopack*" )
    }
}

function Test-ServerUp {
    try {
        $c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
        return ($null -ne $c)
    } catch { return $false }
}

function Show-Status {
    $procs = @(Get-ServerProcesses)
    if (Test-ServerUp) {
        Write-Line "  STATUS : RUNNING (listening on port $Port)" "Green"
    } else {
        Write-Line "  STATUS : STOPPED" "Yellow"
    }
    if ($procs.Count -gt 0) {
        Write-Line "  NODE   : $($procs.Count) process(es)" "Cyan"
        $procs | ForEach-Object { Write-Host "           PID $($_.ProcessId)  $($_.CommandLine.Substring(0, [Math]::Min(70, $_.CommandLine.Length)))..." }
    } else {
        Write-Line "  NODE   : none" "DarkGray"
    }
}

function Start-Server {
    if (Test-ServerUp) {
        Write-Line "Server is already running on $Url" "Yellow"
        return
    }
    $cmd = "Set-Location -LiteralPath '$ProjectRoot'; npm run dev"
    Start-Process powershell -ArgumentList @("-NoExit", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $cmd) | Out-Null
    Write-Line "Starting dev server in a new window..." "Cyan"
    # wait up to ~40s until the port responds
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 1
        if (Test-ServerUp) { break }
    }
    if (Test-ServerUp) {
        Write-Line "Server is UP -> $Url" "Green"
    } else {
        Write-Line "Server not responding yet (check the server window)." "Yellow"
    }
}

function Stop-Server {
    $procs = @(Get-ServerProcesses)
    if ($procs.Count -eq 0 -and -not (Test-ServerUp)) {
        Write-Line "Server is not running." "Yellow"
        return
    }
    # stop child processes first, then parents
    $procs | Sort-Object ProcessId -Descending | ForEach-Object {
        try {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
            Write-Line "  stopped PID $($_.ProcessId)" "DarkGray"
        } catch { Write-Line "  could not stop PID $($_.ProcessId): $($_.Exception.Message)" "Red" }
    }
    Start-Sleep -Seconds 1
    # anything still holding the port?
    try {
        Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | ForEach-Object {
            $pid2 = $_.OwningProcess
            try { Stop-Process -Id $pid2 -Force -ErrorAction Stop; Write-Line "  released port from PID $pid2" "DarkGray" } catch { }
        }
    } catch { }
    if (Test-ServerUp) { Write-Line "Port $Port is still in use." "Red" }
    else { Write-Line "Server stopped." "Green" }
}

function Build-Project {
    Push-Location $ProjectRoot
    try { npm run build } finally { Pop-Location }
}

function Start-Prod {
    if (Test-ServerUp) {
        Write-Line "Port $Port is busy — stop the dev server first (.\server.ps1 stop)." "Yellow"
        return
    }
    Build-Project
    $cmd = "Set-Location -LiteralPath '$ProjectRoot'; npm start"
    Start-Process powershell -ArgumentList @("-NoExit", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $cmd) | Out-Null
    Write-Line "Production server starting in a new window -> $Url" "Cyan"
}

function Open-Site { Start-Process $Url }

function Show-Menu {
    while ($true) {
        Write-Host ""
        Write-Line "================= JADAWIL MANSATAT — SERVER =================" "Cyan"
        Write-Host "  [1] Start dev server        (start)"
        Write-Host "  [2] Stop server             (stop)"
        Write-Host "  [3] Restart server          (restart)"
        Write-Host "  [4] Status                  (status)"
        Write-Host "  [5] Production build        (build)"
        Write-Host "  [6] Build + run production  (prod)"
        Write-Host "  [7] Open site in browser    (open)"
        Write-Host "  [0] Exit                    (exit)"
        Write-Line "===============================================================" "Cyan"
        $choice = Read-Host "  Choose"
        switch ($choice.Trim()) {
            "1" { Start-Server }
            "2" { Stop-Server }
            "3" { Stop-Server; Start-Server }
            "4" { Show-Status }
            "5" { Build-Project }
            "6" { Start-Prod }
            "7" { Open-Site }
            "0" { exit 0 }
            default { Write-Line "  Unknown option." "Red" }
        }
    }
}

switch ($Command.ToLower()) {
    "start"   { Start-Server }
    "stop"    { Stop-Server }
    "restart" { Stop-Server; Start-Server }
    "status"  { Show-Status }
    "build"   { Build-Project }
    "prod"    { Start-Prod }
    "open"    { Open-Site }
    "menu"    { Show-Menu }
    "exit"    { exit 0 }
    default {
        Write-Line "Unknown command: $Command" "Red"
        Write-Line "Use: start | stop | restart | status | build | prod | open | menu" "Yellow"
        exit 1
    }
}
