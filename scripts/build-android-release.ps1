$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$shortRoot = 'C:\o'

if (Test-Path $shortRoot) {
    if ((Get-Item $shortRoot).LinkType -eq 'Junction') {
        Remove-Item $shortRoot -Force -Recurse
    }
}

New-Item -ItemType Directory -Path $shortRoot -Force | Out-Null

$excludeDirs = @('.git', '.expo', 'android/.cxx', 'android/app/.cxx', 'android/build', 'android/app/build')
$robocopyArgs = @($repoRoot, $shortRoot, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/R:2', '/W:2')
foreach ($dir in $excludeDirs) {
    $robocopyArgs += ('/XD')
    $robocopyArgs += $dir
}

& robocopy @robocopyArgs | Out-Null
if ($LASTEXITCODE -ge 8) {
    throw "Failed to copy project to the short path $shortRoot"
}

$env:NODE_ENV = 'production'

Write-Host "Building from $shortRoot"
Set-Location "$shortRoot\android"
& .\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a --console=plain
