$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$mlDir = Join-Path $projectRoot "khety-backend\khety-ml"
$preferredPythonPath = "C:\Users\shrut\AppData\Local\Programs\Python\Python310\python.exe"
$bundledPythonPath = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$venvDir = Join-Path $mlDir "venv"
$requirementsPath = Join-Path $mlDir "requirements.txt"

$pythonPath = $null

if (Test-Path $bundledPythonPath) {
  $pythonPath = $bundledPythonPath
} elseif (Test-Path $preferredPythonPath) {
  $pythonPath = $preferredPythonPath
}

if (!$pythonPath) {
  throw "No usable Python runtime was found. Install Python 3.10+ or use the Codex bundled runtime and rerun npm run setup:ml."
}

if (Test-Path $venvDir) {
  $cfgPath = Join-Path $venvDir "pyvenv.cfg"
  $needsReset = $false

  if (!(Test-Path $cfgPath)) {
    $needsReset = $true
  } else {
    $cfgContent = Get-Content $cfgPath -Raw
    if ($cfgContent -notmatch [regex]::Escape($pythonPath.Replace("\python.exe", ""))) {
      $needsReset = $true
    }
  }

  if ($needsReset) {
    Remove-Item -Recurse -Force $venvDir
  }
}

if (!(Test-Path $venvDir)) {
  & $pythonPath -m venv $venvDir
}

$venvPython = Join-Path $venvDir "Scripts\python.exe"

& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r $requirementsPath
