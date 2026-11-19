import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeWhatsappNumber } from '../whatsapp';
import { dataDeletion, LEGAL_CONTACT, legalMailto, privacyPolicy, splitLinks, type LegalDoc } from './legal';
import { pathFor } from './routes';

test('legal pages: Arabic at the root, English under /en', () => {
  assert.equal(pathFor('privacy', 'ar'), '/privacy');
  assert.equal(pathFor('privacy', 'en'), '/en/privacy');
  assert.equal(pathFor('dataDeletion', 'ar'), '/data-deletion');
  assert.equal(pathFor('dataDeletion', 'en'), '/en/data-deletion');
});

test('contact details are the ones given to Meta', () => {
  assert.equal(normalizeWhatsappNumber(LEGAL_CONTACT.whatsappDisplay), LEGAL_CONTACT.whatsapp);
  assert.equal(LEGAL_CONTACT.whatsapp, '97433428070');
  assert.equal(LEGAL_CONTACT.email, 'sosoladiessalon@gmail.com');
});

test('placeholders split into text and links, in order', () => {
  assert.deepEqual(splitLinks('WhatsApp {whatsapp} or {email}.'), [
    'WhatsApp ',
    { link: 'whatsapp' },
    ' or ',
    { link: 'email' },
    '.',
  ]);
  assert.deepEqual(splitLinks('{privacy}'), [{ link: 'privacy' }]);
  assert.deepEqual(splitLinks('no links'), ['no links']);
  assert.throws(() => splitLinks('a {typo} here'), /Unknown link \{typo\}/);
});

function texts(doc: LegalDoc): string[] {
  return doc.sections.flatMap((s) => [s.title, ...s.body.flatMap((b) => ('p' in b ? [b.p] : 'ul' in b ? b.ul : b.ol))]);
}

test('both languages carry the same sections, and every placeholder is known', () => {
  for (const doc of [privacyPolicy, dataDeletion]) {
    assert.deepEqual(
      doc.ar.sections.map((s) => s.id),
      doc.en.sections.map((s) => s.id),
    );
    for (const lang of ['ar', 'en'] as const) for (const text of texts(doc[lang])) splitLinks(text);
  }
});

test('the privacy policy links to the data-deletion page and shows its effective date', () => {
  for (const lang of ['ar', 'en'] as const) {
    assert.ok(texts(privacyPolicy[lang]).some((text) => text.includes('{dataDeletion}')));
    assert.equal(privacyPolicy[lang].effective?.iso, '2026-11-19');
  }
});

test('the data-deletion page promises 30 days and a confirmation, and its cards prefill the request', () => {
  assert.ok(texts(dataDeletion.ar).some((text) => text.includes('30 يوماً')));
  assert.ok(texts(dataDeletion.en).some((text) => text.includes('within 30 days')));
  const mail = legalMailto(dataDeletion.en.contact.request);
  assert.ok(mail.startsWith('mailto:sosoladiessalon@gmail.com?subject=Data%20deletion%20request&body='));
  assert.ok(!mail.includes('+'));
  assert.equal(legalMailto(), 'mailto:sosoladiessalon@gmail.com');
});
