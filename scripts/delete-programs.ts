/**
 * Manual bulk program cleanup for test.didaxis.studio
 *
 * Examples:
 *   npm run programs:bulk fetch
 *   npm run programs:bulk -- queue 500
 *   npm run programs:bulk -- delete --confirm
 *
 * Auth: DIDAXIS_API_TOKEN in .env, or refresh cookie in tests/.didaxis-auth.json
 */
import dotenv from 'dotenv';
import path from 'path';
import {
  deleteSelectedPrograms,
  fetchProgramsAndStoreIds,
  fetchedProgramIds,
  programIdsToDelete,
  selectProgramsForDeletion,
  type BulkDeleteQuota,
} from '../fixtures/program-bulk-delete';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function printUsage() {
  console.log(`
Usage:
  npm run programs:bulk fetch
      GET /api/programs and store IDs in fetchedProgramIds[]

  npm run programs:bulk -- queue <N|all>
      Copy the first N IDs (e.g. 219, 300, 500, 1000) or all

  npm run programs:bulk -- delete --confirm
      DELETE every ID in programIdsToDelete[] (destructive)

  npm run programs:bulk -- run <N|all> --confirm
      fetch → queue → delete in one step

Environment:
  BULK_DELETE_CONFIRM=yes   alternative to --confirm
  DIDAXIS_API_TOKEN         optional if tests/.didaxis-auth.json is valid
`);
}

function parseQuota(raw: string): BulkDeleteQuota {
  if (!raw) {
    throw new Error('Missing quota. Example: npm run programs:bulk -- run 219 --confirm');
  }
  if (raw === 'all') {
    return 'all';
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid quota "${raw}". Use a positive integer (e.g. 219) or "all".`);
  }
  return n;
}

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes('--confirm') || args.includes('-y');
  const positional = args.filter((arg) => !arg.startsWith('-'));

  if (positional.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = positional[0];

  if (command === 'fetch') {
    const count = await fetchProgramsAndStoreIds();
    console.log(`[bulk-delete] Loaded ${count} program ID(s) into fetchedProgramIds`);
    if (count > 0) {
      console.log(`[bulk-delete] First ID: ${fetchedProgramIds[0]}`);
    }
    return;
  }

  if (command === 'queue') {
    const quota = parseQuota(positional[1] ?? '');
    if (fetchedProgramIds.length === 0) {
      console.log('[bulk-delete] fetchedProgramIds is empty; running fetch first…');
      await fetchProgramsAndStoreIds();
    }
    const queued = selectProgramsForDeletion(quota);
    console.log(
      `[bulk-delete] Queued ${queued} program ID(s) in programIdsToDelete (quota: ${quota})`,
    );
    return;
  }

  if (command === 'delete') {
    const result = await deleteSelectedPrograms({
      confirm,
      onProgress: ({ completed, total, programId, ok, error }) => {
        const status = ok ? 'deleted' : `failed: ${error}`;
        console.log(`[bulk-delete] [${completed}/${total}] ${programId} — ${status}`);
      },
    });
    console.log(
      `[bulk-delete] Done. deleted=${result.deleted} failed=${result.failed} requested=${result.requested}`,
    );
    if (result.failures.length > 0) {
      process.exitCode = 1;
    }
    return;
  }

  if (command === 'run') {
    const quota = parseQuota(positional[1] ?? '');
    await fetchProgramsAndStoreIds();
    const queued = selectProgramsForDeletion(quota);
    console.log(`[bulk-delete] Fetched ${fetchedProgramIds.length}, queued ${queued} for deletion`);
    const result = await deleteSelectedPrograms({
      confirm,
      onProgress: ({ completed, total, programId, ok }) => {
        if (completed % 50 === 0 || completed === total) {
          console.log(`[bulk-delete] progress ${completed}/${total} (last: ${programId}, ok=${ok})`);
        }
      },
    });
    console.log(
      `[bulk-delete] Done. deleted=${result.deleted} failed=${result.failed} requested=${result.requested}`,
    );
    programIdsToDelete.length = 0;
    if (result.failures.length > 0) {
      process.exitCode = 1;
    }
    return;
  }

  printUsage();
  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[bulk-delete] ${message}`);
  process.exit(1);
});
