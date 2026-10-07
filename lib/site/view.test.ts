import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSiteView, pick, publicMediaKeys, type PublicCatalog, type SiteSettingsRecord } from './view';

const emptyCatalog: PublicCatalog = { categories: [], services: [], galleryImages: [] };

const settings = (fields: Partial<SiteSettingsRecord>) =>
  ({ id: 'main', salonNameAr: 'سوسو', createdAt: '', updatedAt: '', ...fields }) as SiteSettingsRecord;

test('English falls back to Arabic; empty text is null', () => {
  assert.deepEqual(pick('en', 'عربي', 'English'), { text: 'English', lang: 'en' });
  assert.deepEqual(pick('en', 'عربي', '  '), { text: 'عربي', lang: 'ar' });
  assert.deepEqual(pick('ar', 'عربي', 'English'), { text: 'عربي', lang: 'ar' });
  assert.equal(pick('ar', '', null), null);
});

test('no settings record: brand defaults, every optional element hidden', () => {
  const view = buildSiteView('ar', null, emptyCatalog);
  assert.equal(view.salonName.text, 'سوسو صالون نسائي');
  assert.equal(view.tagline.text, 'جمالك شغفنا');
  for (const key of ['subtitle', 'about', 'address', 'workingHours', 'phone', 'whatsapp', 'instagramUrl', 'mapUrl', 'geo', 'heroVideoSrc', 'heroPosterSrc'] as const) {
    assert.equal(view[key], null, key);
  }
  assert.equal(view.services.length + view.gallery.length + view.categories.length, 0);
  assert.equal(view.demoNote, null);
});

test('invalid values are dropped instead of shown', () => {
  const view = buildSiteView(
    'ar',
    settings({ whatsappNumber: '0555', instagramUrl: 'javascript:alert(1)', mapUrl: 'ftp://x', latitude: 120, longitude: 10, heroVideoKey: 'private/x.mp4' }),
    emptyCatalog,
  );
  assert.equal(view.whatsapp, null);
  assert.equal(view.instagramUrl, null);
  assert.equal(view.mapUrl, null);
  assert.equal(view.geo, null);
  assert.equal(view.heroVideoSrc, null);
});

test('media keys become /media URLs and categories without services are not offered', () => {
  const catalog: PublicCatalog = {
    categories: [
      { id: 'c1', nameAr: 'الشعر', nameEn: null, sortOrder: 1 },
      { id: 'c2', nameAr: 'فارغة', nameEn: null, sortOrder: 2 },
    ],
    services: [
      { id: 's1', nameAr: 'قص', nameEn: 'Cut', categoryId: 'c1', availability: 'BOTH', price: 150, imageKey: 'media/services/a.webp' },
    ],
    galleryImages: [{ id: 'g1', fileKey: 'media/gallery/b.webp', altAr: 'صورة', altEn: null }],
  };
  const view = buildSiteView('en', settings({ heroPosterKey: 'media/hero/p.webp' }), catalog);
  assert.deepEqual(view.categories.map((c) => c.id), ['c1']);
  assert.equal(view.services[0].name.text, 'Cut');
  assert.equal(view.services[0].price, '150');
  assert.equal(view.services[0].imageSrc, '/media/services/a.webp');
  assert.equal(view.gallery[0].src, '/media/gallery/b.webp');
  assert.deepEqual(view.gallery[0].alt, { text: 'صورة', lang: 'ar' });
  assert.equal(view.heroPosterSrc, '/media/hero/p.webp');

  const keys = publicMediaKeys(settings({ heroPosterKey: 'media/hero/p.webp' }), catalog);
  assert.deepEqual(Array.from(keys).sort(), ['media/gallery/b.webp', 'media/hero/p.webp', 'media/services/a.webp']);
});
