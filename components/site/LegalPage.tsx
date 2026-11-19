import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { MailIcon, WhatsappIcon } from '@/components/icons';
import type { SiteProps } from '@/lib/server/site-props';
import { LEGAL_CONTACT, legalMailto, splitLinks, type LegalDoc, type LegalLink } from '@/lib/site/legal';
import { pathFor } from '@/lib/site/routes';
import { formatIndex } from '@/lib/site/services';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import { PageHero } from './PageHero';
import { SiteLayout } from './SiteLayout';
import { Eyebrow } from './ui';
import styles from './LegalPage.module.css';

type LegalPageKey = 'privacy' | 'dataDeletion';

/** A {placeholder} of the legal text as a link; phone and email always read left to right. */
function InlineLink({ link, lang }: { link: LegalLink; lang: Lang }) {
  switch (link) {
    case 'whatsapp':
      return (
        <a
          href={whatsappLink(LEGAL_CONTACT.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className={styles.phone}
        >
          {LEGAL_CONTACT.whatsappDisplay}
        </a>
      );
    case 'email':
      return (
        <a href={legalMailto()} dir="ltr">
          {LEGAL_CONTACT.email}
        </a>
      );
    default:
      return <Link href={pathFor(link, lang)}>{strings[lang].nav[link]}</Link>;
  }
}

function Text({ text, lang }: { text: string; lang: Lang }) {
  return (
    <>
      {splitLinks(text).map((part, i) =>
        typeof part === 'string' ? <Fragment key={i}>{part}</Fragment> : <InlineLink key={i} link={part.link} lang={lang} />,
      )}
    </>
  );
}

/**
 * The privacy policy and data-deletion pages: the brand-magenta banner, then
 * short numbered sections in one readable column, and the WhatsApp and email
 * cards. The text is fixed (lib/site/legal.ts), so the page is complete even
 * without the admin settings.
 */
export function LegalPage({ props, page, doc }: { props: SiteProps; page: LegalPageKey; doc: LegalDoc }) {
  const { view } = props;
  const lang = view.lang;
  const t = strings[lang];
  const hero = t.pages[page];
  const { contact } = doc;
  const cards: { key: string; icon: ReactNode; label: string; value: string; href: string; primary?: boolean }[] = [
    {
      key: 'whatsapp',
      icon: <WhatsappIcon size={24} />,
      label: contact.whatsappLabel,
      value: LEGAL_CONTACT.whatsappDisplay,
      href: whatsappLink(LEGAL_CONTACT.whatsapp, contact.request?.message),
      primary: true,
    },
    {
      key: 'email',
      icon: <MailIcon size={24} />,
      label: contact.emailLabel,
      value: LEGAL_CONTACT.email,
      href: legalMailto(contact.request),
    },
  ];

  return (
    <SiteLayout {...props} page={page} title={t.nav[page]} description={hero.lead} brandHero>
      <PageHero lang={lang} page={page} eyebrow={hero.eyebrow} titleLines={hero.titleLines} lead={hero.lead} />
      <div className={styles.wrap}>
        <article className={styles.article} aria-labelledby="page-title">
          {doc.effective && (
            <p className={styles.effective}>
              {doc.effective.label}: <time dateTime={doc.effective.iso}>{doc.effective.date}</time>
            </p>
          )}

          {doc.sections.map((section, i) => (
            <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
              <span className={styles.number} aria-hidden="true">
                {formatIndex(i + 1, lang)}
              </span>
              <div className={styles.body}>
                <h2 id={`${section.id}-title`} className={styles.title}>
                  {section.title}
                </h2>
                {section.body.map((block, j) => {
                  if ('p' in block)
                    return (
                      <p key={j}>
                        <Text text={block.p} lang={lang} />
                      </p>
                    );
                  const items = 'ul' in block ? block.ul : block.ol;
                  const List = 'ul' in block ? 'ul' : 'ol';
                  return (
                    <List key={j} className={styles.list}>
                      {items.map((item) => (
                        <li key={item}>
                          <Text text={item} lang={lang} />
                        </li>
                      ))}
                    </List>
                  );
                })}
              </div>
            </section>
          ))}

          <section className={styles.contact} aria-labelledby="legal-contact-title">
            <Eyebrow>{t.nav[page]}</Eyebrow>
            <h2 id="legal-contact-title" className={styles.contactTitle}>
              {contact.title}
            </h2>
            <ul className={styles.cards}>
              {cards.map((card) => (
                <li key={card.key}>
                  <a
                    className={styles.card}
                    data-primary={card.primary || undefined}
                    href={card.href}
                    target={card.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                  >
                    <span className={styles.icon}>{card.icon}</span>
                    <span className={styles.label}>{card.label}</span>
                    <span className={styles.value}>
                      <span dir="ltr">{card.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </SiteLayout>
  );
}
