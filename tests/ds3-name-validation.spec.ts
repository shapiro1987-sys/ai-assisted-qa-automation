/**
 * DS-3 — Program name validation and duplicate prevention
 * Jira: https://legionqaschool.atlassian.net/browse/DS-3
 *
 * Created programs are tracked with `trackProgram` and deleted via API after each
 * test that creates them (fixtures/cleanup.fixture.ts). A duplicate create that
 * the app still accepts is tracked too. AC-003 and TC-007 still assert the
 * acceptance criteria.
 *
 * Accessibility for this screen is already covered by tests/programs.a11y.spec.ts.
 */
import type { Response } from '@playwright/test';
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

const duplicateNameMessage = /already exists|duplicate|unique/i;

let programs: ProgramsPage;

test.beforeEach(async ({ page }) => {
  programs = new ProgramsPage(page);
  await programs.goto();
});

function isProgramCreatePost(response: Response) {
  if (response.request().method() !== 'POST') return false;
  const pathname = new URL(response.url()).pathname.replace(/\/$/, '');
  return /\/api\/programs$/i.test(pathname);
}

/** Track a create that returned 2xx. Callers still assert the acceptance criteria. */
async function trackCreatedProgram(response: Response, trackProgram: (id: string) => void) {
  cacheBearerFromAuthorizationHeader(response.request().headers()['authorization']);
  if (!response.ok()) return;
  const id = parseProgramIdFromCreateBody(await response.json().catch(() => null));
  if (id) trackProgram(id);
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

test.describe('DS-3 — Jira acceptance criteria', () => {
  test('AC-001 — Reject program name with only whitespace', async () => {
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fillProgramName('   ');

    await expect(form.programName).toHaveValue('   ');
    await expect(form.createButton).toBeDisabled();
    await expect(form.dialog).toBeVisible();
  });

  test('AC-002 — Accept program name with special characters', async ({ page, trackProgram }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    await createTracked(page, trackProgram, programName);
  });

  test('AC-003 — Reject duplicate program name', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const form = programs.newProgramModal;

    await createTracked(page, trackProgram, programName);
    await programs.openNewProgramForm();
    await form.fillProgramName(programName);
    await expect(form.createButton).toBeEnabled();

    const post = page.waitForResponse(isProgramCreatePost, { timeout: 60_000 });
    await form.submit();
    await trackCreatedProgram(await post, trackProgram);

    await expect(form.dialog).toBeVisible();
    await expect(form.validationMessage(duplicateNameMessage)).toBeVisible({ timeout: 30_000 });
    await expect(programs.programInList(programName)).toHaveCount(1);
  });
});

test.describe('DS-3 — Extended', () => {
  test('TC-002 — Program name with hyphens and numbers is accepted', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Web-Dev 2026 v2');
    await createTracked(page, trackProgram, programName);
  });

  test('TC-006 — Empty program name is rejected', async () => {
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();

    await expect(form.programName).toHaveValue('');
    await expect(form.createButton).toBeDisabled();
  });

  test('TC-007 — Duplicate name rejected on edit of a different program', async ({
    page,
    trackProgram,
  }) => {
    const firstProgram = uniqueName('Web Development 2026');
    const secondProgram = uniqueName('Data Science 2026');
    const edit = programs.editProgramModal;

    await createTracked(page, trackProgram, firstProgram);
    await createTracked(page, trackProgram, secondProgram);

    const trackUnexpectedCreate = (response: Response) => {
      if (!isProgramCreatePost(response) || !response.ok()) return;
      void trackCreatedProgram(response, trackProgram);
    };
    page.on('response', trackUnexpectedCreate);

    try {
      await programs.openEditProgram(secondProgram);
      await expect(edit.dialog).toBeVisible();
      await edit.fillProgramName(firstProgram);
      await edit.submit();

      await expect(edit.dialog).toBeVisible();
      await expect(edit.validationMessage(duplicateNameMessage)).toBeVisible({ timeout: 30_000 });
      await expect(programs.programInList(secondProgram)).toHaveCount(1);
      await expect(programs.programInList(firstProgram)).toHaveCount(1);
    } finally {
      page.off('response', trackUnexpectedCreate);
    }
  });

  test('TC-008 — Program name at exactly 100 characters can be submitted', async () => {
    const programName = repeatChar('A', 100);
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fillProgramName(programName);

    await expect(form.programName).toHaveValue(programName);
    await expect(form.createButton).toBeEnabled();
  });

  test('TC-009 — Program name of 101 characters is not blocked in the field', async () => {
    const programName = repeatChar('A', 101);
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fillProgramName(programName);

    await expect(form.programName).toHaveValue(programName);
    await expect(form.createButton).toBeEnabled();
  });

  test('TC-012 — Unicode characters in program name are accepted', async ({ page, trackProgram }) => {
    const programName = uniqueName('プログラム 2026');
    await createTracked(page, trackProgram, programName);
  });

  test('TC-013 — Renaming a program to its own current name succeeds', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Web Development 2026');
    const edit = programs.editProgramModal;

    await createTracked(page, trackProgram, programName);
    await programs.openEditProgram(programName);
    await expect(edit.dialog).toBeVisible();
    await expect(edit.programName).toHaveValue(programName);
    await edit.submit();

    await expect(edit.dialog).not.toBeVisible({ timeout: 60_000 });
    await expect(programs.programInList(programName)).toBeVisible();
  });
});
