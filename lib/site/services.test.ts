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
  assert.equal(findFallback('المكياج الدائم')?.media, null);
  assert.equal(findFallback('المكياج')?.media, 'makeup');
  assert.equal(findFallback('خدمة جديدة'), null);
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
