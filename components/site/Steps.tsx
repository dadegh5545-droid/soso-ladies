import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { SectionHeading } from './SectionHeading';
import styles from './Steps.module.css';

/** How to get a service: choose, message on WhatsApp, enjoy (no booking system). */
export function Steps({ lang }: { lang: Lang }) {
  const t = strings[lang].steps;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="steps-title">
      <div {...revealItem(0)}>
        <SectionHeading id="steps-title" title={t.title} />
      </div>
      <div className={styles.track}>
        <span className={styles.connector} aria-hidden="true" />
        <ol className={styles.list}>
          {t.items.map((step, i) => (
            <li key={step.title} className={styles.step} {...revealItem(i + 1)}>
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
