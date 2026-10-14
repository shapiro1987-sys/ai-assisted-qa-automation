import {
  createDidaxisApiRequestContext,
  deleteProgramById,
  fetchAllProgramIds,
  resolveAccessToken,
} from './didaxis-api';

/** IDs from the last successful `fetchProgramsAndStoreIds()` call. */
export const fetchedProgramIds: string[] = [];

/** Subset of `fetchedProgramIds` chosen for the next delete run. */
export const programIdsToDelete: string[] = [];

/** Positive count, or delete every fetched ID. Common presets: 300, 500, 1000. */
export type BulkDeleteQuota = number | 'all';

export type BulkDeleteProgress = {
  completed: number;
  total: number;
  programId: string;
  ok: boolean;
  error?: string;
};

export type BulkDeleteResult = {
  requested: number;
  deleted: number;
  failed: number;
  failures: Array<{ programId: string; error: string }>;
};

/**
 * GET https://test.didaxis.studio/api/programs and store every program `id`
 * in `fetchedProgramIds` (replaces any previous fetch).
 */
export async function fetchProgramsAndStoreIds(): Promise<number> {
  fetchedProgramIds.length = 0;
  programIdsToDelete.length = 0;

  const ids = await fetchAllProgramIds();
  fetchedProgramIds.push(...ids);
  return fetchedProgramIds.length;
}

/**
 * Copy the first N programs from `fetchedProgramIds` into `programIdsToDelete`.
 * Call `fetchProgramsAndStoreIds()` first.
 */
export function selectProgramsForDeletion(quota: BulkDeleteQuota): number {
  if (fetchedProgramIds.length === 0) {
    throw new Error('No program IDs loaded. Call fetchProgramsAndStoreIds() first.');
  }

  programIdsToDelete.length = 0;
  if (quota !== 'all' && (!Number.isInteger(quota) || quota < 1)) {
    throw new Error(`Invalid quota ${quota}. Use a positive integer or "all".`);
  }
  const count = quota === 'all' ? fetchedProgramIds.length : Math.min(quota, fetchedProgramIds.length);
  programIdsToDelete.push(...fetchedProgramIds.slice(0, count));
  return programIdsToDelete.length;
}

/**
 * DELETE each ID in `programIdsToDelete` via the API.
 * Requires `BULK_DELETE_CONFIRM=yes` unless `options.confirm` is true.
 */
export async function deleteSelectedPrograms(options?: {
  confirm?: boolean;
  onProgress?: (progress: BulkDeleteProgress) => void;
}): Promise<BulkDeleteResult> {
  if (programIdsToDelete.length === 0) {
    throw new Error('Nothing queued. Call selectProgramsForDeletion() first.');
  }

  const confirmed =
    options?.confirm === true ||
    process.env.BULK_DELETE_CONFIRM?.trim().toLowerCase() === 'yes';
  if (!confirmed) {
    throw new Error(
      'Refusing to delete without confirmation. Pass { confirm: true } or set BULK_DELETE_CONFIRM=yes',
    );
  }

  const api = await createDidaxisApiRequestContext();
  await resolveAccessToken(api);

  const result: BulkDeleteResult = {
    requested: programIdsToDelete.length,
    deleted: 0,
    failed: 0,
    failures: [],
  };

  try {
    for (let index = 0; index < programIdsToDelete.length; index++) {
      const programId = programIdsToDelete[index];
      try {
        await deleteProgramById(programId, api);
        result.deleted += 1;
        options?.onProgress?.({
          completed: index + 1,
          total: programIdsToDelete.length,
          programId,
          ok: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.failed += 1;
        result.failures.push({ programId, error: message });
        options?.onProgress?.({
          completed: index + 1,
          total: programIdsToDelete.length,
          programId,
          ok: false,
          error: message,
        });
      }
    }
  } finally {
    await api.dispose();
  }

  return result;
}
