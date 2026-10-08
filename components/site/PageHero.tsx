import Image from 'next/image';
import Link from 'next/link';
import { pathFor, type PageKey } from '@/lib/site/routes';
import { strings, type Lang } from '@/lib/site/strings';
import type { Photo } from './media';
import { Eyebrow, Lines } from './ui';
import styles from './PageHero.module.css';

/**
 * Banner of an inner page: a photo settling from a slow zoom (or the brand
 * magenta with the shop-sign face when there is no photo), a breadcrumb, and
 * the page title. Its id "top" lets the phone booking bar stay hidden over it.
 */
export function PageHero({
  lang,
  page,
  eyebrow,
  titleLines,
  lead,
  photo,
  alt,
}: {
  lang: Lang;
  page: PageKey;
  eyebrow: string;
  titleLines: readonly string[];
  lead: string;
  photo?: Photo;
  alt?: string;
}) {
  const t = strings[lang];
  return (
    <section id="top" className={styles.hero} data-brand={photo ? undefined : ''} aria-labelledby="page-title">
      {photo ? (
        <Image
          src={photo.image}
          alt={alt ?? ''}
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className={styles.image}
          style={{ objectPosition: photo.position }}
        />
      ) : (
        <Image src="/brand/face-white.svg" alt="" width={205} height={313} unoptimized priority className={styles.face} />
      )}
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.content}>
        <nav aria-label={t.breadcrumb} className={styles.breadcrumb}>
          <ol>
            <li>
              <Link href={pathFor('home', lang)}>{t.nav.home}</Link>
            </li>
            <li aria-current="page">{t.nav[page]}</li>
          </ol>
        </nav>
        <Eyebrow tone={photo ? 'accent' : 'light'}>{eyebrow}</Eyebrow>
        <h1 id="page-title" className={styles.title}>
          <Lines lines={titleLines} />
        </h1>
        <p className={styles.lead}>{lead}</p>
      </div>
    </section>
  );
}
