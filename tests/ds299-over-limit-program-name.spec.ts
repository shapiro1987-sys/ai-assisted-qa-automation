/**
 * DS-299 — Over-limit Program Name on edit keeps the original program
 * Jira: https://legionqaschool.atlassian.net/browse/DS-299
 *
 * Plan: features/DS-299.feature
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

let programs: ProgramsPage;

test.beforeEach(async ({ page }) => {
  programs = new ProgramsPage(page);
  await programs.goto();
  await expect(programs.heading).toBeVisible({ timeout: 60_000 });
});

function renamedProgramName(programName: string) {
  const suffix = programName.slice('Web Development 2026'.length);
  return `Web Development 2026 - Updated${suffix}`;
}

/** Exactly 256 characters, unique per call so leftover rows cannot collide. */
function overLimitProgramName() {
  const suffix = ` ${Date.now()}`;
  return repeatChar('a', 256 - suffix.length) + suffix;
}

function isProgramWrite(method: string, url: string) {
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') return false;
  try {
    const path = new URL(url).pathname.replace(/\/$/, '');
    return /\/api\/programs(\/[^/]+)?$/i.test(path);
  } catch {
    return false;
  }
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
  await expect(programs.programInList(name)).toBeVisible({ timeout: 60_000 });
}

/**
 * Click Save, then wait until a program write settles (or until it is clear the
 * client never sent one). A successful POST /api/programs is an unexpected
 * extra row — track that UUID so cleanup deletes it.
 */
async function saveEditTrackingUnexpectedCreate(
  page: Parameters<typeof trackProgramCreateFromResponse>[0],
  trackProgram: (id: string) => void,
) {
  const pending: Promise<void>[] = [];

  const onResponse = (response: Response) => {
    if (response.request().method() !== 'POST' || !response.ok()) return;
    let path: string;
    try {
      path = new URL(response.url()).pathname.replace(/\/$/, '');
    } catch {
      return;
    }
    if (!/\/api\/programs$/i.test(path)) return;

    cacheBearerFromAuthorizationHeader(response.request().headers()['authorization']);
    pending.push(
      response
        .json()
        .catch(() => null)
        .then((body) => {
          const programId = parseProgramIdFromCreateBody(body);
          if (programId) trackProgram(programId);
        }),
    );
  };

  page.on('response', onResponse);
  try {
    const writeRequest = page
      .waitForRequest(
        (request) => isProgramWrite(request.method(), request.url()),
        { timeout: 15_000 },
      )
      .catch(() => null);

    await programs.editProgramModal.submit();
    const request = await writeRequest;

    if (request) {
      const response = await page
        .waitForResponse((candidate) => candidate.request() === request, {
          timeout: 60_000,
        })
        .catch(() => null);

      if (response?.ok()) {
        await programs.editProgramModal.dialog
          .waitFor({ state: 'hidden', timeout: 5_000 })
          .catch(() => undefined);
      }
    }
  } finally {
    page.off('response', onResponse);
    await Promise.all(pending);
  }
}

test.describe('DS-299 — Over-limit Program Name on edit', () => {
  test('A normal rename still saves', { tag: '@DS-299' }, async ({ page, trackProgram }) => {
    const programName = uniqueName('Web Development 2026');
    const updatedName = renamedProgramName(programName);
    const edit = programs.editProgramModal;

    await createTracked(page, trackProgram, programName, 'Original curriculum');
    await programs.openEditProgram(programName);
    await expect(edit.dialog).toBeVisible();
    await edit.fillProgramName(updatedName);
    await edit.submit();

    await expect(edit.dialog).not.toBeVisible({ timeout: 60_000 });
    await expect(programs.programInList(updatedName)).toBeVisible({ timeout: 60_000 });
    await expect(programs.programInList(programName)).toHaveCount(0);
  });

  test(
    'A 256-character Program Name is not saved',
    { tag: '@DS-299' },
    async ({ page, trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const overLimitName = overLimitProgramName();
      const edit = programs.editProgramModal;

      expect(overLimitName).toHaveLength(256);

      await createTracked(page, trackProgram, programName, 'Original curriculum');
      await programs.openEditProgram(programName);
      await expect(edit.dialog).toBeVisible();
      await edit.fillProgramName(overLimitName);
      await expect(edit.programName).toHaveValue(overLimitName);
      await saveEditTrackingUnexpectedCreate(page, trackProgram);

      await expect(edit.dialog).toBeVisible();
      await expect(programs.programInList(programName)).toBeVisible();
      await expect(programs.programInList(overLimitName)).toHaveCount(0);
    },
  );

  test(
    'Saving the over-limit name does not remove the original row',
    { tag: '@DS-299' },
    async ({ page, trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const overLimitName = overLimitProgramName();
      const edit = programs.editProgramModal;

      expect(overLimitName).toHaveLength(256);

      await createTracked(page, trackProgram, programName, 'Original curriculum');
      await programs.openEditProgram(programName);
      await expect(edit.dialog).toBeVisible();
      await edit.fillProgramName(overLimitName);
      await expect(edit.programName).toHaveValue(overLimitName);
      await saveEditTrackingUnexpectedCreate(page, trackProgram);

      await expect(programs.programInList(programName)).toHaveCount(1);
      await expect(programs.programInList(overLimitName)).toHaveCount(0);
    },
  );
});
