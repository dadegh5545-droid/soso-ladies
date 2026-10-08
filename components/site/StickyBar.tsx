import { useEffect, useState } from 'react';
import { WhatsappIcon } from '@/components/icons';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './StickyBar.module.css';

/**
 * Phone booking bar fixed to the bottom. Hidden while the hero (#top) or the
 * final call to action (#book) is on screen, so it never covers that button;
 * hidden from 1024 px, where the header has the WhatsApp pill.
 */
export function StickyBar({ lang, whatsapp }: { lang: Lang; whatsapp: string }) {
  const t = strings[lang];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const watched = ['top', 'book'].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!('IntersectionObserver' in window) || watched.length === 0) return;
    const inView = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) inView.set(entry.target, entry.isIntersecting);
      setVisible(!Array.from(inView.values()).some(Boolean));
    });
    watched.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.bar} data-visible={visible || undefined} aria-hidden={!visible}>
      <div className={styles.label}>
        <span className={styles.title}>{t.sticky.title}</span>
        <span className={styles.sub}>{t.sticky.sub}</span>
      </div>
      <a
        className={styles.button}
        href={whatsappLink(whatsapp, t.messages.booking)}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={visible ? undefined : -1}
      >
        <WhatsappIcon size={18} strokeWidth={2} />
        <span>{t.sticky.button}</span>
      </a>
    </div>
  );
}
