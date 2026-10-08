import { revealItem, useReveal } from '@/lib/site/reveal';
import { formatIndex } from '@/lib/site/services';
import { strings, type Lang } from '@/lib/site/strings';
import { Eyebrow } from './ui';
import styles from './HowTo.module.css';

/** Three steps on hairlines, each with a large magenta numeral. */
export function HowTo({ lang }: { lang: Lang }) {
  const t = strings[lang].how;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="how-title">
      <div className={styles.inner}>
        <div className={styles.heading} {...revealItem(0)}>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="how-title" className={styles.title}>
            {t.title}
          </h2>
        </div>
        <ol className={styles.steps}>
          {t.items.map((step, i) => (
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
