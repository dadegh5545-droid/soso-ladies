/**
 * The hero carousel's images: the salon's own service illustrations
 * (content/images), cropped to the arch frame (5:6, 1000 x 1200). Static
 * imports give next/image their size and a blur placeholder at build time.
 */
import type { StaticImageData } from 'next/image';
import facial from '@/assets/hero/facial.jpg';
import hair from '@/assets/hero/hair.jpg';
import nails from '@/assets/hero/nails.jpg';
import permanentMakeup from '@/assets/hero/permanent-makeup.jpg';

export type HeroSlideKey = 'permanent-makeup' | 'nails' | 'hair' | 'facial';

export type HeroSlide = { key: HeroSlideKey; image: StaticImageData };

export const HERO_SLIDES: HeroSlide[] = [
  { key: 'permanent-makeup', image: permanentMakeup },
  { key: 'nails', image: nails },
  { key: 'hair', image: hair },
  { key: 'facial', image: facial },
];

/** How long each slide stays before the next one fades in. */
export const HERO_SLIDE_INTERVAL_MS = 3000;
