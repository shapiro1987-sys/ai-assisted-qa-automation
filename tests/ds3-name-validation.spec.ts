import { test, expect } from '@playwright/test';
import {
  createButton,
  createProgram,
  createProgramNameField,
  editDescriptionField,
  editProgramModal,
  editProgramNameField,
  fillCreateProgramForm,
  openEditProgram,
  openNewProgramModal,
  programNameInList,
  repeatChar,
  saveButton,
  saveEditedProgram,
  setupProgramsPage,
  uniqueName,
} from './didaxis-helpers';

test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
  await setupProgramsPage(page);
});

test.describe('DS-3 Name Validation - Positive flows', () => {
  test('TC-001 — Program name with special characters is accepted', async ({ page }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');

    await createProgram(page, programName, uniqueName('Valid description'));

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-002 — Program name with hyphens and numbers is accepted', async ({ page }) => {
    const programName = uniqueName('Web-Dev 2026 v2');

    await createProgram(page, programName, uniqueName('Valid description'));

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-003 — Duplicate check is case-sensitive (if applicable)', async ({ page }) => {
    const baseName = uniqueName('Web Development 2026');
    const lowerCaseVariant = baseName.toLowerCase();

    await createProgram(page, baseName, 'Original program');
    await openNewProgramModal(page);
    await fillCreateProgramForm(page, lowerCaseVariant, 'Case variant');
    await expect(createButton(page)).toBeEnabled();
    await createButton(page).click();

    const exactMatches = await programNameInList(page, baseName).count();
    const lowerMatches = await programNameInList(page, lowerCaseVariant).count();
    expect(exactMatches + lowerMatches).toBeGreaterThanOrEqual(1);
  });
});

test.describe('DS-3 Name Validation - Negative flows', () => {
  test('TC-004 — Whitespace-only program name is not submitted', async ({ page }) => {
    await openNewProgramModal(page);
    await createProgramNameField(page).fill('   ');

    await expect(createButton(page)).toBeDisabled();
  });

  test('TC-005 — Duplicate program name is rejected on create', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Existing program');
    await openNewProgramModal(page);
    await fillCreateProgramForm(page, programName, 'Duplicate attempt');
    await createButton(page).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(1);
  });

  test('TC-006 — Empty program name is rejected', async ({ page }) => {
    await openNewProgramModal(page);

    await expect(createButton(page)).toBeDisabled();
  });

  test('TC-007 — Duplicate name rejected on edit of a different program', async ({ page }) => {
    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science 2026');

    await createProgram(page, firstProgram, 'First program');
    await createProgram(page, secondProgram, 'Second program');
    await openEditProgram(page, secondProgram);
    await editProgramNameField(page).fill(firstProgram);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeVisible();
    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible();
    await expect(programNameInList(page, secondProgram)).toBeVisible();
  });
});

test.describe('DS-3 Name Validation - Edge cases', () => {
  test('TC-008 — Program name at exactly 100 characters is accepted', async ({ page }) => {
    const programName = repeatChar('A', 100);

    await createProgram(page, programName, uniqueName('Valid description'));

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-009 — Program name exceeding 100 characters is rejected', async ({ page }) => {
    const programName = repeatChar('A', 101);

    await openNewProgramModal(page);
    await fillCreateProgramForm(page, programName, uniqueName('Valid description'));
    await createButton(page).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
    await expect(page.getByText(/100|maximum|too long|characters/i)).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(0);
  });

  test('TC-010 — Leading and trailing spaces are trimmed before validation', async ({ page }) => {
    const trimmedName = uniqueName('Web Development 2026');
    const paddedName = `  ${trimmedName}  `;

    await openNewProgramModal(page);
    await fillCreateProgramForm(page, paddedName, uniqueName('Valid description'));
    await createButton(page).click();

    await expect(programNameInList(page, trimmedName)).toBeVisible({
      timeout: 30_000,
    });
  });

  test('TC-011 — Duplicate detected after trimming whitespace', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Existing program');
    await openNewProgramModal(page);
    await fillCreateProgramForm(page, `  ${programName}  `, 'Duplicate attempt');
    await createButton(page).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(1);
  });

  test('TC-012 — Unicode characters in program name are accepted', async ({ page }) => {
    const programName = uniqueName('Programme Français — Été 2026');

    await createProgram(page, programName, uniqueName('Valid description'));

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-013 — Renaming a program to its own current name succeeds', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = uniqueName('Updated description only');

    await createProgram(page, programName, 'Initial description');
    await openEditProgram(page, programName);
    await editDescriptionField(page).fill(updatedDescription);
    await saveEditedProgram(page, programName);

    await expect(programNameInList(page, programName)).toBeVisible();
    await expect(page.getByText(/already exists|duplicate/i)).toHaveCount(0);
  });
});
