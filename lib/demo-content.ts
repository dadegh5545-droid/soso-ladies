/**
 * Demo content for local development only. lib/server/home-props.ts loads
 * this module behind a NODE_ENV === 'development' check, so production builds
 * neither include nor run it. Each part fills in only where the real data is
 * empty, and the page shows a banner while any of it is on screen.
 * Turn it off with DEMO_CONTENT=off to see the real empty states.
 */
import type { Lang } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';

const ar = (text: string) => ({ text, lang: 'ar' as const });
const en = (text: string) => ({ text, lang: 'en' as const });

const categories = [
  { id: 'demo-hair', ar: 'الشعر', en: 'Hair' },
  { id: 'demo-makeup', ar: 'المكياج والحنّاء', en: 'Makeup & henna' },
  { id: 'demo-nails', ar: 'الأظافر', en: 'Nails' },
  { id: 'demo-skin', ar: 'البشرة', en: 'Skin' },
];

const services = [
  { id: 'demo-1', cat: 'demo-hair', type: 'SALON', price: '150', ar: ['صبغ وعناية بالشعر', 'ألوان مدروسة وعناية تحافظ على صحة الشعر.'], en: ['Hair color & care', 'Considered colors and care that keeps hair healthy.'] },
  { id: 'demo-2', cat: 'demo-hair', type: 'BOTH', price: null, ar: ['تسريحات المناسبات', 'تسريحة تناسب فستانك وشكل وجهك.'], en: ['Occasion hairstyles', 'A style that suits your dress and face shape.'] },
  { id: 'demo-3', cat: 'demo-makeup', type: 'BOTH', price: '300', ar: ['مكياج سهرة', 'مكياج متكامل لإطلالة تدوم طوال المناسبة.'], en: ['Evening makeup', 'Complete makeup that lasts the whole occasion.'] },
  { id: 'demo-4', cat: 'demo-makeup', type: 'HOME', price: null, ar: ['حنّاء ونقش', 'نقوش ناعمة بتصاميم تناسب المناسبة.'], en: ['Henna designs', 'Fine patterns designed for the occasion.'] },
  { id: 'demo-5', cat: 'demo-nails', type: 'SALON', price: null, ar: ['مانيكير وباديكير', 'عناية كاملة باليدين والقدمين.'], en: ['Manicure & pedicure', 'Complete care for hands and feet.'] },
  { id: 'demo-6', cat: 'demo-skin', type: 'SALON', price: '200', ar: ['جلسة عناية بالبشرة', 'تنظيف وترطيب لبشرة متوازنة ومشرقة.'], en: ['Skin care session', 'Cleansing and hydration for balanced, glowing skin.'] },
] as const;

export function applyDemo(view: SiteView, hasSettings: boolean): SiteView {
  const lang: Lang = view.lang;
  const text = (pair: { ar: string; en: string }) => (lang === 'en' ? en(pair.en) : ar(pair.ar));
  const next: SiteView = { ...view };
  let used = false;

  if (!hasSettings) {
    used = true;
    next.subtitle = text({ ar: '[سطر قصير يعرّف بالصالون: محتوى تجريبي]', en: '[A short line about the salon: demo content]' });
    next.about = text({ ar: '[نبذة قصيرة عن الصالون وفريقه، تُكتب من لوحة الإدارة: محتوى تجريبي]', en: '[A short note about the salon and its team, written in the admin panel: demo content]' });
    next.address = text({ ar: '[العنوان: تجريبي]', en: '[Address: demo]' });
    next.workingHours = text({ ar: '[ساعات العمل: تجريبي]', en: '[Working hours: demo]' });
    next.phone = '+974 0000 0000';
    next.whatsapp = '97400000000';
    next.instagramUrl = 'https://www.instagram.com/';
    next.mapUrl = 'https://www.openstreetmap.org/';
    next.geo = { lat: 25.2854, lng: 51.531 };
  }

  if (view.services.length === 0) {
    used = true;
    next.categories = categories.map((c) => ({ id: c.id, name: text(c) }));
    next.services = services.map((s) => ({
      id: s.id,
      name: lang === 'en' ? en(s.en[0]) : ar(s.ar[0]),
      description: lang === 'en' ? en(s.en[1]) : ar(s.ar[1]),
      categoryId: s.cat,
      availability: s.type,
      price: s.price,
      imageSrc: null,
    }));
  }

  if (view.gallery.length === 0) {
    used = true;
    next.gallery = Array.from({ length: 6 }, (_, i) => ({
      id: `demo-g${i}`,
      src: i % 2 ? '/brand/soso-logo-1080.png' : '/brand/soso-logo-v2-1080.png',
      alt: text({ ar: 'صورة تجريبية', en: 'Demo image' }),
    }));
  }

  next.demoNote = used
    ? lang === 'en'
      ? 'Demo content: shown in development only because the data is empty. It never reaches the published site.'
      : 'محتوى تجريبي: يظهر في بيئة التطوير فقط لأن البيانات فارغة، ولا يصل إلى الموقع المنشور.'
    : null;
  return next;
}
