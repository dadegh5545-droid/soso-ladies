/**
 * The public pages. Arabic lives at the root, English under /en; both use the
 * same English slugs.
 */
import type { Lang } from './strings';

export type PageKey =
  | 'home'
  | 'services'
  | 'homeService'
  | 'about'
  | 'gallery'
  | 'contact'
  | 'privacy'
  | 'dataDeletion';

/** Menu order. */
export const PAGE_KEYS: PageKey[] = ['home', 'services', 'homeService', 'about', 'gallery', 'contact'];

/** Legal pages: linked from the footer only, not the menu. */
export const LEGAL_PAGE_KEYS: PageKey[] = ['privacy', 'dataDeletion'];

const SLUGS: Record<PageKey, string> = {
  home: '',
  services: 'services',
  homeService: 'home-service',
  about: 'about',
  gallery: 'gallery',
  contact: 'contact',
  privacy: 'privacy',
  dataDeletion: 'data-deletion',
};

export function pathFor(page: PageKey, lang: Lang): string {
  const slug = SLUGS[page];
  if (lang === 'ar') return slug ? `/${slug}` : '/';
  return slug ? `/en/${slug}` : '/en';
}
