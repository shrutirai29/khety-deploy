$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$mlDir = Join-Path $projectRoot "khety-backend\khety-ml"
$pythonPath = "C:\Users\shrut\AppData\Local\Programs\Python\Python310\python.exe"
$venvDir = Join-Path $mlDir "venv"
$requirementsPath = Join-Path $mlDir "requirements.txt"

if (!(Test-Path $pythonPath)) {
  throw "Python 3.10 was not found at $pythonPath. Install Python 3.10 and rerun npm run setup:ml."
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
