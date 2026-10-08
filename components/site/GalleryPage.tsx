import type { SiteProps } from '@/lib/server/site-props';
import { strings } from '@/lib/site/strings';
import { FinalCta } from './FinalCta';
import { GalleryGrid, type GalleryItem } from './GalleryGrid';
import { GALLERY_ORDER, PHOTOS } from './media';
import { PageHero } from './PageHero';
import { SiteLayout } from './SiteLayout';

/** Gallery: the salon's photos, then the images the owner adds in /admin. */
export function GalleryPage(props: SiteProps) {
  const { view } = props;
  const t = strings[view.lang];
  const items: GalleryItem[] = [
    ...GALLERY_ORDER.map((key) => ({
      id: `photo-${key}`,
      src: PHOTOS[key].image,
      position: PHOTOS[key].position,
      alt: { text: t.gallery.alts[key], lang: view.lang },
    })),
    ...view.gallery.map((image) => ({ id: image.id, src: image.src, alt: image.alt })),
  ];

  return (
    <SiteLayout {...props} page="gallery" title={t.nav.gallery} description={t.pages.gallery.lead}>
      <PageHero
        lang={view.lang}
        page="gallery"
        eyebrow={t.pages.gallery.eyebrow}
        titleLines={t.pages.gallery.titleLines}
        lead={t.pages.gallery.lead}
        photo={PHOTOS.henna}
        alt={t.pages.gallery.imageAlt}
      />
      <GalleryGrid items={items} lang={view.lang} />
      <FinalCta lang={view.lang} whatsapp={view.whatsapp} />
    </SiteLayout>
  );
}
