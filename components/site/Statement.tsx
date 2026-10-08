import { ChatIcon, HomeIcon, LockIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import styles from './Statement.module.css';

const FACT_ICONS = [LockIcon, HomeIcon, ChatIcon];

/** The salon in one sentence, then three facts separated by hairlines. */
export function Statement({ lang }: { lang: Lang }) {
  const t = strings[lang].statement;
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} data-reveal className={styles.section} aria-label={strings[lang].nav.about}>
      <div className={styles.inner}>
        <p className={styles.statement} {...revealItem(0)}>
          {t.line1}
          <br />
          <em className={styles.italic}>{t.line2}</em>
        </p>
        <p className={styles.body} {...revealItem(1)}>
          {t.body}
        </p>
        <ul className={styles.facts} {...revealItem(2)}>
          {t.facts.map((lines, i) => {
            const Icon = FACT_ICONS[i];
            return (
              <li key={lines.join(' ')}>
                <Icon size={20} strokeWidth={1.6} className={styles.icon} />
                <span>
                  {lines[0]}
                  <br />
                  {lines[1]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
