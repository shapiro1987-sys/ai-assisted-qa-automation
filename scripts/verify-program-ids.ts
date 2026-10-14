import dotenv from 'dotenv';
import path from 'path';
import {
  createDidaxisApiRequestContext,
  getProgramHttpStatus,
  resolveAccessToken,
} from '../fixtures/didaxis-api';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function main() {
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error('Usage: npx tsx scripts/verify-program-ids.ts <uuid> [...]');
    process.exit(1);
  }

  const api = await createDidaxisApiRequestContext();
  await resolveAccessToken(api);
  try {
    for (const id of ids) {
      const status = await getProgramHttpStatus(id, api);
      console.log(`${id} => HTTP ${status}`);
    }
  } finally {
    await api.dispose();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
