import { useEffect, useRef } from 'react';
import { revealItem, revealMedia, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { HERO_VIDEO_SRC, PHOTOS } from './media';
import { Eyebrow } from './ui';
import styles from './Showcase.module.css';

/**
 * The salon's video in a framed section. Nothing of it downloads until the
 * section comes near the view; it plays only while visible, muted and
 * looping, and never plays for reduced motion (the still stays).
 */
export function Showcase({ lang }: { lang: Lang }) {
  const t = strings[lang].aboutPage;
  const ref = useReveal<HTMLElement>();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute('src')) video.setAttribute('src', HERO_VIDEO_SRC);
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="showcase-title">
      <div className={styles.inner}>
        <div className={styles.heading} {...revealItem(0)}>
          <Eyebrow>{t.videoEyebrow}</Eyebrow>
          <h2 id="showcase-title" className={styles.title}>
            {t.videoTitle}
          </h2>
        </div>
        <div className={styles.frame} {...revealMedia(1)}>
          <video
            ref={videoRef}
            className={styles.video}
            poster={PHOTOS.makeup.image.src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            disableRemotePlayback
          />
        </div>
      </div>
    </section>
  );
}
