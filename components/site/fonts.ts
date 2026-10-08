/**
 * Homepage fonts (self-hosted by next/font). They are declared here, not in
 * _app, so only the public homepage loads them; the admin panel keeps its own.
 *
 * Each instance is its own font family, exposed as a CSS variable:
 * - --font-amiri: Arabic headlines (preloaded: the hero title uses it).
 * - --font-amiri-italic: the statement's italic line.
 * - --font-almarai: body text (preloaded).
 * - --font-almarai-bold: bold labels and buttons.
 * - --font-cormorant: English headlines.
 * Only the two preloaded files compete with the hero image; the rest swap in.
 */
import { Almarai, Amiri, Cormorant_Garamond } from 'next/font/google';

const amiri = Amiri({
  subsets: ['arabic'],
  weight: '400',
  display: 'swap',
  variable: '--font-amiri',
});

const amiriItalic = Amiri({
  subsets: ['arabic'],
  weight: '400',
  style: 'italic',
  display: 'swap',
  preload: false,
  variable: '--font-amiri-italic',
});

const almarai = Almarai({
  subsets: ['arabic'],
  weight: '400',
  display: 'swap',
  variable: '--font-almarai',
});

const almaraiBold = Almarai({
  subsets: ['arabic'],
  weight: '700',
  display: 'swap',
  preload: false,
  variable: '--font-almarai-bold',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
  variable: '--font-cormorant',
});

/** Class names that define the font variables on the page root. */
export const fontVariables = [amiri, amiriItalic, almarai, almaraiBold, cormorant]
  .map((font) => font.variable)
  .join(' ');
