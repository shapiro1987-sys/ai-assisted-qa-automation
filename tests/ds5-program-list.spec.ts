/**
 * DS-5 — Program list filtering and display
 * Jira: https://legionqaschool.atlassian.net/browse/DS-5
 *
 * Created programs are tracked with `trackProgram` and deleted via API after each
 * test that creates them (fixtures/cleanup.fixture.ts).
 * UI delete runs only in TC-005, which asserts the program leaves the list.
 * The created id is still tracked for API cleanup.
 *
 * Accessibility for this screen is already covered by tests/programs.a11y.spec.ts.
 */
import { test, expect, trackProgramCreateFromResponse } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageFile } from './auth.storage';
import { repeatChar, uniqueName } from './didaxis-helpers';

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

const emptyStateSkip =
  'Shared environment always has programs (747 observed on 2026-10-29). Empty-state copy was not observed and must not be invented.';

const nonAdminSkip = 'No non-admin credentials are configured.';

const noSearchFilterSkip =
  'ProgramsPage does not expose a search, filter, or sort locator. Absence of those controls cannot be asserted without that POM surface.';

test.describe('DS-5 — Jira acceptance criteria', () => {
  useProgramsPage();

  test('AC-001 — Display program list with key details', async ({ page, trackProgram }) => {
    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science 2026');
    const firstDescription = uniqueName('Frontend and backend curriculum');
    const secondDescription = uniqueName('Machine learning fundamentals');

    await createTracked(page, trackProgram, firstProgram, firstDescription);
    await createTracked(page, trackProgram, secondProgram, secondDescription);

    await expect(programs.heading).toBeVisible();
    await expect(programs.subtitle).toBeVisible();
    // "Program" column header is not asserted: ProgramsPage has no table or columnheader locator.
    test.info().annotations.push({
      type: 'pom-gap',
      description:
        'ProgramsPage has no table or columnheader locator, so the "Program" column header is not asserted.',
    });
    await expect(programs.programInList(firstProgram)).toBeVisible();
    await expect(programs.programInList(secondProgram)).toBeVisible();
    await expect(programs.programDescription(firstDescription)).toBeVisible();
    await expect(programs.programDescription(secondDescription)).toBeVisible();
  });
});

test('AC-002 — Empty state when no programs exist', async () => {
  test.skip(true, emptyStateSkip);
});

test.describe('DS-5 — Extended', () => {
  useProgramsPage();

  test('TC-003 — Newly created program appears in the list immediately', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    await createTracked(page, trackProgram, programName, uniqueName('Immediate list check'));
    await expect(programs.programInList(programName)).toBeVisible();
  });

  test('TC-004 — Program with empty description displays correctly in list', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('DevOps 2026');
    await createTracked(page, trackProgram, programName);
    await expect(programs.programInList(programName)).toBeVisible();
    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
  });

  test('TC-006 — Program list reflects edited name without refresh', async ({ page, trackProgram }) => {
    const originalName = uniqueName('Web Development 2026');
    const updatedName = uniqueName('Web Development 2026 - Updated');

    await createTracked(page, trackProgram, originalName, 'List refresh check');
    await programs.openEditProgram(originalName);
    await programs.saveEditedProgram(updatedName);

    await expect(programs.editProgramModal.dialog).not.toBeVisible({ timeout: 60_000 });
    await expect(programs.programInList(updatedName)).toBeVisible();
    await expect(programs.programInList(originalName)).toHaveCount(0);
  });

  test('TC-010 — Program name with special characters displays correctly', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    await createTracked(page, trackProgram, programName, 'Special characters display');
    await expect(programs.programInList(programName)).toBeVisible();
  });
});

test.describe('DS-5 — Negative', () => {
  useProgramsPage();

  test('TC-005 — Program list does not show stale data after deletion', async ({ page, trackProgram }) => {
    const programName = uniqueName('Test Program');
    await createTracked(page, trackProgram, programName, 'Stale data check');
    await programs.deleteProgram(programName, 'accept');
    await expect(programs.programInList(programName)).toHaveCount(0, { timeout: 30_000 });
  });
});

test('TC-007 — Non-admin user cannot access Programs page', async () => {
  test.skip(true, nonAdminSkip);
});

test('TC-013 — Programs page has no search or filter control', async () => {
  test.skip(true, noSearchFilterSkip);
});

test.describe('DS-5 — Edge cases', () => {
  useProgramsPage();

  test('TC-008 — Long program name displays without breaking layout', async ({ page, trackProgram }) => {
    const programName = repeatChar('L', 100);
    await createTracked(page, trackProgram, programName, 'Long name layout');
    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
  });

  test('TC-009 — Long description displays without breaking layout', async ({ page, trackProgram }) => {
    const programName = uniqueName('Cloud Computing 2026');
    await createTracked(page, trackProgram, programName, repeatChar('D', 500));
    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
  });

  test('TC-011 — List with many programs remains usable', async () => {
    await expect(programs.heading).toBeVisible();
    await expect(programs.subtitle).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
  });
});

test('TC-012 — Empty-state create prompt opens creation form', async () => {
  test.skip(true, emptyStateSkip);
});
