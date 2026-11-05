import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageFile } from './auth.storage';
import { uniqueName } from './didaxis-helpers';

test.use({ storageState: authStorageFile });

test.describe('Cancel discards a new program draft', () => {
  test('Cancel closes the form and does not create the program', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Should Not Be Saved');
    const description = uniqueName('Draft description');

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);

    await expect(programs.newProgramModal.createButton).toBeEnabled();

    await programs.newProgramModal.cancel();

    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.programInList(programName)).toHaveCount(0);
  });

  test('Cancel on an empty New Program form stays on Programs', async ({ page }) => {
    const programs = new ProgramsPage(page);

    await programs.goto();
    await programs.openNewProgramForm();

    await expect(programs.newProgramModal.programName).toHaveValue('');
    await expect(programs.newProgramModal.createButton).toBeDisabled();

    await programs.newProgramModal.cancel();

    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.heading).toBeVisible();
  });
});
