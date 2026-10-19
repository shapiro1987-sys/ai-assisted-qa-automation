$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Measure-Playwright($label, [string[]]$playwrightArgs) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  & npx playwright @playwrightArgs 2>&1 | Out-Host
  $sw.Stop()
  if ($LASTEXITCODE -ne 0) { throw "$label failed (exit $LASTEXITCODE)" }
  return [math]::Round($sw.Elapsed.TotalSeconds, 1)
}

$legacyPath = Join-Path $root "tests\_benchmark-legacy-login.spec.ts"
@'
import { test, expect } from '@playwright/test';
import {
  login,
  programsHeading,
  newProgramButton,
  DIDAXIS_URL,
} from './didaxis-helpers';

test.describe.configure({ mode: 'serial' });
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await login(page);
  await page.goto(`${DIDAXIS_URL}/programs`, { waitUntil: 'domcontentloaded' });
  await expect(newProgramButton(page)).toBeVisible({ timeout: 60_000 });
});

test('legacy navigation 1', async ({ page }) => {
  await expect(programsHeading(page)).toBeVisible();
});

test('legacy navigation 2', async ({ page }) => {
  await expect(newProgramButton(page)).toBeVisible();
});
'@ | Set-Content -Encoding utf8 $legacyPath

Write-Host "=== 1) One-time auth setup ==="
$setupSec = Measure-Playwright "setup" @("test", "--project=setup")

Write-Host "`n=== 2) DS-1 + DS-2 with stored session (current) ==="
$suiteSec = Measure-Playwright "ds1+ds2" @(
  "test",
  "tests/ds1-create-program.spec.ts",
  "tests/ds2-edit-program.spec.ts",
  "--project=chromium",
  "--reporter=list"
)

Write-Host "`n=== 3) Legacy: fresh context + UI login before each test (2-sample) ==="
try {
  $legacySec = Measure-Playwright "legacy sample" @(
    "test",
    "tests/_benchmark-legacy-login.spec.ts",
    "--project=chromium",
    "--reporter=list"
  )
} finally {
  Remove-Item $legacyPath -Force -ErrorAction SilentlyContinue
}

$dsBeforeEachCount = 26
$legacyPerTest = [math]::Round($legacySec / 2, 1)
$estimatedLegacySuite = [math]::Round($legacyPerTest * $dsBeforeEachCount, 0)

Write-Host "`n========== RESULTS =========="
Write-Host ("Auth setup (once):            {0,7} s" -f $setupSec)
Write-Host ("DS-1 + DS-2 (stored session): {0,7} s" -f $suiteSec)
Write-Host ("Total (setup + suite):        {0,7} s" -f ($setupSec + $suiteSec))
Write-Host ""
Write-Host ("Legacy sample (2 tests, login each beforeEach): {0} s (~{1} s/test)" -f $legacySec, $legacyPerTest)
Write-Host ("Estimated legacy DS-1+DS-2 ({0} beforeEach logins):" -f $dsBeforeEachCount) -NoNewline
Write-Host (" ~{0} s" -f $estimatedLegacySuite)
$saved = $estimatedLegacySuite - $suiteSec
if ($saved -gt 0) {
  $pct = [math]::Round(100 * $saved / $estimatedLegacySuite, 0)
  Write-Host ("Approx. suite time saved vs per-test UI login: ~{0} s (~{1}% on suite body)" -f $saved, $pct)
}
