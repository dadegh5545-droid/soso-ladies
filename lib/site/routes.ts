/**
 * The public pages. Arabic lives at the root, English under /en; both use the
 * same English slugs.
 */
import type { Lang } from './strings';

export type PageKey = 'home' | 'services' | 'homeService' | 'about' | 'gallery' | 'contact';

/** Menu order. */
export const PAGE_KEYS: PageKey[] = ['home', 'services', 'homeService', 'about', 'gallery', 'contact'];

const SLUGS: Record<PageKey, string> = {
  home: '',
  services: 'services',
  homeService: 'home-service',
  about: 'about',
  gallery: 'gallery',
  contact: 'contact',
};

export function pathFor(page: PageKey, lang: Lang): string {
  const slug = SLUGS[page];
  if (lang === 'ar') return slug ? `/${slug}` : '/';
  return slug ? `/en/${slug}` : '/en';
}
