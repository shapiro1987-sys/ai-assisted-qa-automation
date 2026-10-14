import { expect, type Page } from '@playwright/test';

export const DIDAXIS_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

export function requireCredentials() {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;

  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }

  return { email: email.trim(), password: password.trim() };
}

export function uniqueName(base: string) {
  return `${base} ${Date.now()}`;
}

export function repeatChar(char: string, count: number) {
  return char.repeat(count);
}

export function programsHeading(page: Page) {
  return page.getByRole('heading', { name: 'Programs', level: 2 });
}

export function newProgramButton(page: Page) {
  return page.getByRole('button', { name: '+ New Program' });
}

/** Program row anchor — stable on large lists (5k+ programs). */
export function programNameInList(page: Page, programName: string) {
  return page.getByRole('button', { name: `Edit ${programName}`, exact: true });
}

export function programListEntry(page: Page, programName: string) {
  return page
    .locator('main')
    .locator('*')
    .filter({ has: page.getByRole('button', { name: `Delete ${programName}`, exact: true }) })
    .first();
}

export function editProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Edit ${programName}`, exact: true });
}

export function deleteProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Delete ${programName}`, exact: true });
}

export function newProgramModal(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

export function editProgramModal(page: Page) {
  return page.getByRole('dialog', { name: 'Edit Program' });
}

export function createProgramNameField(page: Page) {
  return newProgramModal(page).getByRole('textbox', { name: 'Program Name' });
}

export function createDescriptionField(page: Page) {
  return newProgramModal(page).getByRole('textbox', { name: 'Description' });
}

export function createButton(page: Page) {
  return newProgramModal(page).getByRole('button', { name: 'Create', exact: true });
}

export function cancelCreateButton(page: Page) {
  return newProgramModal(page).getByRole('button', { name: 'Cancel', exact: true });
}

export function showAiGenerationConfigButton(page: Page) {
  return newProgramModal(page).getByRole('button', {
    name: /Show AI Generation Config/i,
  });
}

export function newProgramModalHeading(page: Page) {
  return newProgramModal(page).getByRole('heading', { name: 'New Program', level: 2 });
}

export function editProgramNameField(page: Page) {
  return editProgramModal(page).getByRole('textbox', { name: 'Program Name' });
}

export function editDescriptionField(page: Page) {
  return editProgramModal(page).getByRole('textbox', { name: 'Description' });
}

export function saveButton(page: Page) {
  return editProgramModal(page).getByRole('button', { name: 'Save', exact: true });
}

export function cancelEditButton(page: Page) {
  return editProgramModal(page).getByRole('button', { name: 'Cancel', exact: true });
}

export function editProgramModalHeading(page: Page) {
  return editProgramModal(page).getByRole('heading', { name: 'Edit Program', level: 2 });
}

export function showEditAiGenerationConfigButton(page: Page) {
  return editProgramModal(page).getByRole('button', {
    name: /Show AI Generation Config/i,
  });
}

export async function login(page: Page) {
  const { email, password } = requireCredentials();
  const signOut = page.getByRole('button', { name: 'Sign out' });
  const signIn = page.getByRole('button', { name: 'Sign In' });

  await page.goto(`${DIDAXIS_URL}/programs`, { waitUntil: 'domcontentloaded' });
  if (await signOut.isVisible({ timeout: 15_000 }).catch(() => false)) {
    return;
  }
  if (await newProgramButton(page).isVisible({ timeout: 5_000 }).catch(() => false)) {
    return;
  }

  await page.goto(`${DIDAXIS_URL}/login`, { waitUntil: 'domcontentloaded' });
  const emailField = page.getByLabel('Email');
  const passwordField = page.getByLabel('Password');

  await emailField.fill(email);
  await passwordField.fill(password);
  await passwordField.press('Tab');

  if (await signIn.isEnabled().catch(() => false)) {
    await signIn.click();
  } else {
    await passwordField.press('Enter');
  }

  await expect(signOut).toBeVisible({ timeout: 60_000 });
}

export async function goToPrograms(page: Page) {
  await page.goto(`${DIDAXIS_URL}/programs`, { waitUntil: 'domcontentloaded' });
  const newProgram = newProgramButton(page);
  const onLoginPage = page.getByLabel('Email');

  if (await onLoginPage.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await login(page);
    await page.goto(`${DIDAXIS_URL}/programs`, { waitUntil: 'domcontentloaded' });
  }

  await expect(newProgram).toBeVisible({ timeout: 60_000 });
  await expect(programsHeading(page)).toBeVisible({ timeout: 15_000 });
}

export async function openNewProgramModal(page: Page) {
  await newProgramButton(page).click();
  await expect(newProgramModal(page)).toBeVisible();
  await expect(createProgramNameField(page)).toBeVisible();
}

export async function fillCreateProgramForm(
  page: Page,
  programName: string,
  description = '',
) {
  await createProgramNameField(page).click();
  await createProgramNameField(page).fill(programName);

  if (description) {
    await createDescriptionField(page).click();
    await createDescriptionField(page).fill(description);
  }
}

export async function expectProgramInList(page: Page, programName: string) {
  await expect(newProgramModal(page)).not.toBeVisible({ timeout: 30_000 });
  const edit = programNameInList(page, programName).first();
  await edit.scrollIntoViewIfNeeded();
  await expect(edit).toBeVisible({ timeout: 60_000 });
}

export async function expectCreateProgramRejected(
  page: Page,
  reason: RegExp = /already exists|duplicate|unique/i,
) {
  const modal = newProgramModal(page);
  await expect(modal).toBeVisible({ timeout: 15_000 });
  await expect(modal.getByText(reason)).toBeVisible({ timeout: 30_000 });
}

export async function expectProgramNotInList(page: Page, programName: string) {
  await expect(programNameInList(page, programName)).toHaveCount(0, {
    timeout: 30_000,
  });
}

export async function createProgram(
  page: Page,
  programName: string,
  description = '',
) {
  await openNewProgramModal(page);
  await fillCreateProgramForm(page, programName, description);
  const create = createButton(page);
  await expect(create).toBeEnabled();
  await create.scrollIntoViewIfNeeded();
  await create.click();
  await expectProgramInList(page, programName);
}

export async function openEditProgram(page: Page, programName: string) {
  await editProgramButton(page, programName).scrollIntoViewIfNeeded();
  await editProgramButton(page, programName).click();
  await expect(editProgramModal(page)).toBeVisible();
}

export async function fillEditProgramForm(
  page: Page,
  programName: string,
  description?: string,
) {
  await editProgramNameField(page).click();
  await editProgramNameField(page).fill(programName);

  if (description !== undefined) {
    await editDescriptionField(page).click();
    await editDescriptionField(page).fill(description);
  }
}

export async function saveEditedProgram(page: Page, expectedName: string) {
  const save = saveButton(page);
  await expect(save).toBeEnabled();
  await save.scrollIntoViewIfNeeded();
  await save.click();
  await expect(editProgramModal(page)).not.toBeVisible({ timeout: 60_000 });
  await expect(programNameInList(page, expectedName)).toBeVisible({
    timeout: 60_000,
  });
}

export async function confirmDeleteDialog(
  page: Page,
  programName: string,
  action: 'accept' | 'dismiss' = 'accept',
) {
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain(programName);
    if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

export async function deleteProgram(page: Page, programName: string) {
  await confirmDeleteDialog(page, programName, 'accept');
  await deleteProgramButton(page, programName).scrollIntoViewIfNeeded();
  await deleteProgramButton(page, programName).click();
  await expectProgramNotInList(page, programName);
}

export async function cancelDeleteProgram(page: Page, programName: string) {
  await confirmDeleteDialog(page, programName, 'dismiss');
  await deleteProgramButton(page, programName).scrollIntoViewIfNeeded();
  await deleteProgramButton(page, programName).click();
  await expectProgramInList(page, programName);
}

export async function setupProgramsPage(page: Page) {
  await login(page);
  await goToPrograms(page);
}
