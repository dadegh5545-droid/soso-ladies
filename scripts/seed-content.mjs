#!/usr/bin/env node
/**
 * Fills the site content from content/soso-content.json and uploads the hero
 * video, its poster and the service images from content/.
 *
 *   node scripts/seed-content.mjs                  dry run (default): prints the plan, writes nothing
 *   node scripts/seed-content.mjs --apply          signs in as the owner and writes
 *   node scripts/seed-content.mjs --apply --force  also overwrites existing services and hero media
 *
 * - Connection: the local amplify_outputs.json (sandbox, or a deployed branch:
 *   see README "تعبئة المحتوى").
 * - Owner sign-in for --apply only: SOSO_OWNER_EMAIL and SOSO_OWNER_PASSWORD
 *   from the environment. They are never printed or written anywhere.
 * - Writes go through the app's own API with the owner's token; the backend's
 *   OWNER rules decide what is allowed. Nothing is ever deleted.
 *
 * Behaviour:
 * - SiteSettings: upsert of the fixed id "main" with the texts from the file.
 *   "ownerProvided" values that are null are never written.
 * - Services: matched by Arabic name. Existing ones are left as they are
 *   unless --force. Service.categoryId is required, so all services go under
 *   one category, «خدمات الصالون» (Salon services), created if missing.
 * - Images: content/images/<image>.(jpg|jpeg|png|webp), resized to 2000 px on
 *   the longest side and saved as WebP (quality 82) under media/services/.
 * - Hero: content/Soso_Website_Hero_12s.mp4 (content/hero.mp4 is ignored) to
 *   media/hero/, and content/hero-poster.* as its poster. Uploaded only when
 *   the settings have none yet, or with --force.
 * - A missing file is skipped without error.
 */
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const CONTENT_FILE = path.join(CONTENT_DIR, 'soso-content.json');
const OUTPUTS_FILE = path.join(ROOT, 'amplify_outputs.json');
const HERO_VIDEO = path.join(CONTENT_DIR, 'Soso_Website_Hero_12s.mp4');
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const SITE_SETTINGS_ID = 'main';
const CATEGORY = { nameAr: 'خدمات الصالون', nameEn: 'Salon services' };
const AVAILABILITY = new Set(['SALON', 'HOME', 'BOTH']);
const MAX_SIDE = 2000;
const WEBP_QUALITY = 82;

// ---------------------------------------------------------------- arguments

const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((a) => !['--apply', '--dry-run', '--force'].includes(a));
if (unknown.length) fail(`Unknown option: ${unknown.join(' ')}`);
if (args.has('--apply') && args.has('--dry-run')) fail('Use either --apply or --dry-run, not both.');
const APPLY = args.has('--apply');
const FORCE = args.has('--force');

function fail(message) {
  console.error(`seed-content: ${message}`);
  process.exit(1);
}

// Error class and message only: never request data, tokens or credentials.
const describe = (error) => `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}`;

// ---------------------------------------------------------------- content file

function readContent() {
  if (!fs.existsSync(CONTENT_FILE)) fail('content/soso-content.json not found.');
  const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  if (!content.settings || !Array.isArray(content.services)) fail('content file needs "settings" and "services".');
  return content;
}

const text = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/** {ar, en} or a plain string (treated as Arabic). */
function bilingual(value) {
  if (value == null) return { ar: null, en: null };
  if (typeof value === 'string') return { ar: text(value), en: null };
  return { ar: text(value.ar), en: text(value.en) };
}

