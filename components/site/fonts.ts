/**
 * Public-site fonts (self-hosted by next/font). They are declared here, not
 * in _app, so only the public pages load them; the admin panel keeps its own.
 *
 * Each instance is its own font family, exposed as a CSS variable:
 * - --font-amiri: Arabic headlines.
 * - --font-almarai: body text (the only preload: small, and on every line).
 * - --font-almarai-bold: bold labels and buttons.
 * - --font-cormorant: English headlines.
 *
 * Amiri is large (about 100 KB for Arabic), so it is not preloaded: the hero
 * photo, the page's largest paint, gets the bandwidth first and the
 * headlines swap in (next/font adjusts the fallback's metrics to limit
 * shifts). The statement's italic line uses a slanted Amiri regular rather
 * than another 100 KB file.
 */
import { Almarai, Amiri, Cormorant_Garamond } from 'next/font/google';

const amiri = Amiri({
  subsets: ['arabic'],
  weight: '400',
  display: 'swap',
  preload: false,
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
