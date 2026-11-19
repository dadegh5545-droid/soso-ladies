import assert from 'node:assert/strict';
import { test } from 'node:test';
import { whatsappLink } from '../whatsapp';
import { eventsForLink, META_PIXEL_ID, pageViewPath, pixelBaseCode, pixelNoscriptSrc } from './meta-pixel';

const base = 'https://soso-ladies.qa/services';

test('WhatsApp links send Contact and Lead', () => {
  assert.deepEqual(eventsForLink(whatsappLink('97433428070', 'مرحباً سوسو، أرغب بحجز موعد.'), base), ['Contact', 'Lead']);
  assert.deepEqual(eventsForLink('https://wa.me/97433428070', base), ['Contact', 'Lead']);
  assert.deepEqual(eventsForLink('https://api.whatsapp.com/send?phone=97433428070', base), ['Contact', 'Lead']);
  assert.deepEqual(eventsForLink('whatsapp://send?phone=97433428070', base), ['Contact', 'Lead']);
});

test('phone links send Contact only', () => {
  assert.deepEqual(eventsForLink('tel:+97433428070', base), ['Contact']);
});

test('other links send nothing', () => {
  for (const href of [
    '/privacy',
    '/en/services?place=home',
    '#contact',
    'mailto:sosoladiessalon@gmail.com',
    'https://www.instagram.com/soso',
    'https://www.openstreetmap.org/?mlat=25.28',
    'https://wa.me.example.com/97433428070',
    '',
  ]) {
    assert.deepEqual(eventsForLink(href, base), [], href);
  }
});

test('only a new path is a new page view', () => {
  assert.equal(pageViewPath('/services?place=home'), '/services');
  assert.equal(pageViewPath('/#experience'), '/');
  assert.equal(pageViewPath('/en/about'), '/en/about');
  assert.equal(pageViewPath(''), '/');
});

test('base code: the pixel id, init and one PageView; noscript image', () => {
  assert.equal(META_PIXEL_ID, '1764939187936330');
  const code = pixelBaseCode();
  assert.ok(code.includes("fbq('init','1764939187936330');"));
  assert.equal(code.match(/fbq\('track','PageView'\)/g)?.length, 1);
  assert.ok(code.includes('https://connect.facebook.net/en_US/fbevents.js'));
  assert.equal(pixelNoscriptSrc(), 'https://www.facebook.com/tr?id=1764939187936330&ev=PageView&noscript=1');
});
