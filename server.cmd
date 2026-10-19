@echo off
rem ============================================================
rem  JADAWIL MANSATAT — server control (double-click me)
rem  With no arguments it opens the interactive menu.
rem  Examples:  server.cmd start    /    server.cmd stop
rem ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" %*
if "%~1"=="" pause
