import Image from 'next/image';
import type { ReactNode } from 'react';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang, type Occasion } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import { PHOTOS, type Photo } from './media';
import { Eyebrow, Lines } from './ui';
import styles from './Occasions.module.css';

const TILES: { key: Occasion; photo: Photo }[] = [
  { key: 'bride', photo: PHOTOS.makeup },
  { key: 'evening', photo: PHOTOS.hair },
  { key: 'eid', photo: PHOTOS.henna },
];

/** Three occasion tiles; each opens WhatsApp with the occasion named. */
export function Occasions({ lang, whatsapp }: { lang: Lang; whatsapp: string | null }) {
  const t = strings[lang];
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="occasions-title">
      <div className={styles.inner}>
        <div className={styles.heading} {...revealItem(0)}>
          <Eyebrow>{t.occasions.eyebrow}</Eyebrow>
          <h2 id="occasions-title" className={styles.title}>
            <Lines lines={t.occasions.titleLines} />
          </h2>
        </div>
        <ul className={styles.grid} {...revealItem(1)}>
          {TILES.map(({ key, photo }) => {
            const name = t.occasions[key];
            const content = (
              <>
                <Image
                  src={photo.image}
                  alt=""
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 400px, 50vw"
                  className={styles.photo}
                  style={{ objectPosition: photo.position }}
                />
                <span className={styles.fade} aria-hidden="true" />
                <span className={styles.caption}>
                  <span className={styles.name}>{name}</span>
                  {key === 'bride' && <span className={styles.sub}>{t.occasions.brideSub}</span>}
                </span>
              </>
            );
            return (
              <li key={key} className={styles.tile} data-occasion={key}>
                {whatsapp ? (
                  <TileLink
                    href={whatsappLink(whatsapp, t.messages.occasion(t.occasions.inMessage[key]))}
                    label={t.occasions.askFor(t.occasions.inMessage[key])}
                  >
                    {content}
                  </TileLink>
                ) : (
                  <div className={styles.tileInner}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function TileLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a className={styles.tileInner} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  );
}
