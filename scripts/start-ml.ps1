$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$mlDir = Join-Path $projectRoot "khety-backend\khety-ml"
$venvPython = Join-Path $mlDir "venv\Scripts\python.exe"

if (!(Test-Path $venvPython)) {
  & (Join-Path $projectRoot "scripts\setup-ml.ps1")
}

Push-Location $mlDir
try {
  & $venvPython app.py
} finally {
  Pop-Location
}
