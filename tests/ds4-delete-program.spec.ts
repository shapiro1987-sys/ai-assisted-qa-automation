/**
 * DS-4 — Delete program with confirmation
 * Jira: https://legionqaschool.atlassian.net/browse/DS-4
 *
 * Created programs are tracked with `trackProgram` and deleted via API after each
 * test that creates them (fixtures/cleanup.fixture.ts). Accepting the native
 * confirm is the behavior under test. The id is still tracked; cleanup treats
 * 404 as already gone. A dismissed delete leaves the row, so API cleanup
 * removes that program too. UI delete is not cleanup.
 *
 * Accessibility for this screen is already covered by tests/programs.a11y.spec.ts.
 *
 * TC-010 and TC-005 are skipped. ProgramsPage.deleteProgram clicks once and
 * handles a single dialog. No page-object method focuses Delete {name} and
 * presses Enter, and none double-clicks that button and counts confirmations.
 */
import { test, expect, trackProgramCreateFromResponse } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageFile } from './auth.storage';
import { uniqueName } from './didaxis-helpers';

test.use({ storageState: authStorageFile });
test.setTimeout(120_000);
test.describe.configure({ mode: 'serial' });

let programs: ProgramsPage;

function useProgramsPage() {
  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await programs.goto();
  });
}

function deleteConfirmation(name: string) {
  return `Delete program "${name}"? All its semesters and courses will be removed. This cannot be undone.`;
}

async function createTracked(
  page: Parameters<typeof trackProgramCreateFromResponse>[0],
  trackProgram: (id: string) => void,
  name: string,
) {
  await trackProgramCreateFromResponse(page, trackProgram, async () => {
    await programs.createProgram(name);
  });
  await expect(programs.newProgramModal.dialog).not.toBeVisible({ timeout: 30_000 });
  await expect(programs.programInList(name)).toBeVisible({ timeout: 60_000 });
}

const enterOnDeleteSkip =
  'ProgramsPage.deleteProgram only clicks Delete {name} and handles one dialog. There is no method that focuses that button and presses Enter.';

const doubleClickDeleteSkip =
  'ProgramsPage.deleteProgram only clicks once and handles a single dialog. There is no method that double-clicks Delete {name} and counts confirmations. TC-005 still expects one confirmation; open bugs DS-30, DS-109, DS-156, and DS-218 record the double confirm.';

test.describe('DS-4 — Jira acceptance criteria', () => {
  useProgramsPage();

  test('AC-001 — Delete program with confirmation', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName);

    const message = await programs.deleteProgram(programName, 'accept');

    expect(message).toBe(deleteConfirmation(programName));
    await expect(programs.programInList(programName)).toHaveCount(0, { timeout: 30_000 });
  });

  test('AC-002 — Cancel program deletion', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName);

    const message = await programs.deleteProgram(programName, 'dismiss');

    expect(message).toBe(deleteConfirmation(programName));
    await expect(programs.programInList(programName)).toBeVisible();
  });
});

test.describe('DS-4 — Extended', () => {
  useProgramsPage();

  test('TC-003 — Confirmation dialog displays the program name', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    await createTracked(page, trackProgram, programName);

    const message = await programs.deleteProgram(programName, 'dismiss');

    expect(message).toBe(deleteConfirmation(programName));
    await expect(programs.programInList(programName)).toBeVisible();
  });

  test('TC-009 — Delete one program does not affect others', async ({ page, trackProgram }) => {
    const deletedProgram = uniqueName('Web Development 2026');
    const remainingProgram = uniqueName('Data Science 2026');

    await createTracked(page, trackProgram, deletedProgram);
    await createTracked(page, trackProgram, remainingProgram);

    const message = await programs.deleteProgram(deletedProgram, 'accept');

    expect(message).toBe(deleteConfirmation(deletedProgram));
    await expect(programs.programInList(deletedProgram)).toHaveCount(0, { timeout: 30_000 });
    await expect(programs.programInList(remainingProgram)).toBeVisible();
  });
});

test.describe('DS-4 — Negative', () => {
  useProgramsPage();

  test('TC-004 — Program is not deleted without confirmation', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName);

    const message = await programs.deleteProgram(programName, 'dismiss');

    expect(message).toBe(deleteConfirmation(programName));
    await expect(programs.programInList(programName)).toBeVisible();
  });
});

test.describe('DS-4 — Edge cases', () => {
  test('TC-010 — Enter on the delete button opens the same confirmation', async () => {
    test.skip(true, enterOnDeleteSkip);
  });

  test('TC-005 — Double-clicking delete asks once', async () => {
    test.skip(true, doubleClickDeleteSkip);
  });
});
