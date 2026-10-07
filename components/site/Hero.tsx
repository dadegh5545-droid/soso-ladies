import Image from 'next/image';
import { useEffect, useState } from 'react';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './Hero.module.css';

/**
 * Cinematic hero. The poster (or the tone color) is in the first HTML; the
 * video is mounted after hydration, and only when the visitor has not asked
 * for reduced motion, so it never competes with the poster for the first paint.
 */
export function Hero({ view, hasServices }: { view: SiteView; hasServices: boolean }) {
  const t = strings[view.lang];
  const [playVideo, setPlayVideo] = useState(false);
  // The video stays transparent over the poster until its first frame plays.
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!view.heroVideoSrc) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPlayVideo(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [view.heroVideoSrc]);

  return (
    <section id="top" className={styles.hero}>
      {view.heroPosterSrc && (
        <Image
          src={view.heroPosterSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.media}
        />
      )}
      {playVideo && view.heroVideoSrc && (
        <video
          className={`${styles.media} ${styles.video}`}
          data-ready={videoReady || undefined}
          onPlaying={() => setVideoReady(true)}
          src={view.heroVideoSrc}
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
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.line} aria-hidden="true" />
        <h1 className={styles.title} lang={view.tagline.lang}>
          {view.tagline.text}
        </h1>
        {view.subtitle && (
          <p className={styles.subtitle} lang={view.subtitle.lang} dir="auto">
            {view.subtitle.text}
          </p>
        )}
        {(view.whatsapp || hasServices) && (
          <div className={styles.buttons}>
            {view.whatsapp && (
              <a className={styles.primary} href={whatsappLink(view.whatsapp)} target="_blank" rel="noopener noreferrer">
                {t.whatsappCta}
              </a>
            )}
            {hasServices && (
              <a className={styles.secondary} href="#services">
                {t.browseServices}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
