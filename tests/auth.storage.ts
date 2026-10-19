import fs from 'fs';
import path from 'path';

/** Saved login session reused by Playwright projects (see auth.setup.ts). */
export const authStorageFile = path.resolve(__dirname, '..', 'playwright', '.auth', 'user.json');

export function ensureAuthStorageDir(): void {
  fs.mkdirSync(path.dirname(authStorageFile), { recursive: true });
}
