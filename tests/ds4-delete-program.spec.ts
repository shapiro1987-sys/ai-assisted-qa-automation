/**
 * DS-4 — Delete program with confirmation
 * Jira: https://legionqaschool.atlassian.net/browse/DS-4
 */
import { test, expect, trackProgramCreateFromResponse } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageFile } from './auth.storage';
import { uniqueName } from './didaxis-helpers';

test.use({ storageState: authStorageFile });
test.setTimeout(120_000);
test.describe.configure({ mode: 'serial' });

let programs: ProgramsPage;

test.beforeEach(async ({ page }) => {
  programs = new ProgramsPage(page);
  await programs.goto();
});

async function createTracked(
  page: Parameters<typeof trackProgramCreateFromResponse>[0],
  trackProgram: (id: string) => void,
  name: string,
  description = '',
) {
  await trackProgramCreateFromResponse(page, trackProgram, async () => {
    await programs.createProgram(name, description);
  });
  await expect(programs.newProgramModal.dialog).not.toBeVisible({ timeout: 30_000 });
  await expect(programs.programInList(name)).toBeVisible({ timeout: 60_000 });
}

test.describe('DS-4 — Jira acceptance criteria', () => {
  test('AC-001 — Delete program with confirmation', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName, 'Delete me');

    const message = await programs.deleteProgram(programName, 'accept');
    expect(message).toContain(programName);
    await expect(programs.programInList(programName)).toHaveCount(0, { timeout: 30_000 });
  });

  test('AC-002 — Cancel program deletion', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName, 'Keep me');

    await programs.deleteProgram(programName, 'dismiss');
    await expect(programs.programInList(programName)).toBeVisible();
  });
});

test.describe('DS-4 — Extended', () => {
  test('TC-003 — Confirmation dialog displays the program name', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    await createTracked(page, trackProgram, programName, 'Confirm dialog');

    const message = await programs.deleteProgram(programName, 'dismiss');
    expect(message).toContain(programName);
    await expect(programs.programInList(programName)).toBeVisible();
  });

  test('TC-004 — Program is not deleted without confirmation', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName, 'Dismiss delete');

    await programs.deleteProgram(programName, 'dismiss');
    await expect(programs.programInList(programName)).toBeVisible();
  });

  test('TC-008 — Delete program with special characters in name', async ({ page, trackProgram }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    await createTracked(page, trackProgram, programName, 'Special chars');

    const message = await programs.deleteProgram(programName, 'accept');
    expect(message).toContain('Informatique & IA - Niveau 2');
    await expect(programs.programInList(programName)).toHaveCount(0, { timeout: 30_000 });
  });

  test('TC-009 — Delete one program does not affect others', async ({ page, trackProgram }) => {
    const deletedProgram = uniqueName('Web Development 2026');
    const remainingProgram = uniqueName('Data Science 2026');

    await createTracked(page, trackProgram, deletedProgram, 'Delete target');
    await createTracked(page, trackProgram, remainingProgram, 'Should remain');
    await programs.deleteProgram(deletedProgram, 'accept');

    await expect(programs.programInList(remainingProgram)).toBeVisible();
    await expect(programs.programInList(deletedProgram)).toHaveCount(0);
  });
});
