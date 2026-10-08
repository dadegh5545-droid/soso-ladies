import type { ComponentType } from 'react';
import { ChatIcon, HomeIcon, LockIcon, SparkleIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import styles from './Statement.module.css';

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

/** The salon in one sentence, then three facts separated by hairlines. */
export function Statement({ lang }: { lang: Lang }) {
  const t = strings[lang].statement;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-label={strings[lang].nav.about}>
      <div className={styles.inner}>
        <p className={styles.statement} {...revealItem(0)}>
          {t.line1}
          <br />
          <em className={styles.italic}>{t.line2}</em>
        </p>
        <p className={styles.body} {...revealItem(1)}>
          {t.body}
        </p>
        <div {...revealItem(2)}>
          <Facts items={t.facts} icons={[LockIcon, HomeIcon, ChatIcon]} />
        </div>
      </div>
    </section>
  );
}

/** Three short facts, each with an icon, separated by hairlines. */
export function Facts({
  items,
  icons = [LockIcon, SparkleIcon, HomeIcon],
  label,
}: {
  items: readonly (readonly string[])[];
  icons?: IconType[];
  label?: string;
}) {
  return (
    <ul className={styles.facts} aria-label={label}>
      {items.map((lines, i) => {
        const Icon = icons[i % icons.length];
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
  );
}
