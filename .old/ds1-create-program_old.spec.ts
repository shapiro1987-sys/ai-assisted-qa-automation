import { test, expect } from '@playwright/test';
import {
  cancelEditButton,
  createDescriptionField,
  createProgram,
  createProgramNameField,
  createButton,
  editDescriptionField,
  editProgramNameField,
  editProgramModal,
  fillCreateProgramForm,
  fillEditProgramForm,
  openEditProgram,
  openNewProgramModal,
  programNameInList,
  repeatChar,
  saveButton,
  setupProgramsPage,
  uniqueName,
} from '../tests/didaxis-helpers';

test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
  await setupProgramsPage(page);
});

test.describe('DS-1 Create Program - Positive flows', () => {
  test('TC-001 — Program creation form displays required fields', async ({ page }) => {
    await openNewProgramModal(page);

    await expect(createProgramNameField(page)).toBeVisible();
    await expect(createDescriptionField(page)).toBeVisible();
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
    await fillCreateProgramForm(page, programName);
    await expect(createButton(page)).toBeEnabled();
    await createButton(page).click();

    await expect(programNameInList(page, programName)).toBeVisible({
      timeout: 30_000,
    });
  });
});

test.describe('DS-1 Create Program - Negative flows', () => {
  test('TC-004 — Create button remains disabled when Program Name is empty', async ({ page }) => {
    await openNewProgramModal(page);

    await createDescriptionField(page).fill('Optional description for empty name test');

    await expect(createButton(page)).toBeDisabled();
  });

  test('TC-005 — Duplicate program name is rejected on create', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Initial program');
    await openNewProgramModal(page);
    await fillCreateProgramForm(page, programName, 'Duplicate attempt');
    await expect(createButton(page)).toBeEnabled();
    await createButton(page).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(1);
  });

  test('TC-006 — Double-clicking Create does not create duplicate programs', async ({ page }) => {
    const programName = uniqueName('Mobile Development 2026');
    const description = 'iOS and Android development';

    await openNewProgramModal(page);
    await fillCreateProgramForm(page, programName, description);

    const create = createButton(page);
    await expect(create).toBeEnabled();
    await create.dblclick();

    await expect(programNameInList(page, programName)).toHaveCount(1, {
      timeout: 30_000,
    });
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
    await fillCreateProgramForm(page, programName, description);
    await createButton(page).click();

    const modal = page.getByRole('dialog', { name: 'New Program' });
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/100|maximum|too long|characters/i)).toBeVisible();
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
    await fillCreateProgramForm(page, programName, description);
    await createButton(page).click();

    const modal = page.getByRole('dialog', { name: 'New Program' });
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/500|maximum|too long|characters/i)).toBeVisible();
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

    await createProgramNameField(page).fill('   ');

    await expect(createButton(page)).toBeDisabled();
  });
});
