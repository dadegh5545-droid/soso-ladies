import Image from 'next/image';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowIcon, PauseIcon, PlayIcon } from '@/components/icons';
import { pathFor } from '@/lib/site/routes';
import { formatIndex } from '@/lib/site/services';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import { PHOTOS } from './media';
import { Eyebrow, Lines, PrimaryButton } from './ui';
import styles from './HeroCarousel.module.css';

const SLIDES = (['makeup', 'facial', 'hair', 'henna'] as const).map((key) => ({ key, photo: PHOTOS[key] }));

/** How long each photo stays before the next one fades in. */
export const SLIDE_MS = 4500;

/**
 * Home hero: a full-bleed photo carousel (the four scenes of the salon's
 * video) under the headline and calls to action.
 * - Speed: only the first photo is in the first HTML (preloaded, the LCP);
 *   the others mount after the page's load event.
 * - Motion: cross-fade with a slow settle from a zoom; numbered progress
 *   bars; arrows, swipe and arrow keys. It does not advance for reduced
 *   motion, while hovered or keyboard-focused, in a hidden tab, off screen,
 *   or after the pause button.
 */
export function HeroCarousel({ view, showPlaces }: { view: SiteView; showPlaces: boolean }) {
  const t = strings[view.lang];
  const rootRef = useRef<HTMLElement>(null);
  const swipeStart = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [loadedAll, setLoadedAll] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const n = SLIDES.length;
  const playing = loadedAll && !userPaused && !holding && !offscreen && !reducedMotion;
  const servicesHref = pathFor('services', view.lang);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + n) % n), [n]);

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
    const timer = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, go]);

  // Swipe toward the reading direction's "next" (left in English, right in Arabic).
  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: ReactPointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) < 50) return;
    const forward = view.lang === 'ar' ? dx > 0 : dx < 0;
    go(forward ? 1 : -1);
  };
  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const forward = (event.key === 'ArrowLeft') === (view.lang === 'ar');
    go(forward ? 1 : -1);
  };

  const name = (i: number) => t.carousel.slides[SLIDES[i].key];

  return (
    <section
      id="top"
      ref={rootRef}
      className={styles.hero}
      aria-labelledby="hero-title"
      style={{ '--slide-ms': `${SLIDE_MS}ms` } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className={styles.slides} aria-roledescription="carousel" aria-label={t.carousel.label}>
        {SLIDES.map((slide, i) =>
          i === 0 || loadedAll ? (
            <div
              key={slide.key}
              className={styles.slide}
              data-active={i === index || undefined}
              data-variant={i % 2}
              role="group"
              aria-roledescription="slide"
              aria-label={t.carousel.slide(i + 1, n, name(i))}
              aria-hidden={i !== index}
            >
              <Image
                src={slide.photo.image}
                alt={name(i)}
                fill
                priority={i === 0}
                placeholder="blur"
                sizes="100vw"
                quality={80}
                className={styles.image}
                style={{ objectPosition: slide.photo.position }}
              />
            </div>
          ) : null,
        )}
      </div>
      <div className={styles.fade} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.copy}>
          <Eyebrow>{t.hero.eyebrow}</Eyebrow>
          <h1 id="hero-title" className={styles.title}>
            <Lines lines={t.hero.titleLines} />
          </h1>
          <p className={styles.body}>{t.hero.body}</p>
          <div className={styles.actions}>
            {view.whatsapp && (
              <PrimaryButton href={whatsappLink(view.whatsapp, t.messages.booking)} className={styles.cta}>
                {t.hero.cta}
              </PrimaryButton>
            )}
            <Link href={servicesHref} className={styles.secondary}>
              <span>{t.browseServices}</span>
              <ArrowIcon size={14} className={styles.arrow} />
            </Link>
          </div>
          {showPlaces && (
            <nav className={styles.segment} aria-label={t.hero.segmentLabel}>
              <Link href={`${servicesHref}?place=salon`}>{t.hero.segment.salon}</Link>
              <Link href={`${servicesHref}?place=home`}>{t.hero.segment.home}</Link>
            </nav>
          )}
        </div>

        <div
          className={styles.controls}
          onPointerEnter={(event) => event.pointerType === 'mouse' && setHolding(true)}
          onPointerLeave={() => setHolding(false)}
          onFocus={(event) => (event.target as HTMLElement).matches(':focus-visible') && setHolding(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHolding(false);
          }}
          onKeyDown={onKeyDown}
        >
          <ol className={styles.dots}>
            {SLIDES.map((slide, i) => (
              <li key={slide.key}>
                <button
                  type="button"
                  className={styles.dot}
                  aria-label={t.carousel.goTo(name(i))}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => setIndex(i)}
                >
                  <span className={styles.dotLabel} aria-hidden="true">
                    <span className={styles.dotNumber}>{formatIndex(i + 1, view.lang)}</span>
                    {name(i)}
                  </span>
                  <span className={styles.track} aria-hidden="true">
                    {/* A new key restarts the fill whenever the slide or the play state changes. */}
                    <span key={`${index}-${playing}`} className={styles.fill} data-playing={(playing && i === index) || undefined} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className={styles.buttons}>
            <button type="button" className={styles.round} onClick={() => go(-1)} aria-label={t.carousel.previous}>
              <ArrowIcon size={18} className={styles.prevArrow} />
            </button>
            <button
              type="button"
              className={styles.round}
              onClick={() => setUserPaused((value) => !value)}
              aria-label={userPaused ? t.carousel.play : t.carousel.pause}
            >
              {userPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
            </button>
            <button type="button" className={styles.round} onClick={() => go(1)} aria-label={t.carousel.next}>
              <ArrowIcon size={18} className={styles.arrow} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
