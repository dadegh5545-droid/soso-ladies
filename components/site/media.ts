/**
 * The homepage photos and video in public/media (supplied with the redesign).
 * Static imports give next/image their size and a blur placeholder.
 * `position` keeps the subject in frame when a photo is cropped.
 */
import type { StaticImageData } from 'next/image';
import type { MediaKey } from '@/lib/site/services';
import facial from '@/public/media/soso-facial.jpg';
import hair from '@/public/media/soso-hair.jpg';
import henna from '@/public/media/soso-henna.jpg';
import makeup from '@/public/media/soso-makeup.jpg';
import manicure from '@/public/media/soso-manicure.jpg';
import pedicure from '@/public/media/soso-pedicure.jpg';

export type Photo = { image: StaticImageData; position: string };

export const PHOTOS: Record<'makeup' | 'hair' | 'henna' | 'facial', Photo> = {
  makeup: { image: makeup, position: '70% center' },
  hair: { image: hair, position: '40% center' },
  henna: { image: henna, position: '55% 40%' },
  facial: { image: facial, position: '55% center' },
};

/** Fallback photo for a service row (stock credits in public/media/CREDITS.md). */
export const SERVICE_PHOTOS: Record<MediaKey, Photo> = {
  ...PHOTOS,
  pedicure: { image: pedicure, position: '72% 60%' },
  manicure: { image: manicure, position: '62% center' },
};

/** Served as a static file; 1280 × 720, 12 s, silent, loops. */
export const HERO_VIDEO_SRC = '/media/Soso_Website_Hero_12s.mp4';
