import Image from 'next/image';
import Link from 'next/link';
import { ArrowIcon } from '@/components/icons';
import { revealItem, revealMedia, useReveal } from '@/lib/site/reveal';
import { pathFor } from '@/lib/site/routes';
import { strings, type Lang } from '@/lib/site/strings';
import { PHOTOS } from './media';
import { Eyebrow, Lines } from './ui';
import styles from './HomeTeaser.module.css';

/** Home page: the home service in a photo-and-text split, linking to its page. */
export function HomeTeaser({ lang }: { lang: Lang }) {
  const t = strings[lang].homeTeaser;
  const photo = PHOTOS.makeup;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="home-teaser-title">
      <div className={styles.inner}>
        <div className={styles.media} {...revealMedia(0)}>
          <Image
            src={photo.image}
            alt={t.imageAlt}
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 560px, 100vw"
            className={styles.photo}
            style={{ objectPosition: photo.position }}
          />
          <span className={styles.badge} aria-hidden="true">
            <Image src="/brand/soso-yellow.svg" alt="" width={390} height={182} unoptimized className={styles.badgeLogo} />
          </span>
        </div>
        <div className={styles.text} {...revealItem(1)}>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="home-teaser-title" className={styles.title}>
            <Lines lines={t.titleLines} />
          </h2>
          <p className={styles.body}>{t.body}</p>
          <Link href={pathFor('homeService', lang)} className={styles.link}>
            <span>{t.cta}</span>
            <ArrowIcon size={16} className={styles.arrow} />
          </Link>
        </div>
      </div>
    </section>
  );
}
