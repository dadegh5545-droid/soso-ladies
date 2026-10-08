import Image from 'next/image';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { formatIndex, inPlace, type Place, type ServiceRow } from '@/lib/site/services';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import { SERVICE_PHOTOS } from './media';
import { Eyebrow, Lines, TextLink } from './ui';
import styles from './Services.module.css';

const PLACES: Place[] = ['all', 'salon', 'home'];

/**
 * The admin's services as an editorial list. The place filter lives in the
 * page (URL ?place=), shared with the hero's control; the filter row shows
 * only when some service is not offered in both places. No prices.
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
        <div className={styles.heading} {...revealItem(0)}>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="services-title" className={styles.title}>
            <Lines lines={t.titleLines} />
          </h2>
          <p className={styles.intro}>{t.intro}</p>
        </div>

        {showFilter && (
          <div className={styles.filter} role="group" aria-label={t.filterLabel} {...revealItem(1)}>
            {PLACES.map((key) => (
              <button key={key} type="button" aria-pressed={place === key} onClick={() => onPlace(key)}>
                {t.filter[key]}
              </button>
            ))}
          </div>
        )}

        <p className={styles.empty} role="status" hidden={visible.length > 0}>
          {visible.length === 0 ? t.empty : ''}
        </p>

        <ol className={styles.list} {...revealItem(2)}>
          {visible.map((row, i) => (
            <ServiceItem key={row.id} row={row} index={i + 1} lang={lang} whatsapp={whatsapp} />
          ))}
        </ol>
      </div>
    </section>
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
