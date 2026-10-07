import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PauseIcon, PlayIcon } from '@/components/icons';
import { HERO_SLIDES, HERO_SLIDE_INTERVAL_MS } from '@/lib/site/hero-slides';
import { strings, type Lang } from '@/lib/site/strings';
import styles from './HeroCarousel.module.css';

/**
 * Self-advancing slideshow in an arch frame.
 * - Speed: only the first slide is in the first HTML (preloaded, high
 *   priority); the others mount after the page's load event, so they never
 *   compete with it.
 * - Motion: each slide cross-fades in and slowly settles from a zoom. It does
 *   not advance for reduced motion, while hovered or focused, when the tab is
 *   hidden or the frame is off screen, or after the pause button.
 */
export function HeroCarousel({ lang }: { lang: Lang }) {
  const t = strings[lang];
  const slides = HERO_SLIDES;
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [loadedAll, setLoadedAll] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const playing = loadedAll && !userPaused && !holding && !offscreen && !reducedMotion;

  useEffect(() => {
    const start = () => setLoadedAll(true);
    if (document.readyState === 'complete') {
      start();
      return;
    }
    window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Off screen or in a background tab: stop advancing.
  useEffect(() => {
    const element = rootRef.current;
    let inView = true;
    const update = () => setOffscreen(document.hidden || !inView);
    const io =
      element && 'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            update();
          })
        : null;
    if (element) io?.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), HERO_SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, slides.length]);

  const name = (i: number) => t.slides[slides[i].key];

  return (
    <div
      ref={rootRef}
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.carousel.label}
      style={{ '--slide-interval': `${HERO_SLIDE_INTERVAL_MS}ms` } as CSSProperties}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHolding(true)}
      onPointerLeave={() => setHolding(false)}
      // Keyboard focus holds the slide; a mouse click on the controls must not.
      onFocus={(event) => (event.target as HTMLElement).matches(':focus-visible') && setHolding(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHolding(false);
      }}
    >
      <div className={styles.stage}>
        <div className={styles.outline} aria-hidden="true" />
        <Sparkles />
        <div className={styles.frame}>
          {slides.map((slide, i) =>
            i === 0 || loadedAll ? (
              <div
                key={slide.key}
                className={styles.slide}
                data-active={i === index || undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={t.carousel.slide(i + 1, slides.length, name(i))}
                aria-hidden={i !== index}
              >
                <Image
                  src={slide.image}
                  alt={name(i)}
                  fill
                  priority={i === 0}
                  placeholder="blur"
                  sizes="(min-width: 720px) 470px, 78vw"
                  className={styles.image}
                />
              </div>
            ) : null,
          )}
          <p className={styles.caption} aria-live={playing ? 'off' : 'polite'}>
            <span key={index} className={styles.captionText}>
              {name(index)}
            </span>
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.pause}
          onClick={() => setUserPaused((value) => !value)}
          aria-label={userPaused ? t.carousel.play : t.carousel.pause}
        >
          {userPaused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
        </button>
        <div className={styles.dots}>
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              className={styles.dot}
              aria-label={t.carousel.goTo(name(i))}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
            >
              <span className={styles.track}>
                {/* A new key restarts the fill whenever the slide or the play state changes. */}
                <span key={`${index}-${playing}`} className={styles.fill} data-playing={(playing && i === index) || undefined} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Four-point stars like the ones in the illustrations, twinkling around the frame. */
function Sparkles() {
  return (
    <div className={styles.sparkles} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} className={styles.sparkle} viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 1.5c.9 5.6 4.9 9.6 10.5 10.5-5.6.9-9.6 4.9-10.5 10.5C11.1 16.9 7.1 12.9 1.5 12 7.1 11.1 11.1 7.1 12 1.5z" />
        </svg>
      ))}
    </div>
  );
}
