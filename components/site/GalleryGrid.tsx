import Image, { type StaticImageData } from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronIcon, CloseIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import type { LText } from '@/lib/site/view';
import styles from './GalleryGrid.module.css';

export type GalleryItem = {
  id: string;
  src: StaticImageData | string;
  alt: LText;
  /** Object position for the tile crop. */
  position?: string;
};

/**
 * Photo grid with a full-screen viewer (native <dialog>: Escape closes it,
 * focus returns to the tile). Arrow keys follow the reading direction.
 */
export function GalleryGrid({ items, lang }: { items: GalleryItem[]; lang: Lang }) {
  const t = strings[lang].gallery;
  const ref = useReveal<HTMLElement>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const forward = (event.key === 'ArrowLeft') === (lang === 'ar');
      step(forward ? 1 : -1);
    };
    dialog.addEventListener('keydown', onKey);
    return () => dialog.removeEventListener('keydown', onKey);
  }, [step, lang]);

  const current = index === null ? null : items[index];

  return (
    <section ref={ref} data-reveal className={styles.section} aria-label={strings[lang].nav.gallery}>
      <ul className={styles.grid}>
        {items.map((item, i) => (
          <li key={item.id} className={styles.cell} data-shape={i % 5 === 0 ? 'tall' : undefined} {...revealItem(Math.min(i, 6))}>
            <button type="button" className={styles.tile} onClick={() => open(i)} aria-label={t.open(item.alt.text)}>
              <Image
                src={item.src}
                alt={item.alt.text}
                lang={item.alt.lang}
                fill
                placeholder={typeof item.src === 'string' ? 'empty' : 'blur'}
                sizes="(min-width: 1024px) 400px, 50vw"
                className={styles.photo}
                style={item.position ? { objectPosition: item.position } : undefined}
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
        aria-label={current?.alt.text ?? strings[lang].nav.gallery}
      >
        {current && (
          <div className={styles.viewer}>
            <div className={styles.full}>
              <Image src={current.src} alt={current.alt.text} lang={current.alt.lang} fill sizes="100vw" className={styles.fullPhoto} />
            </div>
            <div className={styles.controls}>
              {items.length > 1 && (
                <button type="button" className={styles.control} onClick={() => step(-1)} aria-label={t.previous}>
                  <ChevronIcon direction={lang === 'ar' ? 'right' : 'left'} size={24} />
                </button>
              )}
              <button type="button" className={styles.control} onClick={close} aria-label={t.close} autoFocus>
                <CloseIcon size={24} />
              </button>
              {items.length > 1 && (
                <button type="button" className={styles.control} onClick={() => step(1)} aria-label={t.next}>
                  <ChevronIcon direction={lang === 'ar' ? 'left' : 'right'} size={24} />
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
