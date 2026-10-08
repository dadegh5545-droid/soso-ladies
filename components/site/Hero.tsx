import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Place } from '@/lib/site/services';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import { HERO_VIDEO_SRC, PHOTOS } from './media';
import { Eyebrow, Lines, PrimaryButton } from './ui';
import styles from './Hero.module.css';

/**
 * Full-bleed hero video. The poster (makeup still) is in the first HTML and
 * preloaded; the video mounts after the page's load event so it never
 * competes with the first paint, and fades in once it plays. With reduced
 * motion the still stays. On desktop the text keeps to the left 40 %, clear
 * of the faces on the right of the frame (Hero.module.css).
 */
export function Hero({
  view,
  place,
  onPlace,
  showPlaces,
}: {
  view: SiteView;
  place: Place;
  onPlace: (place: Exclude<Place, 'all'>) => void;
  showPlaces: boolean;
}) {
  const t = strings[view.lang];
  const poster = PHOTOS.makeup;
  const [playVideo, setPlayVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = () => setPlayVideo(!query.matches);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    const onChange = () => setPlayVideo(!query.matches);
    query.addEventListener('change', onChange);
    return () => {
      window.removeEventListener('load', start);
      query.removeEventListener('change', onChange);
    };
  }, []);

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <Image
        src={poster.image}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className={styles.media}
        style={{ objectPosition: poster.position }}
      />
      {playVideo && (
        <video
          className={`${styles.media} ${styles.video}`}
          data-ready={videoReady || undefined}
          onPlaying={() => setVideoReady(true)}
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
        />
      )}
      <div className={styles.fade} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.copy}>
          <Eyebrow>{t.hero.eyebrow}</Eyebrow>
          <h1 id="hero-title" className={styles.title}>
            <Lines lines={t.hero.titleLines} />
          </h1>
          <p className={styles.body}>{t.hero.body}</p>
          {view.whatsapp && (
            <PrimaryButton href={whatsappLink(view.whatsapp, t.messages.booking)} className={styles.cta}>
              {t.hero.cta}
            </PrimaryButton>
          )}
          {showPlaces && (
            <div className={styles.segment} role="group" aria-label={t.hero.segmentLabel}>
              {(['salon', 'home'] as const).map((key) => (
                <button key={key} type="button" aria-pressed={place === key} onClick={() => onPlace(key)}>
                  {t.hero.segment[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
