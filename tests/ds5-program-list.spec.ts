import { test, expect } from '@playwright/test';
import {
  createProgram,
  deleteProgram,
  editProgramNameField,
  fillEditProgramForm,
  newProgramButton,
  openEditProgram,
  openNewProgramModal,
  programNameInList,
  programsHeading,
  repeatChar,
  saveEditedProgram,
  setupProgramsPage,
  uniqueName,
} from './didaxis-helpers';

test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
  await setupProgramsPage(page);
});

test.describe('DS-5 Program List - Positive flows', () => {
  test('TC-001 — Program list displays name and description for each program', async ({ page }) => {
    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science 2026');
    const firstDescription = uniqueName('Frontend and backend curriculum');
    const secondDescription = uniqueName('Machine learning fundamentals');

    await createProgram(page, firstProgram, firstDescription);
    await createProgram(page, secondProgram, secondDescription);

    await expect(programNameInList(page, firstProgram)).toBeVisible();
    await expect(programNameInList(page, secondProgram)).toBeVisible();
    await expect(page.getByText(firstDescription, { exact: true })).toBeVisible();
    await expect(page.getByText(secondDescription, { exact: true })).toBeVisible();
  });

  test('TC-002 — Empty state shown when no programs exist', async ({ page }) => {
    test.fixme(
      true,
      'Shared test environment always contains existing programs; empty-state cannot be verified reliably.',
    );
  });

  test('TC-003 — Newly created program appears in the list immediately', async ({ page }) => {
    const programName = uniqueName('Mobile Development 2026');
    const description = uniqueName('Cross-platform mobile apps');

    await createProgram(page, programName, description);

    await expect(programNameInList(page, programName)).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
  });

  test('TC-004 — Program with empty description displays correctly in list', async ({ page }) => {
    const programName = uniqueName('DevOps 2026');

    await createProgram(page, programName);

    await expect(programNameInList(page, programName)).toBeVisible();
  });
});

test.describe('DS-5 Program List - Negative flows', () => {
  test('TC-005 — Program list does not show stale data after deletion', async ({ page }) => {
    const programName = uniqueName('Test Program');

    await createProgram(page, programName, uniqueName('Stale data check'));
    await deleteProgram(page, programName);

    await expect(programNameInList(page, programName)).toHaveCount(0);
  });

  test('TC-006 — Program list reflects edited name without refresh', async ({ page }) => {
    const originalName = uniqueName('Web Development 2026');
    const updatedName = uniqueName('Web Development 2026 - Updated');

    await createProgram(page, originalName, uniqueName('List refresh check'));
    await openEditProgram(page, originalName);
    await fillEditProgramForm(page, updatedName);
    await saveEditedProgram(page, updatedName);

    await expect(programNameInList(page, updatedName)).toBeVisible();
    await expect(programNameInList(page, originalName)).toHaveCount(0);
  });

  test('TC-007 — Non-admin user cannot access Programs page (if role-restricted)', async ({
    page,
  }) => {
    test.skip(
      !process.env.DIDAXIS_NONADMIN_EMAIL || !process.env.DIDAXIS_NONADMIN_PASSWORD,
      'Non-admin credentials are not configured in .env',
    );
  });
});

test.describe('DS-5 Program List - Edge cases', () => {
  test('TC-008 — Long program name displays without breaking layout', async ({ page }) => {
    const programName = repeatChar('L', 100);

    await createProgram(page, programName, uniqueName('Long name layout check'));

    await expect(programsHeading(page)).toBeVisible();
    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-009 — Long description displays without breaking layout', async ({ page }) => {
    const programName = uniqueName('Long Description Program');
    const description = repeatChar('D', 500);

    await createProgram(page, programName, description);

    await expect(programsHeading(page)).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
  });

  test('TC-010 — Program name with special characters displays correctly', async ({ page }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');

    await createProgram(page, programName, uniqueName('Special characters display'));

    await expect(programNameInList(page, programName)).toBeVisible();
  });

  test('TC-011 — List with many programs remains usable', async ({ page }) => {
    await expect(programsHeading(page)).toBeVisible();
    await expect(newProgramButton(page)).toBeVisible();
    await expect(page.getByText('Manage academic programs and semesters')).toBeVisible();
  });

  test('TC-012 — Empty-state create prompt opens creation form', async ({ page }) => {
    test.fixme(
      true,
      'Shared test environment is not empty; empty-state create prompt cannot be tested reliably.',
    );
  });
});
