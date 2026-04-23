$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$mlDir = Join-Path $projectRoot "khety-backend\khety-ml"
$venvPython = Join-Path $mlDir "venv\Scripts\python.exe"
$bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if (!(Test-Path $bundledPython) -and !(Test-Path $venvPython)) {
  & (Join-Path $projectRoot "scripts\setup-ml.ps1")
}

$pythonToUse = $bundledPython

if (!(Test-Path $pythonToUse) -and (Test-Path $venvPython)) {
  $pythonToUse = $venvPython
}

if (!$pythonToUse) {
  throw "No working Python runtime was available for the ML service."
}

Push-Location $mlDir
try {
  & $pythonToUse app.py
} finally {
  Pop-Location
}
