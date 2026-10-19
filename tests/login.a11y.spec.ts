import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../pages/LoginPage';

type AxeViolation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

/** Logged-out tests must not reuse playwright/.auth/user.json. */
test.use({ storageState: { cookies: [], origins: [] } });

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

test.describe('Login accessibility', () => {
  test('Login page has no accessibility violations', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.email).toBeVisible();
    await expect(login.password).toBeVisible();
    await expect(login.signInButton).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    await expectNoAxeViolations(results.violations);
  });
});
