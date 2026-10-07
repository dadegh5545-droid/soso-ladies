import type { ReactNode } from 'react';
import styles from './SectionHeading.module.css';

export function SectionHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className={styles.heading}>
      <div className={styles.line} aria-hidden="true" />
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {children}
    </div>
  );
}
