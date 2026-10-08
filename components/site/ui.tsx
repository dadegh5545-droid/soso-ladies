import type { ReactNode } from 'react';
import { ArrowIcon } from '@/components/icons';
import styles from './ui.module.css';

/** A 28 px magenta line and a small label; opens every section. */
export function Eyebrow({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'gold' }) {
  return (
    <p className={styles.eyebrow} data-tone={tone}>
      <span className={styles.eyebrowLine} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Lines of a headline, each on its own line. */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={line} className={styles.line}>
          {line}
          {i < lines.length - 1 && ' '}
        </span>
      ))}
    </>
  );
}

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** 56 px magenta pill: label on the start side, arrow in a circle on the end side. */
export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={`${styles.primary} ${className ?? ''}`} href={href} {...external}>
      <span>{children}</span>
      <span className={styles.primaryCircle} aria-hidden="true">
        <ArrowIcon size={18} className={styles.arrow} />
      </span>
    </a>
  );
}

/** 48 px outlined pill with an arrow. */
export function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={styles.secondary} href={href} {...external}>
      <span>{children}</span>
      <ArrowIcon size={14} className={styles.arrow} />
    </a>
  );
}

/** Bold magenta text link with a small arrow ("Ask about packages"). */
export function TextLink({ href, children, label }: { href: string; children: ReactNode; label?: string }) {
  return (
    <a className={styles.textLink} href={href} aria-label={label} {...external}>
      <span>{children}</span>
      <ArrowIcon size={14} className={styles.arrow} />
    </a>
  );
}
