import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { pathFor } from '@/lib/site/routes';
import { formatIndex, inPlace, type Place, type ServiceRow } from '@/lib/site/services';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import { SERVICE_PHOTOS } from './media';
import { Eyebrow, Lines, TextLink } from './ui';
import styles from './Services.module.css';

const PLACES: Place[] = ['all', 'salon', 'home'];

/** Section frame shared by the services sections: eyebrow, title, intro. */
function Heading({ id, eyebrow, titleLines, intro }: { id: string; eyebrow: string; titleLines: readonly string[]; intro?: string }) {
  return (
    <div className={styles.heading}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className={styles.title}>
        <Lines lines={titleLines} />
      </h2>
      {intro && <p className={styles.intro}>{intro}</p>}
    </div>
  );
}

/**
 * The full services list (services page). The place filter lives in the
 * page (URL ?place=); the filter row shows only when some service is not
 * offered in both places. No prices.
 */
export function Services({
  rows,
  lang,
  whatsapp,
  place,
  onPlace,
  showFilter,
}: {
  rows: ServiceRow[];
  lang: Lang;
  whatsapp: string | null;
  place: Place;
  onPlace: (place: Place) => void;
  showFilter: boolean;
}) {
  const t = strings[lang].services;
  const ref = useReveal<HTMLElement>();
  const visible = rows.filter((row) => inPlace(row.availability, place));

  return (
    <section id="services" ref={ref} data-reveal className={styles.section} aria-labelledby="services-title">
      <div className={styles.inner}>
        {showFilter && (
          <div className={styles.filter} role="group" aria-label={t.filterLabel} {...revealItem(0)}>
            {PLACES.map((key) => (
              <button key={key} type="button" aria-pressed={place === key} onClick={() => onPlace(key)}>
                {t.filter[key]}
              </button>
            ))}
          </div>
        )}
        <h2 id="services-title" className="visually-hidden">
          {strings[lang].nav.services}
        </h2>
        <p className={styles.empty} role="status" hidden={visible.length > 0}>
          {visible.length === 0 ? t.empty : ''}
        </p>
        <div {...revealItem(1)}>
          <ServiceList rows={visible} lang={lang} whatsapp={whatsapp} />
        </div>
      </div>
    </section>
  );
}

/** A titled list of services, e.g. the home services on the home-service page. */
export function ServicesSection({
  id,
  eyebrow,
  titleLines,
  intro,
  rows,
  lang,
  whatsapp,
  footer,
}: {
  id: string;
  eyebrow: string;
  titleLines: readonly string[];
  intro?: string;
  rows: ServiceRow[];
  lang: Lang;
  whatsapp: string | null;
  footer?: ReactNode;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby={id}>
      <div className={styles.inner}>
        <div {...revealItem(0)}>
          <Heading id={id} eyebrow={eyebrow} titleLines={titleLines} intro={intro} />
        </div>
        <div {...revealItem(1)}>
          <ServiceList rows={rows} lang={lang} whatsapp={whatsapp} />
        </div>
        {footer && (
          <div className={styles.footer} {...revealItem(2)}>
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}

/** Home page: the first services and a link to the services page. */
export function ServicesPreview({ rows, lang, whatsapp }: { rows: ServiceRow[]; lang: Lang; whatsapp: string | null }) {
  const t = strings[lang];
  return (
    <ServicesSection
      id="services-preview-title"
      eyebrow={t.servicesPreview.eyebrow}
      titleLines={t.servicesPreview.titleLines}
      intro={t.services.intro}
      rows={rows.slice(0, 4)}
      lang={lang}
      whatsapp={whatsapp}
      footer={
        <Link href={pathFor('services', lang)} className={styles.allLink}>
          <span>{t.allServices}</span>
          <ArrowIcon size={16} className={styles.arrow} />
        </Link>
      }
    />
  );
}

export function ServiceList({ rows, lang, whatsapp }: { rows: ServiceRow[]; lang: Lang; whatsapp: string | null }) {
  return (
    <ol className={styles.list}>
      {rows.map((row, i) => (
        <ServiceItem key={row.id} row={row} index={i + 1} lang={lang} whatsapp={whatsapp} />
      ))}
    </ol>
  );
}

function ServiceItem({ row, index, lang, whatsapp }: { row: ServiceRow; index: number; lang: Lang; whatsapp: string | null }) {
  const t = strings[lang];
  const photo = row.media ? SERVICE_PHOTOS[row.media] : null;

  return (
    <li className={styles.row}>
      <div className={styles.thumb}>
        {row.imageSrc ? (
          <Image src={row.imageSrc} alt={row.name.text} fill sizes="(min-width: 1024px) 200px, 132px" className={styles.photo} />
        ) : photo ? (
          <Image
            src={photo.image}
            alt={row.name.text}
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 200px, 132px"
            className={styles.photo}
            style={{ objectPosition: photo.position }}
          />
        ) : (
          <span className={styles.placeholder}>{t.services.photoSoon}</span>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.number} aria-hidden="true">
            {formatIndex(index, lang)}
          </span>
          <span className={styles.tag}>{t.services.tag[row.availability]}</span>
        </div>
        <h3 className={styles.name} lang={row.name.lang}>
          {row.name.text}
        </h3>
        {row.tagline && (
          <p className={styles.tagline} lang={row.tagline.lang} dir="auto">
            {row.tagline.text}
          </p>
        )}
        {row.packages && (
          <p className={styles.packages} lang={row.packages.lang}>
            {row.packages.text}
          </p>
        )}
        {whatsapp && (
          <div className={styles.cta}>
            <TextLink href={whatsappLink(whatsapp, t.messages.service(row.name.text))} label={t.services.ctaFor(row.name.text)}>
              {t.services.cta}
            </TextLink>
          </div>
        )}
      </div>
    </li>
  );
}
