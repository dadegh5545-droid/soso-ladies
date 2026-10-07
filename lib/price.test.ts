import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PriceText } from '../components/PriceText';
import { formatPrice } from './price';

test('whole amounts have no fraction; thousands are separated', () => {
  assert.equal(formatPrice(150), '150');
  assert.equal(formatPrice(1500), '1,500');
  assert.equal(formatPrice(12500.5), '12,500.5');
  assert.equal(formatPrice(99.999), '100');
});

test('missing, zero, negative or invalid prices are hidden', () => {
  for (const value of [null, undefined, 0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(formatPrice(value), null, String(value));
  }
});

test('Arabic isolates the number left-to-right; English puts QAR first', () => {
  assert.equal(renderToStaticMarkup(createElement(PriceText, { lang: 'ar', amount: '1,500' })), 'من <bdi dir="ltr">1,500</bdi> ر.ق');
  assert.equal(renderToStaticMarkup(createElement(PriceText, { lang: 'en', amount: '1,500' })), 'From QAR 1,500');
});
