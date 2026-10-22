import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageFile } from './auth.storage';

type AxeViolation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

test.use({ storageState: authStorageFile });

/**
 * Do not .disableRules() just to go green. Real axe findings are product
 * defects — attach them for the jira-bug-reporter skill.
 *
 * Disable a rule only with a commented reason, e.g.:
 *   .disableRules(['duplicate-id']) // vendor widget injects a duplicate id
 */
async function expectNoAxeViolations(violations: AxeViolation[]) {
  if (violations.length > 0) {
    await test.info().attach('axe-violations.json', {
      body: Buffer.from(
        JSON.stringify(
          violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              failureSummary: n.failureSummary,
            })),
          })),
          null,
          2,
        ),
      ),
      contentType: 'application/json',
    });
  }

  await expect(violations).toEqual([]);
}

test.describe('Programs accessibility', () => {
  test.skip(!!process.env.CI, 'Axe findings are not a CI gate.');

  test('Programs page has no accessibility violations', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    await expectNoAxeViolations(results.violations);
  });

  test('New Program modal has no accessibility violations', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const form = programs.newProgramModal;

    await programs.goto();
    await programs.openNewProgramForm();
    await expect(form.dialog).toBeVisible();
    await expect(form.programName).toBeVisible();

    const results = await new AxeBuilder({ page }).include(form.axeIncludeSelector).analyze();
    await expectNoAxeViolations(results.violations);
  });
});
