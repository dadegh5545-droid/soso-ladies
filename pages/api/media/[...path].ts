/**
 * Serves stored media at stable URLs (/media/<folder>/<file>, rewritten here
 * by next.config.mjs), so the CDN and next/image can cache them.
 *
 * - Only files the public page currently references are served: a hidden
 *   gallery image or service is not reachable here by guessing its key.
 * - The file is read from S3 as guest, exactly as a visitor's browser could.
 * - Range requests are passed through (video seeking, iOS playback) and each
 *   response is capped at MAX_CHUNK bytes so a large video never has to fit
 *   in one response; browsers request the following ranges themselves.
 */
import { Readable } from 'stream';
import type { ReadableStream as WebReadableStream } from 'stream/web';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUrl } from 'aws-amplify/storage/server';
import { runAsGuest } from '@/lib/server/amplify-guest';
import { loadPublicData } from '@/lib/server/public-data';
import { publicMediaKeys } from '@/lib/site/view';

export const config = { api: { responseLimit: false } };

const KEY_PATTERN = /^media\/(hero|gallery|services)\/[A-Za-z0-9][A-Za-z0-9._-]{0,200}$/;
const MAX_CHUNK = 4 * 1024 * 1024;
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600';
const PASS_HEADERS = ['content-type', 'last-modified', 'etag'];

/** Turns "bytes=a-b" into a bounded range; null for anything else. */
function boundedRange(header: string | undefined): string | null {
  const match = header?.match(/^bytes=(\d+)-(\d*)$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Math.min(Number(match[2]), start + MAX_CHUNK - 1) : start + MAX_CHUNK - 1;
  return end >= start ? `bytes=${start}-${end}` : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? ''];
  const key = `media/${parts.join('/')}`;
  if (!KEY_PATTERN.test(key)) {
    return res.status(404).end();
  }

  try {
    const { data } = await loadPublicData();
    if (!publicMediaKeys(data.settings, data.catalog).has(key)) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).end();
    }

    const { url } = await runAsGuest((contextSpec) =>
      getUrl(contextSpec, { path: key, options: { expiresIn: 300 } }),
    );
    const range = boundedRange(req.headers.range);
    // Always GET: the presigned URL is signed for GET (a HEAD just drops the body).
    const upstream = await fetch(url, { headers: range ? { range } : undefined });

    if (upstream.status === 404 || upstream.status === 403) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).end();
    }
    if (upstream.status === 416) {
      const total = upstream.headers.get('content-range');
      if (total) res.setHeader('Content-Range', total);
      return res.status(416).end();
    }
    if (!upstream.ok) {
      throw new Error(`S3 responded ${upstream.status}`);
    }

    res.status(upstream.status);
    for (const name of PASS_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    const length = upstream.headers.get('content-length');
    if (length) res.setHeader('Content-Length', length);
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method === 'HEAD' || !upstream.body) {
      await upstream.body?.cancel();
      return res.end();
    }
    const body = Readable.fromWeb(upstream.body as unknown as WebReadableStream);
    body.on('error', () => res.destroy());
    body.pipe(res);
  } catch (error) {
    const e = error as Error;
    console.error(`[media] ${e.name}: ${e.message}`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).end();
  }
}
