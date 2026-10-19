import { test, expect } from '@playwright/test';
import { DIDAXIS_URL } from './didaxis-helpers';

/** Logged-out tests must not reuse playwright/.auth/user.json. */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Didaxis login page', () => {
  test('shows Email, Password, and Sign In when unauthenticated', async ({ page }) => {
    await page.goto(`${DIDAXIS_URL}/login`);

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('programs redirects to login without a stored session', async ({ page }) => {
    await page.goto(`${DIDAXIS_URL}/programs`);

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
