import type { ReactNode } from 'react';
import styles from './SectionHeading.module.css';

/** Section title with the magenta accent line, which draws in when revealed. */
export function SectionHeading({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.heading}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <div className={styles.line} aria-hidden="true" />
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {children}
    </div>
  );
}
