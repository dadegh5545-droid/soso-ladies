/** "ما ينقص الموقع": what the public page cannot show yet, each with a link to fix it. */
import type { GalleryImage, Service, ServiceCategory, SiteSettings } from './amplify';

export type MissingItem = { label: string; href: string };

const empty = (value: string | null | undefined) => !value?.trim();

export function missingItems(input: {
  settings: SiteSettings | null;
  services?: Service[];
  categories?: ServiceCategory[];
  gallery?: GalleryImage[];
}): MissingItem[] {
  const { settings: s, services, categories, gallery } = input;
  const items: MissingItem[] = [];

  if (!s) {
    items.push({ label: 'الإعدادات العامة لم تُحفظ بعد', href: '/admin/settings' });
  }
  if (empty(s?.whatsappNumber)) items.push({ label: 'رقم الواتساب لم يُدخل', href: '/admin/settings#whatsappNumber' });
  if (empty(s?.heroVideoKey)) items.push({ label: 'لا يوجد فيديو للصفحة الرئيسية', href: '/admin/video' });
  else if (empty(s?.heroPosterKey)) items.push({ label: 'لا توجد صورة غلاف للفيديو', href: '/admin/video' });

  if (services) {
    const visibleCategories = new Set((categories ?? []).filter((c) => c.isVisible).map((c) => c.id));
    const shown = services.filter((service) => service.isVisible && visibleCategories.has(service.categoryId));
    if (shown.length === 0) items.push({ label: 'لا توجد خدمات ظاهرة في الموقع', href: '/admin/services' });
  }
  if (gallery && !gallery.some((image) => image.isVisible)) {
    items.push({ label: 'لا توجد صور ظاهرة في المعرض', href: '/admin/gallery' });
  }

  if (empty(s?.aboutAr)) items.push({ label: 'نبذة «عن الصالون» فارغة', href: '/admin/settings#aboutAr' });
  if (empty(s?.addressAr)) items.push({ label: 'العنوان لم يُدخل', href: '/admin/settings#addressAr' });
  if (empty(s?.workingHoursAr)) items.push({ label: 'ساعات العمل لم تُدخل', href: '/admin/settings#workingHoursAr' });
  if (empty(s?.phone)) items.push({ label: 'رقم الهاتف لم يُدخل', href: '/admin/settings#phone' });
  if (empty(s?.instagramUrl)) items.push({ label: 'رابط انستقرام لم يُدخل', href: '/admin/settings#instagramUrl' });
  if (empty(s?.mapUrl) && (s?.latitude == null || s?.longitude == null)) {
    items.push({ label: 'موقع الخريطة لم يُدخل', href: '/admin/settings#mapUrl' });
  }
  return items;
}
