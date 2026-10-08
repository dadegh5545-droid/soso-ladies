import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findFallback, formatIndex, inPlace, needsPlaceFilter, normalizeName, parsePlace, serviceRows } from './services';
import type { ServiceView } from './view';

const service = (fields: Partial<ServiceView> & Pick<ServiceView, 'nameAr'>): ServiceView => ({
  id: fields.nameAr,
  name: { text: fields.nameAr, lang: 'ar' },
  description: null,
  categoryId: 'c1',
  availability: 'BOTH',
  price: null,
  imageSrc: null,
  ...fields,
});

test('names compare without diacritics, brackets or letter variants', () => {
  assert.equal(normalizeName('  الحنّاء '), 'الحناء');
  assert.equal(normalizeName('العناية بالبشرة (Facial)'), 'العنايه بالبشره');
  assert.equal(normalizeName('إطلالة'), 'اطلاله');
  assert.ok(findFallback('الحنّاء'));
  assert.ok(findFallback('الحنة'));
  assert.equal(findFallback('المكياج الدائم')?.packages?.ar.length, 3);
  assert.equal(findFallback('المكياج')?.media, 'makeup');
  assert.equal(findFallback('العناية بالبشرة (Facial)')?.media, 'facial');
  assert.equal(findFallback('الأظافر')?.packages?.ar.join(' · '), 'باديكير · مانيكير · جل');
  assert.equal(findFallback('خدمة جديدة'), null);
});

test('the five current service names all find their fallback', () => {
  // As stored in the data: shadda and hamza on henna, a bracketed note on facial.
  const names = ['العناية بالبشرة (Facial)', 'المكياج الدائم', 'الشعر', 'الأظافر', 'الحنّاء'];
  for (const name of names) {
    assert.ok(findFallback(name)?.tagline, name);
    assert.equal(findFallback(name)?.packages?.ar.length, 3, name);
  }
  assert.equal(findFallback('العناية بالبشرة (Facial)')?.packages?.en.join(' · '), 'Deep cleansing · Hydration · Anti-aging glow');
  // Letter variants: alef forms, taa marbuta / haa, alef maqsura / yaa, spaces.
  assert.ok(findFallback('  الاظافر '));
  assert.ok(findFallback('العنايه بالبشره'));
  assert.equal(normalizeName('مكياج المناسبى'), normalizeName('مكياج المناسبي'));
  assert.equal(normalizeName('آيلاينر'), normalizeName('ايلاينر'));
});

test('rows: admin text and image win; fallback fills the gaps', () => {
  const [hair, henna, unknown] = serviceRows(
    [
      service({ nameAr: 'الشعر', description: { text: 'من الإدارة', lang: 'ar' } }),
      service({ nameAr: 'الحنّاء', imageSrc: '/media/services/h.webp' }),
      service({ nameAr: 'خدمة جديدة' }),
    ],
    'en',
  );
  assert.deepEqual(hair.tagline, { text: 'من الإدارة', lang: 'ar' });
  assert.equal(hair.packages?.text, 'Styling · Treatment & care · Cut & color');
  assert.equal(hair.media, 'hair');
  assert.equal(henna.media, null, 'the admin image wins over the fallback photo');
  assert.equal(henna.tagline?.text, 'Gulf and Indian designs with a refined feminine touch.');
  assert.equal(unknown.tagline, null);
  assert.equal(unknown.packages, null);
  assert.equal(unknown.media, null);
});

test('numbers: Eastern Arabic digits on Arabic pages', () => {
  assert.equal(formatIndex(1, 'ar'), '٠١');
  assert.equal(formatIndex(12, 'ar'), '١٢');
  assert.equal(formatIndex(3, 'en'), '03');
});

test('place filter', () => {
  assert.equal(parsePlace('home'), 'home');
  assert.equal(parsePlace(['salon']), 'all');
  assert.equal(parsePlace(undefined), 'all');
  assert.ok(inPlace('BOTH', 'home') && inPlace('BOTH', 'salon'));
  assert.ok(inPlace('SALON', 'salon') && !inPlace('SALON', 'home'));
  assert.ok(inPlace('HOME', 'all'));
  assert.equal(needsPlaceFilter([{ availability: 'BOTH' }]), false);
  assert.equal(needsPlaceFilter([{ availability: 'BOTH' }, { availability: 'HOME' }]), true);
});
