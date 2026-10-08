import { revealItem, useReveal } from '@/lib/site/reveal';
import { formatIndex } from '@/lib/site/services';
import { strings, type Lang } from '@/lib/site/strings';
import { Eyebrow } from './ui';
import styles from './HowTo.module.css';

type Step = { title: string; text: string };

/**
 * Steps on hairlines, each with a large magenta numeral. Defaults to "how to
 * book"; the home-service page passes its own steps.
 */
export function HowTo({
  lang,
  id = 'how-title',
  eyebrow,
  title,
  items,
}: {
  lang: Lang;
  id?: string;
  eyebrow?: string;
  title?: string;
  items?: readonly Step[];
}) {
  const t = strings[lang].how;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby={id}>
      <div className={styles.inner}>
        <div className={styles.heading} {...revealItem(0)}>
          <Eyebrow>{eyebrow ?? t.eyebrow}</Eyebrow>
          <h2 id={id} className={styles.title}>
            {title ?? t.title}
          </h2>
        </div>
        <ol className={styles.steps}>
          {(items ?? t.items).map((step, i) => (
            <li key={step.title} className={styles.step} {...revealItem(i + 1)}>
              <span className={styles.number} aria-hidden="true">
                {formatIndex(i + 1, lang)}
              </span>
              <div className={styles.text}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
