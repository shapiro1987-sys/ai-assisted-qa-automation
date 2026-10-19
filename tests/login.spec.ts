import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProgramsPage } from '../pages/ProgramsPage';

/** Logged-out tests must not reuse playwright/.auth/user.json. */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Didaxis login page', () => {
  test('shows Email, Password, and Sign In when unauthenticated', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.email).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('programs redirects to login without a stored session', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const loginPage = new LoginPage(page);
    await programs.goto();

    await expect(loginPage.email).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });
});
