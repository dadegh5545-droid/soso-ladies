import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ChatIcon } from '@/components/icons';
import { strings } from '@/lib/site/strings';
import type { ServiceView, SiteView } from '@/lib/site/view';
import { serviceMessage, whatsappLink, type ServiceTab } from '@/lib/whatsapp';
import { SectionHeading } from './SectionHeading';
import styles from './Services.module.css';

const TABS: ServiceTab[] = ['all', 'salon', 'home'];

// "In the salon" shows SALON and BOTH; "Home service" shows HOME and BOTH.
const inTab = (service: ServiceView, tab: ServiceTab) =>
  tab === 'all' || (tab === 'salon' ? service.availability !== 'HOME' : service.availability !== 'SALON');

export function Services({ view }: { view: SiteView }) {
  const t = strings[view.lang];
  const [tab, setTab] = useState<ServiceTab>('all');
  const [category, setCategory] = useState<string>('all');

  const visible = useMemo(
    () => view.services.filter((s) => inTab(s, tab) && (category === 'all' || s.categoryId === category)),
    [view.services, tab, category],
  );

  return (
    <section id="services" className={styles.section} aria-labelledby="services-title">
      <SectionHeading id="services-title" title={t.servicesTitle}>
        <p className={styles.lead}>{t.servicesLead}</p>
      </SectionHeading>

      <div className={styles.filters}>
        <div className={styles.row} role="group" aria-label={t.tabsLabel}>
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              className={styles.tab}
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
            >
              {t.tabs[key]}
            </button>
          ))}
        </div>

        {view.categories.length > 1 && (
          <div className={styles.row} role="group" aria-label={t.categoriesLabel}>
            <button type="button" className={styles.chip} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
              {t.allCategories}
            </button>
            {view.categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.chip}
                aria-pressed={category === c.id}
                lang={c.name.lang}
                onClick={() => setCategory(c.id)}
              >
                {c.name.text}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className={styles.empty} role="status" hidden={visible.length > 0}>
        {visible.length === 0 ? t.emptyFilter : ''}
      </p>

      <ul className={styles.grid}>
        {visible.map((service) => (
          <ServiceCard key={service.id} service={service} view={view} tab={tab} />
        ))}
      </ul>
    </section>
  );
}

function ServiceCard({ service, view, tab }: { service: ServiceView; view: SiteView; tab: ServiceTab }) {
  const t = strings[view.lang];
  const { name, description } = service;
  return (
    <li className={styles.card}>
      <div className={styles.image}>
        {service.imageSrc && (
          <Image
            src={service.imageSrc}
            alt=""
            fill
            sizes="(min-width: 720px) 420px, 96px"
            className={styles.photo}
          />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.badges}>
          {service.availability !== 'HOME' && <span className={styles.badgeSalon}>{t.badgeSalon}</span>}
          {service.availability !== 'SALON' && <span className={styles.badgeHome}>{t.badgeHome}</span>}
        </div>
        <h3 className={styles.name} lang={name.lang} dir="auto">
          {name.text}
        </h3>
        {description && (
          <p className={styles.description} lang={description.lang} dir="auto">
            {description.text}
          </p>
        )}
        {(service.price || view.whatsapp) && (
          <div className={styles.footer}>
            {service.price && <span className={styles.price}>{t.priceFrom(service.price)}</span>}
            {view.whatsapp && (
              <a
                className={styles.ask}
                href={whatsappLink(view.whatsapp, serviceMessage(view.lang, name.text, service.availability, tab))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.askOnWhatsappFor(name.text)}
              >
                <ChatIcon size={18} />
                <span>{t.askOnWhatsapp}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
