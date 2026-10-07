/**
 * WhatsApp helpers shared by the public site and the admin panel
 * (docs/design/DESIGN.md, "بطاقة الخدمة").
 */
import type { Lang } from './site/strings';

export type Availability = 'SALON' | 'HOME' | 'BOTH';
export type ServiceTab = 'all' | 'salon' | 'home';

/**
 * Digits only, international format without "+" or "00" (e.g. 9745XXXXXXX),
 * as wa.me expects. Returns null when the value cannot be such a number.
 */
export function normalizeWhatsappNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/[\s()+-]/g, '');
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Where the visitor asks for the service. A BOTH service follows the active
 * tab; under "all" no place is added.
 */
function placeFor(availability: Availability, tab: ServiceTab): 'salon' | 'home' | null {
  if (availability === 'SALON') return 'salon';
  if (availability === 'HOME') return 'home';
  return tab === 'all' ? null : tab;
}

export function serviceMessage(lang: Lang, name: string, availability: Availability, tab: ServiceTab): string {
  const place = placeFor(availability, tab);
  if (lang === 'ar') {
    const suffix = place === 'salon' ? ' (في الصالون)' : place === 'home' ? ' (منزلية)' : '';
    return `السلام عليكم، أبغى أستفسر عن خدمة ${name}${suffix}`;
  }
  const suffix = place === 'salon' ? ' (at the salon)' : place === 'home' ? ' (home visit)' : '';
  return `Hello, I'd like to ask about ${name}${suffix}`;
}
