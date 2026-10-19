$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Khety System for Demo/Presentation" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Launching 3 services in separate windows:"
Write-Host "  1. Backend API   -> http://localhost:5000" -ForegroundColor Cyan
Write-Host "  2. ML Service    -> http://localhost:5001" -ForegroundColor Cyan
Write-Host "  3. Frontend Web  -> http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "`$host.ui.RawUI.WindowTitle = 'Khety Backend [Port 5000]'; Set-Location '$projectRoot\khety-backend'; node index.js"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "`$host.ui.RawUI.WindowTitle = 'Khety ML Service [Port 5001]'; Set-Location '$projectRoot'; powershell -ExecutionPolicy Bypass -File .\scripts\start-ml.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "`$host.ui.RawUI.WindowTitle = 'Khety Frontend [Port 3000]'; Set-Location '$projectRoot\khety-frontend'; npm start"

