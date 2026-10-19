import { expect, test as setup } from '@playwright/test';
import { authStorageFile, ensureAuthStorageDir } from './auth.storage';
import { DIDAXIS_URL, requireCredentials } from './didaxis-helpers';

const loginUrl = `${DIDAXIS_URL.replace(/\/$/, '')}/login`;

setup.setTimeout(90_000);

setup('authenticate', async ({ page }) => {
  const { email, password } = requireCredentials();

  await page.goto(loginUrl);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({
    timeout: 60_000,
  });
  await page.goto(`${DIDAXIS_URL}/programs`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible({
    timeout: 60_000,
  });

  ensureAuthStorageDir();
  await page.context().storageState({ path: authStorageFile });
});
