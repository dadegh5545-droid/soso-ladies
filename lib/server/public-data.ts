/**
 * Reads what a visitor may see: SiteSettings (fixed id) and getPublicCatalog,
 * both as guest. Successful reads are kept for FRESH_MS so a burst of page and
 * /media requests costs one AppSync round trip; a failed read falls back to the
 * last good copy, and failures are never cached.
 */
import { SITE_SETTINGS_ID } from '@/amplify/data/site-settings';
import type { PublicCatalog, SiteSettingsRecord } from '@/lib/site/view';
import { guestClient, runAsGuest } from './amplify-guest';

export type PublicData = { settings: SiteSettingsRecord | null; catalog: PublicCatalog };

/** Together with the CDN's s-maxage (pages/index.tsx) this keeps changes under a minute. */
const FRESH_MS = 15_000;

let cached: { at: number; data: PublicData } | null = null;
let inFlight: Promise<PublicData> | null = null;

function errorText(errors: readonly { message?: string; errorType?: string }[] | undefined): string {
  return (errors ?? []).map((e) => `${e.errorType ?? 'Error'}: ${e.message ?? ''}`).join('; ');
}

async function fetchPublicData(): Promise<PublicData> {
  return runAsGuest(async (contextSpec) => {
    const [settingsResult, catalogResult] = await Promise.all([
      guestClient.models.SiteSettings.get(contextSpec, { id: SITE_SETTINGS_ID }),
      guestClient.queries.getPublicCatalog(contextSpec),
    ]);
    if (settingsResult.errors?.length) {
      throw new Error(`SiteSettings: ${errorText(settingsResult.errors)}`);
    }
    if (catalogResult.errors?.length || !catalogResult.data) {
      throw new Error(`getPublicCatalog: ${errorText(catalogResult.errors) || 'no data'}`);
    }
    return { settings: settingsResult.data ?? null, catalog: catalogResult.data };
  });
}

export async function loadPublicData(): Promise<{ data: PublicData; stale: boolean }> {
  if (cached && Date.now() - cached.at < FRESH_MS) {
    return { data: cached.data, stale: false };
  }
  inFlight ??= fetchPublicData().finally(() => {
    inFlight = null;
  });
  try {
    const data = await inFlight;
    cached = { at: Date.now(), data };
    return { data, stale: false };
  } catch (error) {
    // Log the error class and message only (no request data, no credentials).
    const e = error as Error;
    console.error(`[public-data] ${e.name}: ${e.message}`);
    if (cached) return { data: cached.data, stale: true };
    throw error;
  }
}