/** Maps the file onto SiteSettings fields; reports anything without a field. */
function settingsFromContent(settings, ignored) {
  const input = {};
  const put = (field, value) => {
    if (value !== null && value !== undefined) input[field] = value;
  };
  const pair = (name, arField, enField) => {
    const v = bilingual(settings[name]);
    put(arField, v.ar);
    put(enField, v.en);
  };
  pair('salonName', 'salonNameAr', 'salonNameEn');
  pair('tagline', 'taglineAr', 'taglineEn');
  pair('subline', 'subtitleAr', 'subtitleEn');
  pair('about', 'aboutAr', 'aboutEn');

  const known = new Set(['salonName', 'tagline', 'subline', 'about', 'ownerProvided']);
  for (const key of Object.keys(settings)) if (!known.has(key)) ignored.push(`settings.${key} (no SiteSettings field)`);

  // Owner-provided values: written only when the file has them (null is skipped).
  const owner = settings.ownerProvided ?? {};
  const ownerFields = {
    whatsappNumber: (v) => put('whatsappNumber', (text(String(v)) ?? '').replace(/[\s()+-]/g, '') || null),
    phone: (v) => put('phone', text(String(v))),
    instagramUrl: (v) => put('instagramUrl', text(v)),
    mapUrl: (v) => put('mapUrl', text(v)),
    latitude: (v) => put('latitude', Number(v)),
    longitude: (v) => put('longitude', Number(v)),
    address: (v) => {
      const b = bilingual(v);
      put('addressAr', b.ar);
      put('addressEn', b.en);
    },
    hours: (v) => {
      const b = bilingual(v);
      put('workingHoursAr', b.ar);
      put('workingHoursEn', b.en);
    },
  };
  for (const [key, value] of Object.entries(owner)) {
    if (!(key in ownerFields)) ignored.push(`settings.ownerProvided.${key} (no SiteSettings field)`);
    else if (value !== null && value !== undefined && value !== '') ownerFields[key](value);
  }
  return input;
}

function servicesFromContent(services, ignored) {
  const knownKeys = new Set(['key', 'order', 'name', 'description', 'availability', 'image']);
  return services.map((s, index) => {
    for (const key of Object.keys(s)) if (!knownKeys.has(key)) ignored.push(`services[${s.key ?? index}].${key} (no Service field)`);
    const name = bilingual(s.name);
    const description = bilingual(s.description);
    if (!name.ar) fail(`service ${s.key ?? index} has no Arabic name.`);
    if (!AVAILABILITY.has(s.availability)) fail(`service ${s.key ?? index}: availability must be SALON, HOME or BOTH.`);
    return {
      key: s.key ?? String(index),
      image: s.image ?? null,
      fields: {
        nameAr: name.ar,
        nameEn: name.en,
        descriptionAr: description.ar,
        descriptionEn: description.en,
        availability: s.availability,
        sortOrder: (Number(s.order) || index + 1) * 10,
        isVisible: true,
      },
    };
  });
}

// ---------------------------------------------------------------- media files

