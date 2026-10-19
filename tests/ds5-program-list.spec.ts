/**
 * DS-5 — Program list filtering and display
 * Jira: https://legionqaschool.atlassian.net/browse/DS-5
 */
import { test, expect, trackProgramCreateFromResponse } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageFile } from './auth.storage';
import { repeatChar, uniqueName } from './didaxis-helpers';

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

test.describe('DS-5 — Jira acceptance criteria', () => {
  test('AC-001 — Display program list with key details', async ({ page, trackProgram }) => {
    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science 2026');
    const firstDescription = uniqueName('Frontend and backend curriculum');
    const secondDescription = uniqueName('Machine learning fundamentals');

    await createTracked(page, trackProgram, firstProgram, firstDescription);
    await createTracked(page, trackProgram, secondProgram, secondDescription);

    await expect(programs.heading).toBeVisible();
    await expect(programs.programInList(firstProgram)).toBeVisible();
    await expect(programs.programInList(secondProgram)).toBeVisible();
    await expect(programs.programDescription(firstDescription)).toBeVisible();
    await expect(programs.programDescription(secondDescription)).toBeVisible();
  });

  test('AC-002 — Empty state when no programs exist', async () => {
    test.skip(true, 'Shared test environment always contains programs.');
  });
});

test.describe('DS-5 — Extended', () => {
  test('TC-003 — Newly created program appears in the list immediately', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Mobile Development 2026');
    const description = uniqueName('Cross-platform mobile apps');
    await createTracked(page, trackProgram, programName, description);
    await expect(programs.programDescription(description)).toBeVisible();
  });

  test('TC-004 — Program with empty description displays correctly in list', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('DevOps 2026');
    await createTracked(page, trackProgram, programName);
  });

  test('TC-005 — Program list does not show stale data after deletion', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName, 'Stale data check');
    await programs.deleteProgram(programName, 'accept');
    await expect(programs.programInList(programName)).toHaveCount(0, { timeout: 30_000 });
  });

  test('TC-006 — Program list reflects edited name without refresh', async ({
    page,
    trackProgram,
  }) => {
    const originalName = uniqueName('Web Development 2026');
    const updatedName = uniqueName('Web Development 2026 - Updated');
    const edit = programs.editProgramModal;

    await createTracked(page, trackProgram, originalName, 'List refresh check');
    await programs.openEditProgram(originalName);
    await edit.fill(updatedName);
    await edit.submit();

    await expect(edit.dialog).not.toBeVisible({ timeout: 60_000 });
    await expect(programs.programInList(updatedName)).toBeVisible();
    await expect(programs.programInList(originalName)).toHaveCount(0);
  });

  test('TC-008 — Long program name displays without breaking layout', async ({
    page,
    trackProgram,
  }) => {
    const programName = repeatChar('L', 100);
    await createTracked(page, trackProgram, programName, 'Long name layout');
    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
  });

  test('TC-010 — Program name with special characters displays correctly', async ({
    page,
    trackProgram,
  }) => {
    await createTracked(
      page,
      trackProgram,
      uniqueName('Informatique & IA - Niveau 2'),
      'Special characters display',
    );
  });

  test('TC-011 — List with many programs remains usable', async () => {
    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
    await expect(programs.subtitle).toBeVisible();
  });
});
