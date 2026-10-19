$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$results = @()

function Add-Step($name, $ms) {
  $results += [pscustomobject]@{ Step = $name; Seconds = [math]::Round($ms / 1000, 1) }
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()
npx playwright test tests/auth.setup.ts --project=setup | Out-Host
Add-Step "auth.setup" $sw.ElapsedMilliseconds
$sw.Restart()

$testOut = npx playwright test tests/ds1-create-program.spec.ts --project=chromium 2>&1 | Out-String
$testOut | Out-Host
Add-Step "ds1-create-program.spec (all tests)" $sw.ElapsedMilliseconds
$sw.Stop()

$deleted = [regex]::Matches($testOut, '\[api-cleanup\] Deleted program ([0-9a-f-]{36})') | ForEach-Object { $_.Groups[1].Value }
$failed = [regex]::Match($testOut, '(\d+) failed').Groups[1].Value
$passed = [regex]::Match($testOut, '(\d+) passed').Groups[1].Value

Write-Host ""
Write-Host "=== Timing ==="
$results | Format-Table -AutoSize
$total = ($results | Measure-Object -Property Seconds -Sum).Sum
Write-Host ("Total: {0} s ({1} min)" -f $total, [math]::Round($total / 60, 2))
Write-Host "Passed: $passed  Failed: $failed  Programs deleted (api-cleanup): $($deleted.Count)"

if ($deleted.Count -gt 0) {
  $sw2 = [System.Diagnostics.Stopwatch]::StartNew()
  npx tsx scripts/verify-program-ids.ts @deleted | Out-Host
  Add-Step "API verify deleted IDs" $sw2.ElapsedMilliseconds
  $sw2.Stop()
}

if ($failed -and [int]$failed -gt 0) { exit 1 }
