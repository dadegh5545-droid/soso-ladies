/**
 * Data access for the admin panel. All calls carry the owner's user-pool
 * token (adminClient); SiteSettings is only ever read and written under its
 * fixed id.
 */
import { SITE_SETTINGS_ID } from '@/amplify/data/site-settings';
import { adminClient, type GalleryImage, type Service, type ServiceCategory, type SiteSettings } from './amplify';

type GraphQLErrorLike = { message?: string; errorType?: string };

export class DataError extends Error {
  constructor(public readonly errors: GraphQLErrorLike[]) {
    super(errors.map((e) => `${e.errorType ?? 'Error'}: ${e.message ?? ''}`).join('; '));
    this.name = 'DataError';
  }
}

function unwrap<T>(result: { data: T; errors?: GraphQLErrorLike[] }): NonNullable<T> {
  if (result.errors?.length) throw new DataError(result.errors);
  if (result.data === null || result.data === undefined) throw new DataError([{ message: 'empty response' }]);
  return result.data as NonNullable<T>;
}

/** Reads every page of a list query. */
async function listAll<T>(
  list: (args: { limit: number; nextToken?: string | null }) => Promise<{ data: T[]; nextToken?: string | null; errors?: GraphQLErrorLike[] }>,
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const page = await list({ limit: 1000, nextToken });
    if (page.errors?.length) throw new DataError(page.errors);
    items.push(...page.data);
    nextToken = page.nextToken;
  } while (nextToken);
  return items;
}

export const bySortOrder = <T extends { sortOrder?: number | null; createdAt?: string }>(a: T, b: T) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.createdAt ?? '').localeCompare(b.createdAt ?? '');

export async function getSettings(): Promise<SiteSettings | null> {
  const result = await adminClient.models.SiteSettings.get({ id: SITE_SETTINGS_ID });
  if (result.errors?.length) throw new DataError(result.errors);
  return result.data ?? null;
}

export type SettingsInput = Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>;

/** Creates the single record the first time, then only updates it. */
export async function saveSettings(input: Partial<SettingsInput> & { salonNameAr?: string }): Promise<SiteSettings> {
  const existing = await getSettings();
  if (existing) {
    return unwrap(await adminClient.models.SiteSettings.update({ id: SITE_SETTINGS_ID, ...input }));
  }
  if (!input.salonNameAr) throw new DataError([{ message: 'salonNameAr is required' }]);
  return unwrap(
    await adminClient.models.SiteSettings.create({ ...input, id: SITE_SETTINGS_ID, salonNameAr: input.salonNameAr }),
  );
}

export const listCategories = async () =>
  (await listAll<ServiceCategory>((args) => adminClient.models.ServiceCategory.list(args))).sort(bySortOrder);

export const listServices = async () =>
  (await listAll<Service>((args) => adminClient.models.Service.list(args))).sort(bySortOrder);

export const listGalleryImages = async () =>
  (await listAll<GalleryImage>((args) => adminClient.models.GalleryImage.list(args))).sort(bySortOrder);

export const createCategory = async (input: { nameAr: string; nameEn?: string | null; sortOrder: number }) =>
  unwrap(await adminClient.models.ServiceCategory.create({ ...input, isVisible: true }));

export const updateCategory = async (input: Partial<ServiceCategory> & { id: string }) =>
  unwrap(await adminClient.models.ServiceCategory.update(strip(input)));

export const deleteCategory = async (id: string) => unwrap(await adminClient.models.ServiceCategory.delete({ id }));

export type ServiceInput = Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'category'>;

export const createService = async (input: ServiceInput) =>
  unwrap(await adminClient.models.Service.create(input as Parameters<typeof adminClient.models.Service.create>[0]));

export const updateService = async (input: Partial<ServiceInput> & { id: string }) =>
  unwrap(await adminClient.models.Service.update(input as Parameters<typeof adminClient.models.Service.update>[0]));

export const deleteService = async (id: string) => unwrap(await adminClient.models.Service.delete({ id }));

export const createGalleryImage = async (input: { fileKey: string; altAr: string; altEn?: string | null; sortOrder: number }) =>
  unwrap(await adminClient.models.GalleryImage.create({ ...input, isVisible: true }));

export const updateGalleryImage = async (input: Partial<GalleryImage> & { id: string }) =>
  unwrap(await adminClient.models.GalleryImage.update(strip(input)));

export const deleteGalleryImage = async (id: string) => unwrap(await adminClient.models.GalleryImage.delete({ id }));

/** Drops read-only and relation fields before an update. */
function strip<T extends Record<string, unknown>>(input: T) {
  const { createdAt, updatedAt, services, category, ...rest } = input as Record<string, unknown>;
  void createdAt;
  void updatedAt;
  void services;
  void category;
  return rest as T;
}

/**
 * Moves one item up or down and renumbers sortOrder (10, 20, 30…). Returns
 * the reordered list and the items whose sortOrder changed.
 */
export function moveItem<T extends { id: string; sortOrder?: number | null }>(
  items: T[],
  index: number,
  delta: -1 | 1,
): { items: T[]; changed: T[] } {
  const target = index + delta;
  if (target < 0 || target >= items.length) return { items, changed: [] };
  const reordered = [...items];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  const changed: T[] = [];
  const renumbered = reordered.map((item, i) => {
    const sortOrder = (i + 1) * 10;
    if (item.sortOrder === sortOrder) return item;
    const next = { ...item, sortOrder };
    changed.push(next);
    return next;
  });
  return { items: renumbered, changed };
}

export const nextSortOrder = (items: { sortOrder?: number | null }[]) =>
  items.reduce((max, item) => Math.max(max, item.sortOrder ?? 0), 0) + 10;
