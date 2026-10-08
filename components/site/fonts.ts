/**
 * Public-site fonts (self-hosted by next/font). They are declared here, not
 * in _app, so only the public pages load them; the admin panel keeps its own.
 *
 * Each instance is its own font family, exposed as a CSS variable:
 * - --font-amiri: Arabic headlines (preloaded with Almarai regular: measured,
 *   first paint is about a second earlier than when it swaps in late).
 * - --font-almarai: body text.
 * - --font-almarai-bold: bold labels and buttons.
 * - --font-cormorant: English headlines.
 *
 * The statement's italic line uses a slanted Amiri regular rather than a
 * second 100 KB Amiri file.
 */
import { Almarai, Amiri, Cormorant_Garamond } from 'next/font/google';

const amiri = Amiri({
  subsets: ['arabic'],
  weight: '400',
  display: 'swap',
  variable: '--font-amiri',
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
export const fontVariables = [amiri, almarai, almaraiBold, cormorant].map((font) => font.variable).join(' ');
