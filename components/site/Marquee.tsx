import { Fragment } from 'react';
import { StarIcon } from '@/components/icons';
import { strings, type Lang } from '@/lib/site/strings';
import type { LText } from '@/lib/site/view';
import styles from './Marquee.module.css';

/**
 * A strip of every active service name. Phones: one static line, overflow
 * hidden. Desktop: the line scrolls slowly, pausing on hover and never moving
 * for reduced motion. For a seamless loop the track holds 2 × k copies of the
 * list (k copies wide enough for any screen) and moves by half its width;
 * only the first copy is exposed to screen readers.
 */
export function Marquee({ names, lang }: { names: LText[]; lang: Lang }) {
  const k = Math.max(1, Math.ceil(12 / names.length));
  return (
    <div className={styles.marquee} role="region" aria-label={strings[lang].marqueeLabel}>
      <div className={styles.track}>
        {Array.from({ length: 2 * k }, (_, copy) => (
          <div key={copy} className={styles.list} aria-hidden={copy > 0 || undefined}>
            {names.map((name, i) => (
              <Fragment key={`${name.text}-${i}`}>
                <span lang={name.lang}>{name.text}</span>
                <StarIcon className={styles.star} />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
