import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { CloseIcon, MenuIcon, WhatsappIcon } from '@/components/icons';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './Header.module.css';

export type NavItem = { href: string; label: string };

export function Header({ view, nav }: { view: SiteView; nav: NavItem[] }) {
  const t = strings[view.lang];
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const homeHref = view.lang === 'en' ? '/en' : '/';

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href={homeHref} className={styles.brand} aria-label={view.salonName.text}>
          <Image
            src="/brand/soso-magenta.svg"
            alt="Soso"
            width={390}
            height={182}
            priority
            unoptimized
            className={styles.logo}
          />
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
          {view.whatsapp && (
            <a className={styles.whatsapp} href={whatsappLink(view.whatsapp)} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon size={20} />
              <span>{t.whatsappCta}</span>
            </a>
          )}
          <button
            ref={buttonRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? t.closeMenu : t.menu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </div>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <nav aria-label={t.mainNav}>
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        {view.whatsapp && (
          <a className={styles.panelWhatsapp} href={whatsappLink(view.whatsapp)} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon size={20} />
            <span>{t.whatsappCta}</span>
          </a>
        )}
      </div>
    </header>
  );
}
