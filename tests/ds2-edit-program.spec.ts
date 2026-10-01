import { test, expect } from '@playwright/test';
import {
  cancelEditButton,
  createProgram,
  editDescriptionField,
  editProgramModal,
  editProgramNameField,
  fillEditProgramForm,
  openEditProgram,
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

test.describe('DS-2 Edit Program - Positive flows', () => {
  test('TC-001 — Edit form opens pre-populated with current program data', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const description = uniqueName('Full-stack web development program');

    await createProgram(page, programName, description);
    await openEditProgram(page, programName);

    await expect(editProgramNameField(page)).toHaveValue(programName);
    await expect(editDescriptionField(page)).toHaveValue(description);
  });

  test('TC-002 — Updated program name appears immediately in the list', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = uniqueName('Web Development 2026 - Updated');

    await createProgram(page, programName, 'Original curriculum');
    await openEditProgram(page, programName);
    await fillEditProgramForm(page, updatedName);
    await saveEditedProgram(page, updatedName);

    await expect(programNameInList(page, updatedName)).toBeVisible();
    await expect(programNameInList(page, programName)).toHaveCount(0);
  });

  test('TC-003 — Unchanged fields are preserved when only Description is edited', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const originalDescription = uniqueName('Full-stack web development program');
    const updatedDescription = uniqueName('Updated full-stack curriculum');

    await createProgram(page, programName, originalDescription);
    await openEditProgram(page, programName);
    await editDescriptionField(page).fill(updatedDescription);
    await saveEditedProgram(page, programName);

    await expect(programNameInList(page, programName)).toBeVisible();
    await expect(page.getByText(updatedDescription, { exact: true })).toBeVisible();
  });

  test('TC-004 — Description can be cleared during edit', async ({ page }) => {
    const programName = uniqueName('Data Science 2026');

    await createProgram(page, programName, uniqueName('Original description'));
    await openEditProgram(page, programName);
    await editDescriptionField(page).fill('');
    await saveEditedProgram(page, programName);

    await expect(programNameInList(page, programName)).toBeVisible();
  });
});

test.describe('DS-2 Edit Program - Negative flows', () => {
  test('TC-005 — Save button disabled when Program Name is cleared', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Seed description');
    await openEditProgram(page, programName);
    await editProgramNameField(page).fill('');

    await expect(saveButton(page)).toBeDisabled();
  });

  test('TC-006 — Duplicate name on edit is rejected', async ({ page }) => {
    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science 2026');

    await createProgram(page, firstProgram, 'First program');
    await createProgram(page, secondProgram, 'Second program');
    await openEditProgram(page, secondProgram);
    await fillEditProgramForm(page, firstProgram);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeVisible();
    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible();
    await expect(programNameInList(page, secondProgram)).toBeVisible();
  });

  test('TC-007 — Cancel discards unsaved changes', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Keep this name');
    await openEditProgram(page, programName);
    await editProgramNameField(page).fill('Should Not Be Saved');
    await cancelEditButton(page).click();

    await expect(editProgramModal(page)).not.toBeVisible();
    await expect(programNameInList(page, programName)).toBeVisible();
    await expect(programNameInList(page, 'Should Not Be Saved')).toHaveCount(0);
  });

  test('TC-008 — Double-clicking Save does not apply changes twice', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = uniqueName('Updated once');

    await createProgram(page, programName, 'Initial description');
    await openEditProgram(page, programName);
    await editDescriptionField(page).fill(updatedDescription);

    const save = saveButton(page);
    await expect(save).toBeEnabled();
    await save.dblclick();

    await expect(editProgramModal(page)).not.toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(updatedDescription, { exact: true })).toHaveCount(1);
  });
});

test.describe('DS-2 Edit Program - Edge cases', () => {
  test('TC-009 — Program name at maximum length (100 characters) is accepted on edit', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = repeatChar('B', 100);

    await createProgram(page, programName, 'Valid description');
    await openEditProgram(page, programName);
    await fillEditProgramForm(page, updatedName);
    await saveEditedProgram(page, updatedName);

    await expect(programNameInList(page, updatedName)).toBeVisible();
  });

  test('TC-010 — Program name exceeding 100 characters is rejected on edit', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const tooLongName = repeatChar('B', 101);

    await createProgram(page, programName, 'Valid description');
    await openEditProgram(page, programName);
    await fillEditProgramForm(page, tooLongName);
    await saveButton(page).click();

    await expect(editProgramModal(page)).toBeVisible();
    await expect(editProgramModal(page).getByText(/100|maximum|too long|characters/i)).toBeVisible();
    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-011 — Description at maximum length (500 characters) is accepted on edit', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = repeatChar('D', 500);

    await createProgram(page, programName, 'Short description');
    await openEditProgram(page, programName);
    await editDescriptionField(page).fill(updatedDescription);
    await saveEditedProgram(page, programName);

    await expect(page.getByText(updatedDescription, { exact: true })).toBeVisible();
  });

  test('TC-012 — Whitespace-only Program Name is treated as empty on edit', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, 'Valid description');
    await openEditProgram(page, programName);
    await editProgramNameField(page).fill('   ');

    await expect(saveButton(page)).toBeDisabled();
  });

  test('TC-013 — Special characters in edited name are preserved', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = uniqueName('Informatique & IA - Niveau 2');

    await createProgram(page, programName, 'Advanced AI program');
    await openEditProgram(page, programName);
    await fillEditProgramForm(page, updatedName);
    await saveEditedProgram(page, updatedName);

    await expect(programNameInList(page, updatedName)).toBeVisible();
  });
});
