/**
 * Homepage service rows: the admin's services, in the admin's order, with
 * fallback copy and photos for services that have none.
 * Pure data (no image imports) so it can be unit-tested; the photos are
 * resolved by key in components/site/media.ts.
 */
import type { Availability } from '@/lib/whatsapp';
import type { Lang } from './strings';
import type { LText, ServiceView } from './view';

export type Place = 'all' | 'salon' | 'home';

export type MediaKey = 'makeup' | 'hair' | 'henna' | 'facial' | 'pedicure' | 'manicure';

type Fallback = {
  /** Arabic names this entry answers to (compared after normalizeName). */
  names: string[];
  /** Copy from the brief; services without approved copy get a photo only. */
  tagline?: Record<Lang, string>;
  packages?: Record<Lang, string[]>;
  media: MediaKey | null;
};

/** Fallback copy from the redesign brief, used only where the admin data has none. */
const FALLBACKS: Fallback[] = [
  {
    names: ['المكياج'],
    tagline: {
      ar: 'إطلالة تليق بمناسبتك، من السهرة إلى ليلة العمر.',
      en: 'A look worthy of your occasion, from an evening out to your wedding night.',
    },
    packages: { ar: ['سهرة', 'عروس', 'مناسبات'], en: ['Evening', 'Bridal', 'Occasions'] },
    media: 'makeup',
  },
  {
    names: ['الشعر'],
    tagline: {
      ar: 'تسريح يدوم، وعلاج يعيد لشعرك حيويته.',
      en: 'Styling that lasts, and treatments that bring your hair back to life.',
    },
    packages: { ar: ['تسريح', 'علاج وعناية', 'قص وصبغة'], en: ['Styling', 'Treatment & care', 'Cut & color'] },
    media: 'hair',
  },
  {
    names: ['الحنة', 'الحناء'],
    tagline: { ar: 'نقوش خليجية وهندية بلمسة أنثوية راقية.', en: 'Gulf and Indian designs with a refined feminine touch.' },
    packages: { ar: ['عروس', 'مناسبات', 'بسيطة'], en: ['Bridal', 'Occasions', 'Simple'] },
    media: 'henna',
  },
  {
    names: ['الباديكير'],
    tagline: { ar: 'عناية كاملة لقدمين ناعمتين ومرتاحتين.', en: 'Complete care for soft, rested feet.' },
    packages: { ar: ['كلاسيكي', 'سبا', 'مع جل'], en: ['Classic', 'Spa', 'With gel'] },
    media: 'pedicure',
  },
  {
    names: ['المانيكير'],
    tagline: { ar: 'أظافر مرتبة بألوان تعكس ذوقك.', en: 'Neat nails in colors that reflect your taste.' },
    packages: { ar: ['كلاسيكي', 'جل', 'مع باديكير'], en: ['Classic', 'Gel', 'With pedicure'] },
    media: 'manicure',
  },
  {
    names: ['المكياج الدائم'],
    tagline: {
      ar: 'حواجب، آيلاينر وشفاه بلمسة طبيعية تدوم.',
      en: 'Brows, eyeliner and lips with a natural touch that lasts.',
    },
    packages: { ar: ['حواجب', 'آيلاينر', 'شفاه'], en: ['Brows', 'Eyeliner', 'Lips'] },
    media: 'makeup',
  },
  // Photo only (the brief has no copy for these two).
  { names: ['العناية بالبشرة'], media: 'facial' },
  { names: ['الأظافر'], media: 'manicure' },
];

/**
 * Comparison form of an Arabic service name: trimmed, lower case, without
 * diacritics, tatweel or a trailing note in brackets, with the common letter
 * variants unified (أ إ آ → ا, ة → ه, ى → ي). So «الحنّاء» matches «الحناء»
 * and «العناية بالبشرة (Facial)» compares as «العنايه بالبشره».
 */
export function normalizeName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function findFallback(nameAr: string): Fallback | null {
  const key = normalizeName(nameAr);
  return FALLBACKS.find((f) => f.names.some((n) => normalizeName(n) === key)) ?? null;
}

/** "In the salon" shows SALON and BOTH; "At home" shows HOME and BOTH. */
export function inPlace(availability: Availability, place: Place): boolean {
  if (place === 'all') return true;
  return place === 'salon' ? availability !== 'HOME' : availability !== 'SALON';
}

export const parsePlace = (value: unknown): Place => (value === 'salon' || value === 'home' ? value : 'all');

/** The filter row is useful only when some service is not offered in both places. */
export const needsPlaceFilter = (services: Pick<ServiceView, 'availability'>[]) =>
  services.some((s) => s.availability !== 'BOTH');

const EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Two-digit row or step number: ٠١ on Arabic pages, 01 on English pages. */
export function formatIndex(n: number, lang: Lang): string {
  const digits = String(n).padStart(2, '0');
  return lang === 'ar' ? digits.replace(/\d/g, (d) => EASTERN_DIGITS[Number(d)]) : digits;
}

export type ServiceRow = {
  id: string;
  name: LText;
  tagline: LText | null;
  packages: LText | null;
  availability: Availability;
  /** The admin's own image, which wins over the fallback photo. */
  imageSrc: string | null;
  media: MediaKey | null;
};

export function serviceRows(services: ServiceView[], lang: Lang): ServiceRow[] {
  return services.map((service) => {
    const fallback = findFallback(service.nameAr);
    return {
      id: service.id,
      name: service.name,
      tagline: service.description ?? (fallback?.tagline ? { text: fallback.tagline[lang], lang } : null),
      packages: fallback?.packages ? { text: fallback.packages[lang].join(' · '), lang } : null,
      availability: service.availability,
      imageSrc: service.imageSrc,
      media: service.imageSrc ? null : (fallback?.media ?? null),
    };
  });
}
