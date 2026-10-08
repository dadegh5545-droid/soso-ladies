import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { CloseIcon, MenuIcon, WhatsappIcon } from '@/components/icons';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './Header.module.css';

export type NavItem = { href: string; label: string };

/**
 * Fixed header: transparent over the hero, solid (--bg-elevated with a
 * hairline) after 40 px of scroll. Phones get a full-screen menu; desktop
 * shows the links inline and a WhatsApp pill.
 */
export function Header({ view, nav }: { view: SiteView; nav: NavItem[] }) {
  const t = strings[view.lang];
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const bookHref = view.whatsapp ? whatsappLink(view.whatsapp, t.messages.booking) : null;

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Open menu: Escape closes it, the page behind does not scroll, focus moves in.
  useEffect(() => {
    if (!open) return;
    const menuButton = buttonRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      menuButton?.focus();
    };
  }, [open]);

  const homeHref = view.lang === 'en' ? '/en' : '/';

  return (
    <header className={styles.header} data-solid={solid || undefined}>
      <div className={styles.bar}>
        <Link href={homeHref} className={styles.brand} aria-label={view.salonName.text}>
          <Image src="/brand/soso-magenta.svg" alt="Soso" width={390} height={182} loading="eager" unoptimized className={styles.logo} />
          <span className={styles.salonType}>{t.salonType}</span>
        </Link>

        <nav className={styles.nav} aria-label={t.mainNav}>
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href={t.otherLang.href} hrefLang={t.otherLang.lang} lang={t.otherLang.lang} className={styles.lang} aria-label={t.otherLang.name}>
            {t.otherLang.label}
          </Link>
          {bookHref && (
            <a className={styles.book} href={bookHref} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon size={18} />
              <span>{t.bookOnWhatsapp}</span>
            </a>
          )}
          <button
            ref={buttonRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={t.menu}
            onClick={() => setOpen(true)}
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </div>

      <div id={menuId} className={styles.overlay} hidden={!open} role="dialog" aria-modal="true" aria-label={t.mainNav}>
        <div className={styles.overlayBar}>
          <Image src="/brand/soso-magenta.svg" alt="" width={390} height={182} unoptimized className={styles.logo} />
          <button type="button" className={styles.menuButton} aria-label={t.closeMenu} onClick={() => setOpen(false)}>
            <CloseIcon size={26} />
          </button>
        </div>
        <nav className={styles.overlayNav} aria-label={t.mainNav}>
          {nav.map((item, i) => (
            <a key={item.href} ref={i === 0 ? firstLinkRef : undefined} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        {bookHref && (
          <a className={styles.overlayBook} href={bookHref} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon size={20} />
            <span>{t.bookOnWhatsapp}</span>
          </a>
        )}
      </div>
    </header>
  );
}
