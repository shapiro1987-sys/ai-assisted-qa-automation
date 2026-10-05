import path from 'path';
import { test as setup } from '@playwright/test';
import { login } from './didaxis-helpers';

export const didaxisAuthFile = path.join(__dirname, '.didaxis-auth.json');

setup.setTimeout(90_000);

setup('authenticate didaxis admin', async ({ page }) => {
  await login(page);
  await page.context().storageState({ path: didaxisAuthFile });
});
