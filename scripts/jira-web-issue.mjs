import 'dotenv/config';
import { chromium } from 'playwright';

const base = process.env.ATLASSIAN_BASE_URL?.replace(/\/$/, '');
const email = process.env.JIRA_LOGIN_EMAIL ?? process.env.ATLASSIAN_EMAIL;
const password = process.env.JIRA_LOGIN_PASSWORD;
const issueKey = process.argv[2] ?? 'DS-1';

if (!base || !email || !password) {
  console.error('Missing ATLASSIAN_BASE_URL, JIRA_LOGIN_EMAIL/ATLASSIAN_EMAIL, or JIRA_LOGIN_PASSWORD');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const emailInput = page.locator('input#username, input[name="username"], input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 30_000 });
  await emailInput.fill(email);
  await page.getByRole('button', { name: /continue|log in|sign in|next/i }).click();

  const passwordInput = page.locator('input#password, input[name="password"], input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 30_000 });
  await passwordInput.fill(password);
  await page.getByRole('button', { name: /log in|sign in|continue/i }).click();

  await page.goto(`${base}/browse/${issueKey}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  await page.waitForTimeout(3000);

  const title = await page.title();
  const summary =
    (await page.locator('[data-testid="issue.views.issue-base.foundation.summary.heading"]').textContent().catch(() => null)) ??
    (await page.locator('h1').first().textContent().catch(() => null));

  const status = await page
    .locator('[data-testid="issue-field-status.ui.status-view.status-button"]')
    .textContent()
    .catch(() => null);

  const description = await page
    .locator('[data-testid="issue.views.field.rich-text.description"]')
    .innerText()
    .catch(async () => page.locator('#description-val').innerText().catch(() => ''));

  const bodyText = await page.locator('body').innerText();
  const notFound = /doesn.?t exist|not found|无权|不存在|permission/i.test(bodyText);

  console.log(
    JSON.stringify(
      {
        key: issueKey,
        url: `${base}/browse/${issueKey}`,
        pageTitle: title.trim(),
        summary: summary?.trim() ?? null,
        status: status?.trim() ?? null,
        description: description?.trim() ?? null,
        notFoundOrDenied: notFound,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
