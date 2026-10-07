import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatIcon } from '@/components/icons';
import { PriceText } from '@/components/PriceText';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings } from '@/lib/site/strings';
import type { ServiceView, SiteView } from '@/lib/site/view';
import { serviceMessage, whatsappLink, type ServiceTab } from '@/lib/whatsapp';
import { SectionHeading } from './SectionHeading';
import styles from './Services.module.css';

const TABS: ServiceTab[] = ['all', 'salon', 'home'];

// "In the salon" shows SALON and BOTH; "Home service" shows HOME and BOTH.
const inTab = (service: ServiceView, tab: ServiceTab) =>
  tab === 'all' || (tab === 'salon' ? service.availability !== 'HOME' : service.availability !== 'SALON');

/** The tab is owned by the page, so the salon/home cards above can set it. */
export function Services({
  view,
  tab,
  onTabChange,
}: {
  view: SiteView;
  tab: ServiceTab;
  onTabChange: (tab: ServiceTab) => void;
}) {
  const t = strings[view.lang];
  const ref = useReveal<HTMLElement>();
  const [category, setCategory] = useState<string>('all');
  // After the first filter change, cards that appear animate in.
  const [filtered, setFiltered] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setFiltered(true);
  }, [tab, category]);

  const visible = useMemo(
    () => view.services.filter((s) => inTab(s, tab) && (category === 'all' || s.categoryId === category)),
    [view.services, tab, category],
  );

  return (
    <section id="services" ref={ref} data-reveal className={styles.section} aria-labelledby="services-title">
      <div {...revealItem(0)}>
        <SectionHeading id="services-title" title={t.servicesTitle}>
          <p className={styles.lead}>{t.servicesLead}</p>
        </SectionHeading>
      </div>

      <div className={styles.filters} {...revealItem(1)}>
        <div className={styles.row} role="group" aria-label={t.tabsLabel}>
          {TABS.map((key) => (
            <button key={key} type="button" className={styles.tab} aria-pressed={tab === key} onClick={() => onTabChange(key)}>
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

      <ul className={styles.grid} data-filtered={filtered || undefined}>
        {visible.map((service, i) => (
          <ServiceCard key={service.id} service={service} view={view} tab={tab} index={i} />
        ))}
      </ul>
    </section>
  );
}

function ServiceCard({ service, view, tab, index }: { service: ServiceView; view: SiteView; tab: ServiceTab; index: number }) {
  const t = strings[view.lang];
  const { name, description } = service;
  return (
    // The list item reveals on scroll; the card inside keeps its hover motion.
    <li className={styles.cardWrap} {...revealItem(Math.min(index, 5) + 2)}>
      <article className={styles.card}>
        <div className={styles.image}>
          {service.imageSrc && (
            <Image src={service.imageSrc} alt="" fill sizes="(min-width: 720px) 420px, 96px" className={styles.photo} />
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
              {service.price && (
                <span className={styles.price}>
                  <PriceText lang={view.lang} amount={service.price} />
                </span>
              )}
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
      </article>
    </li>
  );
}
