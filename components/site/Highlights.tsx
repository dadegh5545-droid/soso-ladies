import { ChatIcon, HomeIcon, LockIcon, SparkleIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { SectionHeading } from './SectionHeading';
import styles from './Highlights.module.css';

const ICONS = [LockIcon, SparkleIcon, HomeIcon, ChatIcon];

/** "Why Soso": four fixed points taken from the salon's own description. */
export function Highlights({ lang }: { lang: Lang }) {
  const t = strings[lang].highlights;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="highlights-title">
      <div {...revealItem(0)}>
        <SectionHeading id="highlights-title" title={t.title} />
      </div>
      <ul className={styles.grid}>
        {t.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={item.title} className={styles.itemWrap} {...revealItem(i + 1)}>
              <div className={styles.item}>
                <span className={styles.icon}>
                  <Icon size={26} />
                </span>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.text}>{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