function findFile(baseName, extensions) {
  for (const ext of extensions) {
    const file = `${baseName}.${ext}`;
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/** Longest side at most 2000 px, WebP quality 82, orientation from EXIF. */
async function compressImage(file) {
  const { data, info } = await sharp(file)
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });
  return { data, contentType: 'image/webp', ext: 'webp', width: info.width, height: info.height };
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
const rel = (file) => path.relative(ROOT, file).replace(/\\/g, '/');

async function upload(key, data, contentType) {
  await uploadData({ path: key, data, options: { contentType } }).result;
  return key;
}

// ---------------------------------------------------------------- backend

function configure() {
  if (!fs.existsSync(OUTPUTS_FILE)) fail('amplify_outputs.json not found (see README).');
  Amplify.configure(JSON.parse(fs.readFileSync(OUTPUTS_FILE, 'utf8')));
}

function check(result, what) {
  if (result.errors?.length) {
    throw new Error(`${what}: ${result.errors.map((e) => `${e.errorType ?? 'Error'} ${e.message ?? ''}`).join('; ')}`);
  }
  return result.data;
}

async function listAll(model) {
  const items = [];
  let nextToken = null;
  do {
    const page = await model.list({ limit: 1000, nextToken });
    items.push(...check(page, 'list'));
    nextToken = page.nextToken;
  } while (nextToken);
  return items;
}

/** Dry run: what a visitor can see now (no sign-in), to label creates and updates. */
async function readPublicState() {
  try {
    const client = generateClient({ authMode: 'identityPool' });
    const [settings, catalog] = await Promise.all([
      client.models.SiteSettings.get({ id: SITE_SETTINGS_ID }),
      client.queries.getPublicCatalog(),
    ]);
    return {
      settings: check(settings, 'SiteSettings') ?? null,
      serviceNames: new Set((check(catalog, 'getPublicCatalog')?.services ?? []).map((s) => s.nameAr.trim())),
    };
  } catch (error) {
    console.log(`  (current state not readable: ${describe(error)}; matching happens with --apply)`);
    return null;
  }
}

async function signInAsOwner() {
  const username = process.env.SOSO_OWNER_EMAIL?.trim();
  const password = process.env.SOSO_OWNER_PASSWORD;
  if (!username || !password) fail('--apply needs SOSO_OWNER_EMAIL and SOSO_OWNER_PASSWORD in the environment.');
  await signOut().catch(() => undefined);
  const { nextStep } = await signIn({ username, password });
  if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
    fail('This account still has a temporary password. Sign in once at /admin/login to set a new one, then run again.');
  }
  if (nextStep.signInStep !== 'DONE') fail(`Sign-in needs another step (${nextStep.signInStep}); finish it at /admin/login first.`);
  const session = await fetchAuthSession();
  const groups = session.tokens?.accessToken?.payload?.['cognito:groups'];
  if (!Array.isArray(groups) || !groups.includes('OWNER')) {
    await signOut().catch(() => undefined);
    fail('This account is not in the OWNER group.');
  }
}

// ---------------------------------------------------------------- main

