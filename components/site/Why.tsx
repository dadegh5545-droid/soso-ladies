import { ChatIcon, HomeIcon, LockIcon, SparkleIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { Eyebrow, Lines } from './ui';
import styles from './Why.module.css';

const ICONS = [LockIcon, SparkleIcon, HomeIcon, ChatIcon];

/** "Why Soso": four points on hairlines, two columns (four on desktop). */
export function Why({ lang }: { lang: Lang }) {
  const t = strings[lang].why;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="why-title">
      <div className={styles.inner}>
        <div className={styles.heading} {...revealItem(0)}>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="why-title" className={styles.title}>
            <Lines lines={t.titleLines} />
          </h2>
        </div>
        <ul className={styles.grid}>
          {t.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <li key={item.title} className={styles.item} {...revealItem(i + 1)}>
                <Icon size={22} strokeWidth={1.6} className={styles.icon} />
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.text}>{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
