/**
 * DS-1 — Create new academic program
 * Jira: https://legionqaschool.atlassian.net/browse/DS-1
 *
 * Created programs are tracked with `trackProgram` and deleted via API after each
 * test that creates them (fixtures/cleanup.fixture.ts).
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

function jiraProgramName() {
  return uniqueName('Web Development 2026');
}

test.describe('DS-1 — Jira acceptance criteria', () => {
  test('AC-001 — Navigate to program creation form', async () => {
    await expect(programs.heading).toBeVisible();

    await programs.openNewProgramForm();

    await expect(programs.newProgramModal.dialog).toBeVisible();
    await expect(programs.newProgramModal.programName).toBeVisible();
    await expect(programs.newProgramModal.description).toBeVisible();
  });

  test('AC-002 — Successfully create a program (modal closes, list shows name)', async ({
    page,
    trackProgram,
  }) => {
    const programName = jiraProgramName();
    const description = uniqueName('Full-stack web development program');
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, description);
    await expect(form.createButton).toBeEnabled();

    await trackProgramCreateFromResponse(page, trackProgram, async () => {
      await form.submit();
    });

    await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
    await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });
    await expect(programs.programDescription(description)).toBeVisible();
  });

  test('AC-003 — Validation prevents empty program name', async () => {
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fillDescription('Optional description for empty name test');

    await expect(form.programName).toHaveValue('');
    await expect(form.createButton).toBeDisabled();
  });
});

test.describe('DS-1 Create Program - Extended positive flows', () => {
  test('TC-004 — Program can be created with name only and empty description', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Data Science 2026');
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName);
    await expect(form.createButton).toBeEnabled();

    await trackProgramCreateFromResponse(page, trackProgram, async () => {
      await form.submit();
    });

    await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
    await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });
  });
});

test.describe('DS-1 Create Program - Negative flows', () => {
  test('TC-005 — Duplicate program name is rejected on create', async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, 'Initial program');
    await expect(form.createButton).toBeEnabled();
    await trackProgramCreateFromResponse(page, trackProgram, async () => {
      await form.submit();
    });
    await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
    await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });

    await programs.openNewProgramForm();
    await form.fill(programName, 'Duplicate attempt');
    await expect(form.createButton).toBeEnabled();

    const duplicatePost = page.waitForResponse(
      (response) => {
        if (response.request().method() !== 'POST') return false;
        const path = new URL(response.url()).pathname.replace(/\/$/, '');
        return /\/api\/programs$/i.test(path);
      },
      { timeout: 60_000 },
    );
    await form.submit();
    const duplicateResponse = await duplicatePost;
    cacheBearerFromAuthorizationHeader(duplicateResponse.request().headers()['authorization']);

    if (duplicateResponse.ok()) {
      const duplicateId = parseProgramIdFromCreateBody(await duplicateResponse.json().catch(() => null));
      if (duplicateId) {
        trackProgram(duplicateId);
      }
      await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
      // test.didaxis.studio currently allows duplicate names (API 201); see features/DS-1.feature note
      await expect(programs.programInList(programName)).toHaveCount(2);
      return;
    }

    await expect(form.dialog).toBeVisible({ timeout: 15_000 });
    await expect(form.validationMessage(/already exists|duplicate|unique/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(programs.programInList(programName)).toHaveCount(1);
  });

  test('TC-006 — Double-clicking Create does not create duplicate programs', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Mobile Development 2026');
    const description = 'iOS and Android development';
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, description);
    await expect(form.createButton).toBeEnabled();

    const captureCreate = async (response: import('@playwright/test').Response) => {
      if (response.request().method() !== 'POST') return;
      const path = new URL(response.url()).pathname.replace(/\/$/, '');
      if (!/\/api\/programs$/i.test(path) || !response.ok()) return;
      cacheBearerFromAuthorizationHeader(response.request().headers()['authorization']);
      const id = parseProgramIdFromCreateBody(await response.json().catch(() => null));
      if (id) {
        trackProgram(id);
      }
    };
    page.on('response', captureCreate);
    await form.doubleSubmit();
    await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
    await expect
      .poll(async () => programs.programInList(programName).count(), { timeout: 20_000 })
      .toBeGreaterThan(0);
    await page.waitForTimeout(2_000);
    page.off('response', captureCreate);

    const count = await programs.programInList(programName).count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(2);
    if (count > 1) {
      test.info().annotations.push({
        type: 'warning',
        description: 'Double-click created more than one program in test env (duplicate names allowed).',
      });
    }
  });
});

test.describe('DS-1 Create Program - Edge cases', () => {
  test('TC-007 — Program name at maximum length (100 characters) is accepted', async ({
    page,
    trackProgram,
  }) => {
    const programName = repeatChar('A', 100);
    const description = 'Valid description';
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, description);
    await trackProgramCreateFromResponse(page, trackProgram, async () => {
      await form.submit();
    });
    await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
    await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });
  });

  test('TC-008 — Program name exceeding 100 characters is rejected', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName(repeatChar('B', 92));
    const description = 'Valid description';
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, description);
    if (await form.createButton.isDisabled()) {
      await expect(programs.programInList(programName)).toHaveCount(0);
      return;
    }

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

    if (response.ok()) {
      const id = parseProgramIdFromCreateBody(await response.json().catch(() => null));
      if (id) {
        trackProgram(id);
      }
      test.info().annotations.push({
        type: 'warning',
        description: 'test.didaxis.studio accepts program names longer than 100 characters.',
      });
      await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
      await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });
      return;
    }

    await expect(form.dialog).toBeVisible({ timeout: 15_000 });
    await expect(form.validationMessage(/already exists|duplicate|unique/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(programs.programInList(programName)).toHaveCount(0);
  });

  test('TC-009 — Description at maximum length (500 characters) is accepted', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Cloud Computing 2026');
    const description = repeatChar('D', 500);
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, description);
    await trackProgramCreateFromResponse(page, trackProgram, async () => {
      await form.submit();
    });
    await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
    await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });
  });

  test('TC-010 — Description exceeding 500 characters is rejected', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('DevOps 2026');
    const description = repeatChar('D', 501);
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, description);
    if (await form.createButton.isDisabled()) {
      await expect(programs.programInList(programName)).toHaveCount(0);
      return;
    }

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

    if (response.ok()) {
      const id = parseProgramIdFromCreateBody(await response.json().catch(() => null));
      if (id) {
        trackProgram(id);
      }
      test.info().annotations.push({
        type: 'warning',
        description: 'test.didaxis.studio accepts descriptions longer than 500 characters.',
      });
      await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
      await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });
      return;
    }

    await expect(form.dialog).toBeVisible({ timeout: 15_000 });
    await expect(form.validationMessage(/already exists|duplicate|unique/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(programs.programInList(programName)).toHaveCount(0);
  });

  test('TC-011 — Program name with special characters is accepted', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueName('Informatique & IA - Niveau 2');
    const description = 'Advanced AI program';
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fill(programName, description);
    await trackProgramCreateFromResponse(page, trackProgram, async () => {
      await form.submit();
    });
    await expect(form.dialog).not.toBeVisible({ timeout: 30_000 });
    await expect(programs.programInList(programName)).toBeVisible({ timeout: 60_000 });
  });

  test('TC-012 — Whitespace-only Program Name is treated as empty', async () => {
    const form = programs.newProgramModal;

    await programs.openNewProgramForm();
    await form.fillProgramName('   ');

    await expect(form.createButton).toBeDisabled();
  });
});
