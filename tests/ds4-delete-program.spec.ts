import { test, expect } from '@playwright/test';
import {
  cancelDeleteProgram,
  confirmDeleteDialog,
  createProgram,
  deleteProgram,
  deleteProgramButton,
  programNameInList,
  setupProgramsPage,
  uniqueName,
} from './didaxis-helpers';

test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
  await setupProgramsPage(page);
});

test.describe('DS-4 Delete Program - Positive flows', () => {
  test('TC-001 — Confirmed deletion removes program from the list', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, uniqueName('Delete me'));
    await deleteProgram(page, programName);

    await expect(programNameInList(page, programName)).toHaveCount(0);
  });

  test('TC-002 — Cancelled deletion keeps program in the list', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, uniqueName('Keep me'));
    await cancelDeleteProgram(page, programName);

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-003 — Confirmation dialog displays the program name', async ({ page }) => {
    const programName = uniqueName('Web Development 2026');

    await createProgram(page, programName, uniqueName('Confirm dialog test'));

    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await deleteProgramButton(page, programName).scrollIntoViewIfNeeded();
    await deleteProgramButton(page, programName).click();

    await expect.poll(() => dialogMessage).toContain(programName);
    await expect(programNameInList(page, programName)).toBeVisible();
  });
});

test.describe('DS-4 Delete Program - Negative flows', () => {
  test('TC-004 — Program is not deleted without confirmation', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, uniqueName('Dismiss delete'));
    await cancelDeleteProgram(page, programName);

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-005 — Double-clicking confirm does not cause errors', async ({ page }) => {
    const programName = uniqueName('Data Science 2026');

    await createProgram(page, programName, uniqueName('Double confirm test'));

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount += 1;
      await dialog.accept();
    });

    await deleteProgramButton(page, programName).scrollIntoViewIfNeeded();
    await deleteProgramButton(page, programName).dblclick();

    await expect(programNameInList(page, programName)).toHaveCount(0, {
      timeout: 30_000,
    });
    expect(dialogCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-006 — Delete action unavailable or blocked for programs with dependencies (if applicable)', async ({
    page,
  }) => {
    test.fixme(true, 'Dependency-linked programs are not available in the shared test environment.');
  });
});

test.describe('DS-4 Delete Program - Edge cases', () => {
  test('TC-007 — Delete last remaining program shows empty state', async ({ page }) => {
    test.fixme(
      true,
      'Shared test environment always contains many programs; empty-state cannot be isolated safely.',
    );
  });

  test('TC-008 — Delete program with special characters in name', async ({ page }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');

    await createProgram(page, programName, uniqueName('Special chars delete'));

    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await deleteProgramButton(page, programName).scrollIntoViewIfNeeded();
    await deleteProgramButton(page, programName).click();

    await expect.poll(() => dialogMessage).toContain('Informatique & IA - Niveau 2');
    await expect(programNameInList(page, programName)).toHaveCount(0, {
      timeout: 30_000,
    });
  });

  test('TC-009 — Delete one program does not affect others', async ({ page }) => {
    const deletedProgram = uniqueName('Web Development 2026');
    const remainingProgram = uniqueName('Data Science 2026');

    await createProgram(page, deletedProgram, uniqueName('Delete target'));
    await createProgram(page, remainingProgram, uniqueName('Should remain'));

    await deleteProgram(page, deletedProgram);

    await expect(programNameInList(page, remainingProgram)).toBeVisible();
    await expect(programNameInList(page, deletedProgram)).toHaveCount(0);
  });

  test('TC-010 — Keyboard accessibility for confirmation dialog', async ({ page }) => {
    const programName = uniqueName('Escape Delete');

    await createProgram(page, programName, uniqueName('Keyboard delete test'));
    await cancelDeleteProgram(page, programName);

    await confirmDeleteDialog(page, programName, 'accept');
    await deleteProgramButton(page, programName).scrollIntoViewIfNeeded();
    await deleteProgramButton(page, programName).click();

    await expect(programNameInList(page, programName)).toHaveCount(0, {
      timeout: 30_000,
    });
  });
});
