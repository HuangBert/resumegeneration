$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "launcher\ResumeLauncherLegacy.cs"
$outputDir = Join-Path $root "tools"
$output = Join-Path $outputDir "ResumeLauncher.exe"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
Add-Type -Path $source -OutputAssembly $output -OutputType ConsoleApplication

Write-Host "Built $output"
