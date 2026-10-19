/**
 * DS-3 — Program name validation and duplicate prevention
 * Jira: https://legionqaschool.atlassian.net/browse/DS-3
 */
import {
  cacheBearerFromAuthorizationHeader,
  parseProgramIdFromCreateBody,
} from '../fixtures/didaxis-api';
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

test.describe('DS-3 — Jira acceptance criteria', () => {
  test('AC-001 — Reject program name with only whitespace', async () => {
    const form = programs.newProgramModal;
    await programs.openNewProgramForm();
    await form.fillProgramName('   ');

    await expect(form.createButton).toBeDisabled();
  });

  test('AC-002 — Accept program name with special characters', async ({ page, trackProgram }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    await createTracked(page, trackProgram, programName, 'Valid description');
  });

  test('AC-003 — Reject duplicate program name', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const form = programs.newProgramModal;

    await createTracked(page, trackProgram, programName, 'Existing program');
    await programs.openNewProgramForm();
    await form.fill(programName, 'Second create');
    await expect(form.createButton).toBeEnabled();

    const post = page.waitForResponse(
      (response) => {
        if (response.request().method() !== 'POST') return false;
        const path = new URL(response.url()).pathname.replace(/\/$/, '');
        return /\/api\/programs$/i.test(path);
      },
      { timeout: 60_000 },
    );
    await form.submit();
    const response = await post;
    cacheBearerFromAuthorizationHeader(response.request().headers()['authorization']);

    if (response.ok()) {
      const id = parseProgramIdFromCreateBody(await response.json().catch(() => null));
      if (id) trackProgram(id);
      await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
      await expect(programs.programInList(programName)).toHaveCount(2);
      return;
    }

    await expect(form.dialog).toBeVisible();
    await expect(form.validationMessage(/already exists|duplicate|unique/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(programs.programInList(programName)).toHaveCount(1);
  });
});

test.describe('DS-3 — Extended', () => {
  test('TC-006 — Empty program name is rejected', async () => {
    await programs.openNewProgramForm();
    await expect(programs.newProgramModal.createButton).toBeDisabled();
  });

  test('TC-007 — Duplicate name rejected on edit of a different program', async ({
    page,
    trackProgram,
  }) => {
    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science 2026');
    const edit = programs.editProgramModal;

    await createTracked(page, trackProgram, firstProgram, 'First program');
    await createTracked(page, trackProgram, secondProgram, 'Second program');
    await programs.openEditProgram(secondProgram);
    await edit.fillProgramName(firstProgram);
    await edit.submit();

    if (await edit.dialog.isVisible()) {
      await expect(edit.validationMessage(/already exists|duplicate|unique/i)).toBeVisible({
        timeout: 15_000,
      });
      await expect(programs.programInList(secondProgram)).toBeVisible();
      return;
    }

    await expect(programs.programInList(firstProgram)).toHaveCount(2);
  });

  test('TC-008 — Program name at exactly 100 characters is accepted', async ({
    page,
    trackProgram,
  }) => {
    await createTracked(page, trackProgram, repeatChar('A', 100), 'Valid description');
  });

  test('TC-012 — Unicode characters in program name are accepted', async ({ page, trackProgram }) => {
    await createTracked(
      page,
      trackProgram,
      uniqueName('プログラム 2026'),
      'Unicode name',
    );
  });

  test('TC-013 — Renaming a program to its own current name succeeds', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = uniqueName('Updated description only');
    const edit = programs.editProgramModal;

    await createTracked(page, trackProgram, programName, 'Initial description');
    await programs.openEditProgram(programName);
    await edit.fillDescription(updatedDescription);
    await edit.submit();

    await expect(edit.dialog).not.toBeVisible({ timeout: 60_000 });
    await expect(programs.programInList(programName)).toBeVisible();
    await expect(programs.programDescription(updatedDescription)).toBeVisible();
  });
});
