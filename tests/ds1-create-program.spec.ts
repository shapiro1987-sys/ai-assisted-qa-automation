import { test, expect, type Page } from '@playwright/test';

const DIDAXIS_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

test.setTimeout(90_000);

function requireCredentials() {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;

  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }

  return { email, password };
}

function uniqueName(base: string) {
  return `${base} ${Date.now()}`;
}

function repeatChar(char: string, count: number) {
  return char.repeat(count);
}

function programsHeading(page: Page) {
  return page.getByRole('heading', { name: 'Programs', level: 2 });
}

function newProgramButton(page: Page) {
  return page.getByRole('button', { name: '+ New Program' });
}

function programNameInList(page: Page, programName: string) {
  return page.getByText(programName, { exact: true });
}

function newProgramModal(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

function programNameField(page: Page) {
  return newProgramModal(page).getByRole('textbox', { name: 'Program Name' });
}

function descriptionField(page: Page) {
  return newProgramModal(page).getByRole('textbox', { name: 'Description' });
}

function createButton(page: Page) {
  return newProgramModal(page).getByRole('button', { name: 'Create', exact: true });
}

async function login(page: Page) {
  const { email, password } = requireCredentials();

  await page.goto(`${DIDAXIS_URL}/login`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
}

async function goToPrograms(page: Page) {
  await page.goto(`${DIDAXIS_URL}/programs`);
  await expect(programsHeading(page)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Manage academic programs and semesters')).toBeVisible();
  await expect(newProgramButton(page)).toBeVisible();
}

async function openNewProgramModal(page: Page) {
  await newProgramButton(page).click();
  await expect(newProgramModal(page)).toBeVisible();
  await expect(programNameField(page)).toBeVisible();
}

async function fillProgramForm(
  page: Page,
  programName: string,
  description = '',
) {
  await programNameField(page).click();
  await programNameField(page).fill(programName);

  if (description) {
    await descriptionField(page).click();
    await descriptionField(page).fill(description);
  }
}

async function expectProgramInList(page: Page, programName: string) {
  await expect(newProgramModal(page)).not.toBeVisible({ timeout: 30_000 });
  await expect(programNameInList(page, programName)).toBeVisible({
    timeout: 30_000,
  });
}

async function createProgram(
  page: Page,
  programName: string,
  description = '',
) {
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await expect(createButton(page)).toBeEnabled();
  await createButton(page).click();
  await expectProgramInList(page, programName);
}

test.beforeEach(async ({ page }) => {
  await login(page);
  await goToPrograms(page);
});

test.describe('DS-1 Create Program - Positive flows', () => {
  test('TC-001 — Program creation form displays required fields', async ({ page }) => {
    await openNewProgramModal(page);

    await expect(programNameField(page)).toBeVisible();
    await expect(descriptionField(page)).toBeVisible();
  });

  test('TC-002 — New program appears in list after successful creation', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = uniqueName('Full-stack web development program');

    await createProgram(page, programName, description);

    await expect(page.getByText(description, { exact: true })).toBeVisible({
      timeout: 30_000,
    });
  });

  test('TC-003 — Program can be created with name only and empty description', async ({ page }) => {
    const programName = uniqueName('Data Science 2026');

    await openNewProgramModal(page);
    await fillProgramForm(page, programName);
    await expect(createButton(page)).toBeEnabled();
    await createButton(page).click();

    await expectProgramInList(page, programName);
  });
});

test.describe('DS-1 Create Program - Negative flows', () => {
  test('TC-004 — Create button remains disabled when Program Name is empty', async ({ page }) => {
    await openNewProgramModal(page);

    await descriptionField(page).fill('Optional description for empty name test');

    await expect(createButton(page)).toBeDisabled();
  });

  test('TC-005 — Duplicate program name is rejected on create', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Initial program');
    await openNewProgramModal(page);
    await fillProgramForm(page, programName, 'Duplicate attempt');
    await expect(createButton(page)).toBeEnabled();
    await createButton(page).click();

    await expect(newProgramModal(page)).toBeVisible();
    await expect(newProgramModal(page).getByText(/already exists|duplicate/i)).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(1);
  });

  test('TC-006 — Double-clicking Create does not create duplicate programs', async ({ page }) => {
    const programName = uniqueName('Mobile Development 2026');
    const description = 'iOS and Android development';

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, description);

    const create = createButton(page);
    await expect(create).toBeEnabled();
    await create.dblclick();

    await expect(programNameInList(page, programName)).toHaveCount(1, {
      timeout: 30_000,
    });
    await expect(newProgramModal(page)).not.toBeVisible({ timeout: 30_000 });
  });
});

test.describe('DS-1 Create Program - Edge cases', () => {
  test('TC-007 — Program name at maximum length (100 characters) is accepted', async ({ page }) => {
    const programName = repeatChar('A', 100);
    const description = 'Valid description';

    await createProgram(page, programName, description);

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-008 — Program name exceeding 100 characters is rejected', async ({ page }) => {
    const programName = repeatChar('A', 101);
    const description = 'Valid description';

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, description);
    await createButton(page).click();

    const modal = newProgramModal(page);
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText(/100|maximum|too long|characters/i),
    ).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(0);
  });

  test('TC-009 — Description at maximum length (500 characters) is accepted', async ({ page }) => {
    const programName = uniqueName('Cloud Computing 2026');
    const description = repeatChar('D', 500);

    await createProgram(page, programName, description);

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-010 — Description exceeding 500 characters is rejected', async ({ page }) => {
    const programName = uniqueName('DevOps 2026');
    const description = repeatChar('D', 501);

    await openNewProgramModal(page);
    await fillProgramForm(page, programName, description);
    await createButton(page).click();

    const modal = newProgramModal(page);
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText(/500|maximum|too long|characters/i),
    ).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(0);
  });

  test('TC-011 — Program name with special characters is accepted', async ({ page }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    const description = 'Advanced AI program';

    await createProgram(page, programName, description);

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-012 — Whitespace-only Program Name is treated as empty', async ({ page }) => {
    await openNewProgramModal(page);

    await programNameField(page).fill('   ');

    await expect(createButton(page)).toBeDisabled();
  });
});
