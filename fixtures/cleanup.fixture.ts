import path from 'path';
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  cacheBearerFromAuthorizationHeader,
  createDidaxisApiRequestContext,
  deleteProgramById,
  parseProgramIdFromCreateBody,
} from './didaxis-api';

export const test = base.extend<{ trackProgram: (programId: string) => void }>({
  trackProgram: async ({}, use, testInfo) => {
    const programIds: string[] = [];
    let specName = 'spec';

    await use((programId: string) => {
      if (!programId) return;
      programIds.push(programId);
      const file = base.info().file ?? testInfo.file;
      if (file) {
        specName = path.basename(file);
      }
    });

    if (programIds.length === 0) {
      return;
    }

    const uniqueIds = [...new Set(programIds)];
    console.log(
      `[api-cleanup] Deleting ${uniqueIds.length} program(s) after "${testInfo.title}" (${specName})…`,
    );

    const requestContext = await createDidaxisApiRequestContext();
    try {
      for (const id of uniqueIds) {
        try {
          await deleteProgramById(id, requestContext);
          console.log(`[api-cleanup] Deleted program ${id}`);
        } catch (error) {
          console.error(`[api-cleanup] Failed to delete program ${id}:`, error);
        }
      }
    } finally {
      await requestContext.dispose();
    }
  },
});

export { expect };

/** Call before the UI action that POSTs a new program (Create click). */
export async function trackProgramCreateFromResponse(
  page: Page,
  trackProgram: (programId: string) => void,
  createAction: () => Promise<void>,
) {
  const responsePromise = page.waitForResponse(
    (response) => {
      if (response.request().method() !== 'POST') return false;
      const path = new URL(response.url()).pathname.replace(/\/$/, '');
      return /\/api\/programs$/i.test(path) && response.ok();
    },
    { timeout: 60_000 },
  );

  await createAction();

  const response = await responsePromise;
  cacheBearerFromAuthorizationHeader(response.request().headers()['authorization']);

  const body = await response.json().catch(() => null);
  const programId = parseProgramIdFromCreateBody(body);
  if (!programId) {
    throw new Error(
      `Could not read program id from create response (${response.url()}): ${JSON.stringify(body)}`,
    );
  }
  trackProgram(programId);
}
