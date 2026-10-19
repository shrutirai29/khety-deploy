$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$mlDir = Join-Path $projectRoot "khety-backend\khety-ml"
$venvPython = Join-Path $mlDir "venv\Scripts\python.exe"
$bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

$candidates = @()

$pyCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pyCmd) { $candidates += $pyCmd.Source }

$installedPython311 = "C:\Users\shrut\AppData\Local\Programs\Python\Python311\python.exe"
if (Test-Path $installedPython311) { $candidates += $installedPython311 }

$installedPython310 = "C:\Users\shrut\AppData\Local\Programs\Python\Python310\python.exe"
if (Test-Path $installedPython310) { $candidates += $installedPython310 }

if (Test-Path $venvPython) { $candidates += $venvPython }
if (Test-Path $bundledPython) { $candidates += $bundledPython }

$pythonToUse = $null

foreach ($candidate in $candidates) {
  try {
    $hasRequired = & $candidate -c "import flask, tensorflow; print('READY')" 2>$null
    if ($hasRequired -match "READY") {
      $pythonToUse = $candidate
      break
    }
  } catch {}
}

if (!$pythonToUse) {
  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      $pythonToUse = $candidate
      break
    }
  }
}

if (!$pythonToUse) {
  & (Join-Path $projectRoot "scripts\setup-ml.ps1")
  $pythonToUse = $venvPython
}

if (!$pythonToUse -or !(Test-Path $pythonToUse)) {
  throw "No working Python runtime was available for the ML service."
}

Write-Host "Using Python runtime: $pythonToUse"

Push-Location $mlDir
try {
  & $pythonToUse app.py
} finally {
  Pop-Location
}
