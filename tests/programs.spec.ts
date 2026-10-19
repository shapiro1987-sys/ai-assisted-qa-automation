import { test, expect, trackProgramCreateFromResponse } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageFile } from './auth.storage';
import { uniqueName } from './didaxis-helpers';

test.use({ storageState: authStorageFile });

test.describe('Programs', () => {
  test('opens the new program form', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();

    await expect(programs.heading).toBeVisible();
    await programs.openNewProgramForm();

    await expect(programs.newProgramModal.dialog).toBeVisible();
    await expect(programs.newProgramModal.programName).toBeVisible();
    await expect(programs.newProgramModal.description).toBeVisible();
  });

  test('creates a program', async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const description = uniqueName('Full-stack web development program');

    await programs.goto();
    await trackProgramCreateFromResponse(page, trackProgram, async () => {
      await programs.createProgram(programName, description);
    });

    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.programInList(programName)).toBeVisible();
    await expect(programs.programDescription(description)).toBeVisible();
  });
});
