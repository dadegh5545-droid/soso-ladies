import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronIcon, CloseIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { SectionHeading } from './SectionHeading';
import styles from './Gallery.module.css';

export function Gallery({ view }: { view: SiteView }) {
  const t = strings[view.lang];
  const images = view.gallery;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sectionRef = useReveal<HTMLElement>();
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  // Arrow keys follow the reading direction: in Arabic, "left" is "next".
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const forward = (event.key === 'ArrowLeft') === (view.lang === 'ar');
      step(forward ? 1 : -1);
    };
    dialog.addEventListener('keydown', onKey);
    return () => dialog.removeEventListener('keydown', onKey);
  }, [step, view.lang]);

  const current = index === null ? null : images[index];

  return (
    <section id="gallery" ref={sectionRef} data-reveal className={styles.section} aria-labelledby="gallery-title">
      <div {...revealItem(0)}>
        <SectionHeading id="gallery-title" title={t.galleryTitle} />
      </div>
      <ul className={styles.grid}>
        {images.map((image, i) => (
          <li key={image.id} {...revealItem(Math.min(i, 5) + 1)}>
            <button type="button" className={styles.tile} onClick={() => open(i)} aria-label={t.openImage(image.alt.text)}>
              <Image
                src={image.src}
                alt={image.alt.text}
                lang={image.alt.lang}
                fill
                sizes="(min-width: 720px) 33vw, 50vw"
                className={styles.photo}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={() => setIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        aria-label={current?.alt.text ?? t.galleryTitle}
      >
        {current && (
          <div className={styles.viewer}>
            <div className={styles.full}>
              <Image src={current.src} alt={current.alt.text} lang={current.alt.lang} fill sizes="100vw" className={styles.fullPhoto} />
            </div>
            <div className={styles.controls}>
              {images.length > 1 && (
                <button type="button" className={styles.control} onClick={() => step(-1)} aria-label={t.previousImage}>
                  <ChevronIcon direction={view.lang === 'ar' ? 'right' : 'left'} size={24} />
                </button>
              )}
              <button type="button" className={styles.control} onClick={close} aria-label={t.closeImage} autoFocus>
                <CloseIcon size={24} />
              </button>
              {images.length > 1 && (
                <button type="button" className={styles.control} onClick={() => step(1)} aria-label={t.nextImage}>
                  <ChevronIcon direction={view.lang === 'ar' ? 'left' : 'right'} size={24} />
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
