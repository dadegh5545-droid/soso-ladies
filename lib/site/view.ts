/**
 * The public page's view model: SiteSettings + the public catalog, already
 * resolved for one language (English falls back to Arabic) and stripped of
 * empty values, so components only decide whether to show an element.
 */
import type { Schema } from '@/amplify/data/resource';
import { normalizeWhatsappNumber, type Availability } from '@/lib/whatsapp';
import { strings, type Lang } from './strings';

export type SiteSettingsRecord = Schema['SiteSettings']['type'];
export type PublicCatalog = Schema['PublicCatalog']['type'];

/** A piece of content and the language it is actually written in. */
export type LText = { text: string; lang: Lang };

export type ServiceView = {
  id: string;
  name: LText;
  description: LText | null;
  categoryId: string;
  availability: Availability;
  price: string | null;
  imageSrc: string | null;
};

export type GalleryImageView = { id: string; src: string; alt: LText };

export type SiteView = {
  lang: Lang;
  salonName: LText;
  tagline: LText;
  subtitle: LText | null;
  about: LText | null;
  address: LText | null;
  workingHours: LText | null;
  phone: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  mapUrl: string | null;
  geo: { lat: number; lng: number } | null;
  heroVideoSrc: string | null;
  heroPosterSrc: string | null;
  categories: { id: string; name: LText }[];
  services: ServiceView[];
  gallery: GalleryImageView[];
  /** Development only (lib/demo-content.ts): the banner shown over demo content. */
  demoNote: string | null;
};

const clean = (value: string | null | undefined): string | null => {
  const text = value?.trim();
  return text ? text : null;
};

/** The English text when the page is English and it exists, else the Arabic. */
export function pick(lang: Lang, ar: string | null | undefined, en: string | null | undefined): LText | null {
  const enText = clean(en);
  if (lang === 'en' && enText) return { text: enText, lang: 'en' };
  const arText = clean(ar);
  if (arText) return { text: arText, lang: 'ar' };
  return enText ? { text: enText, lang: 'en' } : null;
}

const httpUrl = (value: string | null | undefined): string | null => {
  const url = clean(value);
  return url && /^https?:\/\//i.test(url) ? url : null;
};

/** Public URL of a stored file, served through /media (pages/api/media). */
export const mediaSrc = (key: string | null | undefined): string | null => {
  const k = clean(key);
  return k && k.startsWith('media/') ? `/${k}` : null;
};

const formatPrice = (price: number | null | undefined): string | null =>
  typeof price === 'number' && Number.isFinite(price) && price > 0
    ? String(Math.round(price * 100) / 100)
    : null;

export function buildSiteView(
  lang: Lang,
  settings: SiteSettingsRecord | null,
  catalog: PublicCatalog,
): SiteView {
  const t = strings[lang];
  const s = settings;
  const lat = s?.latitude;
  const lng = s?.longitude;
  const geo =
    typeof lat === 'number' && typeof lng === 'number' && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0)
      ? { lat, lng }
      : null;

  // Only categories that still have a visible service are offered as filters.
  const usedCategoryIds = new Set(catalog.services.map((service) => service.categoryId));

  return {
    lang,
    salonName: pick(lang, s?.salonNameAr, s?.salonNameEn) ?? { text: t.defaultSalonName, lang },
    tagline: pick(lang, s?.taglineAr, s?.taglineEn) ?? { text: t.defaultTagline, lang: 'ar' },
    subtitle: pick(lang, s?.subtitleAr, s?.subtitleEn),
    about: pick(lang, s?.aboutAr, s?.aboutEn),
    address: pick(lang, s?.addressAr, s?.addressEn),
    workingHours: pick(lang, s?.workingHoursAr, s?.workingHoursEn),
    phone: clean(s?.phone),
    whatsapp: normalizeWhatsappNumber(s?.whatsappNumber),
    instagramUrl: httpUrl(s?.instagramUrl),
    mapUrl: httpUrl(s?.mapUrl),
    geo,
    heroVideoSrc: mediaSrc(s?.heroVideoKey),
    heroPosterSrc: mediaSrc(s?.heroPosterKey),
    categories: catalog.categories
      .filter((category) => usedCategoryIds.has(category.id))
      .flatMap((category) => {
        const name = pick(lang, category.nameAr, category.nameEn);
        return name ? [{ id: category.id, name }] : [];
      }),
    services: catalog.services.flatMap((service) => {
      const name = pick(lang, service.nameAr, service.nameEn);
      if (!name) return [];
      return [
        {
          id: service.id,
          name,
          description: pick(lang, service.descriptionAr, service.descriptionEn),
          categoryId: service.categoryId,
          availability: service.availability as Availability,
          price: formatPrice(service.price),
          imageSrc: mediaSrc(service.imageKey),
        },
      ];
    }),
    gallery: catalog.galleryImages.flatMap((image) => {
      const src = mediaSrc(image.fileKey);
      if (!src) return [];
      return [{ id: image.id, src, alt: pick(lang, image.altAr, image.altEn) ?? { text: t.galleryTitle, lang } }];
    }),
    demoNote: null,
  };
}

/** Every stored file the public page may show (the /media allow-list). */
export function publicMediaKeys(settings: SiteSettingsRecord | null, catalog: PublicCatalog): Set<string> {
  const keys = [
    settings?.heroVideoKey,
    settings?.heroPosterKey,
    ...catalog.services.map((service) => service.imageKey),
    ...catalog.galleryImages.map((image) => image.fileKey),
  ];
  return new Set(keys.filter((key): key is string => !!key));
}
