import fs from 'fs';
import path from 'path';
import type { APIRequestContext } from '@playwright/test';
import { request as playwrightRequest } from '@playwright/test';
import { authStorageFile } from '../tests/auth.storage';
import { DIDAXIS_URL } from '../tests/didaxis-helpers';

const defaultAuthStoragePath = authStorageFile;
const programsListTimeoutMs = 300_000;

let cachedBearerToken: string | undefined;

export function setCachedBearerToken(token: string) {
  const trimmed = token.trim();
  if (trimmed) {
    cachedBearerToken = trimmed;
  }
}

export function cacheBearerFromAuthorizationHeader(authorization: string | undefined) {
  if (!authorization) return;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (match?.[1]) {
    setCachedBearerToken(match[1]);
  }
}

export function requireApiToken(): string {
  const fromEnv = process.env.DIDAXIS_API_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  if (cachedBearerToken) return cachedBearerToken;
  throw new Error(
    'DIDAXIS_API_TOKEN must be set in .env, refresh playwright/.auth/user.json (setup project), or run a tracked program create so the Bearer token is captured from the UI session',
  );
}

function readRefreshTokenFromStorage(storageStatePath: string): string | null {
  if (!fs.existsSync(storageStatePath)) {
    return null;
  }
  const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8')) as {
    cookies?: Array<{ name: string; value: string }>;
  };
  const cookie = state.cookies?.find((entry) => entry.name === 'didaxis_refresh_token');
  return cookie?.value?.trim() || null;
}

/** Bearer token: .env DIDAXIS_API_TOKEN, cached UI token, or refresh cookie from Playwright storage state. */
export async function resolveAccessToken(
  requestContext?: APIRequestContext,
): Promise<string> {
  const fromEnv = process.env.DIDAXIS_API_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  if (cachedBearerToken) return cachedBearerToken;

  const storagePath = process.env.DIDAXIS_AUTH_STORAGE?.trim() || defaultAuthStoragePath;
  const refreshToken = readRefreshTokenFromStorage(storagePath);
  if (!refreshToken) {
    throw new Error(
      `No API token available. Set DIDAXIS_API_TOKEN in .env or run: npx playwright test --project=setup`,
    );
  }

  const ownsContext = !requestContext;
  const api = requestContext ?? await createDidaxisApiRequestContext();
  const base = (process.env.DIDAXIS_URL ?? DIDAXIS_URL).replace(/\/$/, '');

  try {
    const response = await api.post(`${base}/api/auth/refresh`, {
      headers: {
        Cookie: `didaxis_refresh_token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
      data: {},
    });

    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`POST /api/auth/refresh failed: ${response.status()} ${body}`);
    }

    const body = (await response.json()) as {
      data?: { access_token?: string };
      access_token?: string;
      accessToken?: string;
    };
    const token =
      body.data?.access_token ?? body.access_token ?? body.accessToken ?? null;
    if (!token) {
      throw new Error('POST /api/auth/refresh did not return an access token');
    }
    setCachedBearerToken(token);
    return token;
  } finally {
    if (ownsContext) {
      await api.dispose();
    }
  }
}

export function parseProgramIdsFromListBody(body: unknown): string[] {
  if (!body || typeof body !== 'object') {
    return [];
  }

  const record = body as Record<string, unknown>;
  let items: unknown[] = [];

  if (Array.isArray(body)) {
    items = body;
  } else if (Array.isArray(record.data)) {
    items = record.data;
  } else if (record.data && typeof record.data === 'object') {
    const nested = record.data as Record<string, unknown>;
    if (Array.isArray(nested.programs)) {
      items = nested.programs;
    }
  } else if (Array.isArray(record.programs)) {
    items = record.programs;
  }

  const ids: string[] = [];
  for (const item of items) {
    const id = parseProgramIdFromCreateBody(item);
    if (id) {
      ids.push(id);
    }
  }
  return ids;
}

/** GET /api/programs (same data as the Programs page at /programs). */
export async function fetchAllProgramIds(
  requestContext?: APIRequestContext,
): Promise<string[]> {
  const ownsContext = !requestContext;
  const api = requestContext ?? await createDidaxisApiRequestContext();
  const token = await resolveAccessToken(ownsContext ? api : requestContext);
  const base = (process.env.DIDAXIS_URL ?? DIDAXIS_URL).replace(/\/$/, '');

  try {
    const response = await api.get(`${base}/api/programs`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: programsListTimeoutMs,
    });

    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`GET /api/programs failed: ${response.status()} ${body}`);
    }

    const body = await response.json();
    return parseProgramIdsFromListBody(body);
  } finally {
    if (ownsContext) {
      await api.dispose();
    }
  }
}

export async function createDidaxisApiRequestContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    ignoreHTTPSErrors: true,
  });
}

export async function getProgramHttpStatus(
  programId: string,
  requestContext?: APIRequestContext,
): Promise<number> {
  const ownsContext = !requestContext;
  const api = requestContext ?? await createDidaxisApiRequestContext();
  const token = await resolveAccessToken(ownsContext ? api : requestContext);
  const base = (process.env.DIDAXIS_URL ?? DIDAXIS_URL).replace(/\/$/, '');

  try {
    const response = await api.get(`${base}/api/programs/${programId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return response.status();
  } finally {
    if (ownsContext) {
      await api.dispose();
    }
  }
}

export async function deleteProgramById(
  programId: string,
  requestContext?: APIRequestContext,
): Promise<void> {
  const ownsContext = !requestContext;
  const api = requestContext ?? await createDidaxisApiRequestContext();

  const token = requireApiToken();
  const base = (process.env.DIDAXIS_URL ?? DIDAXIS_URL).replace(/\/$/, '');
  const url = `${base}/api/programs/${programId}`;

  try {
    const response = await api.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.status() === 404) {
      return;
    }

    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `DELETE /api/programs/${programId} failed: ${response.status()} ${response.statusText()} ${body}`,
      );
    }
  } finally {
    if (ownsContext) {
      await api.dispose();
    }
  }
}

export function parseProgramIdFromCreateBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : null;

  const candidates = [record.id, record.uuid, nested?.id, nested?.uuid];
  for (const value of candidates) {
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}
