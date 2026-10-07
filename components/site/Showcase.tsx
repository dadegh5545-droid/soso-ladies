import { useEffect, useRef } from 'react';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { SectionHeading } from './SectionHeading';
import styles from './Showcase.module.css';

/**
 * The salon's video (set in /admin), framed in its own section. Nothing of it
 * downloads until the section comes near the view; it plays only while
 * visible, muted and looping, and never plays for reduced motion (the
 * poster stays).
 */
export function Showcase({ view, src }: { view: SiteView; src: string }) {
  const ref = useReveal<HTMLElement>();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute('src')) video.setAttribute('src', src);
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="showcase-title">
      <div {...revealItem(0)}>
        <SectionHeading id="showcase-title" title={strings[view.lang].showcaseTitle} />
      </div>
      <div className={styles.frame} {...revealItem(1)}>
        <video
          ref={videoRef}
          className={styles.video}
          poster={view.heroPosterSrc ?? undefined}
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
    </section>
  );
}
