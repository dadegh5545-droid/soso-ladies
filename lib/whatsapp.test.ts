import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeWhatsappNumber, serviceMessage, whatsappLink } from './whatsapp';

test('normalizes international numbers to digits only', () => {
  assert.equal(normalizeWhatsappNumber('+974 5555 1234'), '97455551234');
  assert.equal(normalizeWhatsappNumber('974-5555-1234'), '97455551234');
  assert.equal(normalizeWhatsappNumber('05555 1234'), null, 'local numbers starting with 0 are rejected');
  assert.equal(normalizeWhatsappNumber('12345'), null, 'too short');
  assert.equal(normalizeWhatsappNumber('abc'), null);
  assert.equal(normalizeWhatsappNumber(''), null);
  assert.equal(normalizeWhatsappNumber(null), null);
});

test('builds wa.me links with an encoded message', () => {
  assert.equal(whatsappLink('97455551234'), 'https://wa.me/97455551234');
  assert.equal(whatsappLink('97455551234', 'a b&c'), 'https://wa.me/97455551234?text=a%20b%26c');
});

test('Arabic message adds the place by availability, and BOTH follows the tab', () => {
  const base = 'السلام عليكم، أبغى أستفسر عن خدمة مكياج';
  assert.equal(serviceMessage('ar', 'مكياج', 'SALON', 'all'), `${base} (في الصالون)`);
  assert.equal(serviceMessage('ar', 'مكياج', 'HOME', 'all'), `${base} (منزلية)`);
  assert.equal(serviceMessage('ar', 'مكياج', 'BOTH', 'all'), base);
  assert.equal(serviceMessage('ar', 'مكياج', 'BOTH', 'salon'), `${base} (في الصالون)`);
  assert.equal(serviceMessage('ar', 'مكياج', 'BOTH', 'home'), `${base} (منزلية)`);
});

test('English message uses the English suffixes', () => {
  assert.equal(serviceMessage('en', 'Makeup', 'SALON', 'home'), "Hello, I'd like to ask about Makeup (at the salon)");
  assert.equal(serviceMessage('en', 'Makeup', 'BOTH', 'home'), "Hello, I'd like to ask about Makeup (home visit)");
  assert.equal(serviceMessage('en', 'Makeup', 'BOTH', 'all'), "Hello, I'd like to ask about Makeup");
});