async function main() {
  const content = readContent();
  const ignored = [];
  const settingsInput = settingsFromContent(content.settings, ignored);
  const services = servicesFromContent(content.services, ignored);

  const heroVideo = fs.existsSync(HERO_VIDEO) ? HERO_VIDEO : null;
  const heroPoster = findFile(path.join(CONTENT_DIR, 'hero-poster'), IMAGE_EXTENSIONS);
  const imageFiles = Object.fromEntries(
    services.map((s) => [s.key, s.image ? findFile(path.join(CONTENT_DIR, 'images', s.image), IMAGE_EXTENSIONS) : null]),
  );

  console.log(`seed-content: ${APPLY ? 'APPLY' : 'DRY RUN (nothing is written)'}${FORCE ? ' with --force' : ''}`);
  configure();

  if (!APPLY) {
    const state = await readPublicState();
    const settingsAction = state ? (state.settings ? 'update' : 'create') : 'create or update';
    console.log(`\nSiteSettings "${SITE_SETTINGS_ID}": would ${settingsAction} ${Object.keys(settingsInput).join(', ')}`);
    if (heroVideo) {
      const size = fs.statSync(heroVideo).size;
      const skip = state?.settings?.heroVideoKey && !FORCE;
      console.log(`  hero video ${rel(heroVideo)} (${kb(size)}): ${skip ? 'already set, skipped (use --force)' : 'would upload to media/hero/'}`);
    } else console.log('  hero video: file not found, skipped');
    if (heroPoster) {
      const img = await compressImage(heroPoster);
      const skip = state?.settings?.heroPosterKey && !FORCE;
      console.log(`  hero poster ${rel(heroPoster)} -> ${img.width}x${img.height} WebP ${kb(img.data.length)}: ${skip ? 'already set, skipped (use --force)' : 'would upload to media/hero/'}`);
    } else console.log('  hero poster: file not found, skipped');

    console.log(`\nCategory "${CATEGORY.nameAr}" (${CATEGORY.nameEn}): would create if missing (categoryId is required on Service)`);
    console.log(`\nServices (${services.length}), matched by Arabic name:`);
    for (const s of services) {
      const exists = state?.serviceNames.has(s.fields.nameAr);
      const action = exists ? (FORCE ? 'would update (--force)' : 'exists, would skip') : 'would create';
      let image = 'no image file, skipped';
      if (imageFiles[s.key]) {
        const img = await compressImage(imageFiles[s.key]);
        image = `${rel(imageFiles[s.key])} -> ${img.width}x${img.height} WebP ${kb(img.data.length)}, would upload to media/services/`;
      }
      console.log(`  - ${s.fields.nameAr} / ${s.fields.nameEn ?? '-'} [${s.fields.availability}, order ${s.fields.sortOrder}]: ${action}; ${image}`);
    }
    if (state) console.log('  (hidden services are not visible without sign-in; --apply checks all of them)');
    console.log(`\nIgnored (no matching field): ${ignored.length ? ignored.join('; ') : 'none'}`);
    console.log('Null owner-provided values are not written.');
    return;
  }

  await signInAsOwner();
  const client = generateClient({ authMode: 'userPool' });
  const created = [];
  const skipped = [];
  const uploaded = [];

  try {
    const settings = check(await client.models.SiteSettings.get({ id: SITE_SETTINGS_ID }), 'SiteSettings') ?? null;

    if (heroVideo && (!settings?.heroVideoKey || FORCE)) {
      settingsInput.heroVideoKey = await upload(`media/hero/${randomUUID()}.mp4`, fs.readFileSync(heroVideo), 'video/mp4');
      uploaded.push(`hero video (${rel(heroVideo)})`);
    }
    if (heroPoster && (!settings?.heroPosterKey || FORCE)) {
      const img = await compressImage(heroPoster);
      settingsInput.heroPosterKey = await upload(`media/hero/${randomUUID()}.${img.ext}`, img.data, img.contentType);
      uploaded.push(`hero poster (${rel(heroPoster)})`);
    }
    if (settings) {
      check(await client.models.SiteSettings.update({ id: SITE_SETTINGS_ID, ...settingsInput }), 'SiteSettings update');
    } else {
      check(await client.models.SiteSettings.create({ id: SITE_SETTINGS_ID, ...settingsInput }), 'SiteSettings create');
    }
    created.push(`SiteSettings "${SITE_SETTINGS_ID}" ${settings ? 'updated' : 'created'}`);

    const categories = await listAll(client.models.ServiceCategory);
    let category = categories.find((c) => c.nameAr?.trim() === CATEGORY.nameAr);
    if (!category) {
      const sortOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder ?? 0), 0) + 10;
      category = check(await client.models.ServiceCategory.create({ ...CATEGORY, sortOrder, isVisible: true }), 'category create');
      created.push(`category "${CATEGORY.nameAr}"`);
    }

    const existing = await listAll(client.models.Service);
    for (const s of services) {
      const match = existing.find((e) => e.nameAr?.trim() === s.fields.nameAr);
      if (match && !FORCE) {
        skipped.push(s.fields.nameAr);
        continue;
      }
      const fields = { ...s.fields, categoryId: match?.categoryId ?? category.id };
      if (imageFiles[s.key]) {
        const img = await compressImage(imageFiles[s.key]);
        fields.imageKey = await upload(`media/services/${randomUUID()}.${img.ext}`, img.data, img.contentType);
        uploaded.push(`image ${rel(imageFiles[s.key])}`);
      }
      if (match) {
        check(await client.models.Service.update({ id: match.id, ...fields }), `update ${s.key}`);
        created.push(`service "${s.fields.nameAr}" updated`);
      } else {
        check(await client.models.Service.create(fields), `create ${s.key}`);
        created.push(`service "${s.fields.nameAr}" created`);
      }
    }
  } finally {
    await signOut().catch(() => undefined);
    console.log(`\nDone so far: ${created.length ? created.join('; ') : 'nothing'}`);
    console.log(`Uploaded (${uploaded.length}): ${uploaded.length ? uploaded.join('; ') : 'none'}`);
    if (skipped.length) console.log(`Skipped, already present (use --force to overwrite): ${skipped.join('; ')}`);
  }
}

main().catch((error) => fail(describe(error)));
