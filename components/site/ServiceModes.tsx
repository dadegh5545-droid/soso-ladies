import { CheckIcon, HomeIcon, SalonIcon, WhatsappIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import { SectionHeading } from './SectionHeading';
import styles from './ServiceModes.module.css';

export type ServiceMode = 'salon' | 'home';

/**
 * The two ways to be served: at the salon or at home. Always shown (fixed
 * text), so the page states both even before any service is added. With
 * services, each card filters the list below; with a WhatsApp number, each
 * card can ask about that kind of service directly.
 */
export function ServiceModes({ view, onBrowse }: { view: SiteView; onBrowse: (mode: ServiceMode) => void }) {
  const t = strings[view.lang];
  const ref = useReveal<HTMLElement>();
  const counts: Record<ServiceMode, number> = {
    salon: view.services.filter((s) => s.availability !== 'HOME').length,
    home: view.services.filter((s) => s.availability !== 'SALON').length,
  };
  const modes = [
    { key: 'salon', Icon: SalonIcon, copy: t.modes.salon },
    { key: 'home', Icon: HomeIcon, copy: t.modes.home },
  ] as const;

  return (
    <section id="experience" ref={ref} data-reveal className={styles.section} aria-labelledby="experience-title">
      <div {...revealItem(0)}>
        <SectionHeading id="experience-title" title={t.modes.title} eyebrow={t.modes.eyebrow}>
          <p className={styles.lead}>{t.modes.lead}</p>
        </SectionHeading>
      </div>

      <div className={styles.cards}>
        {modes.map(({ key, Icon, copy }, i) => (
          // The wrapper reveals; the card keeps its own hover motion.
          <div key={key} className={styles.cardWrap} {...revealItem(i + 1)}>
            <article className={styles.card} data-mode={key} aria-labelledby={`mode-${key}`}>
              <Icon className={styles.watermark} size={220} strokeWidth={0.8} />
              <div className={styles.top}>
                <span className={styles.icon}>
                  <Icon size={30} />
                </span>
                {counts[key] > 0 && <span className={styles.count}>{t.modes.count(counts[key])}</span>}
              </div>
              <h3 id={`mode-${key}`} className={styles.title}>
                {copy.title}
              </h3>
              <p className={styles.text}>{copy.text}</p>
              <ul className={styles.points}>
                {copy.points.map((point) => (
                  <li key={point}>
                    <CheckIcon size={18} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {(counts[key] > 0 || view.whatsapp) && (
                <div className={styles.actions}>
                  {counts[key] > 0 && (
                    <a className={styles.browse} href="#services" onClick={() => onBrowse(key)}>
                      {copy.browse}
                    </a>
                  )}
                  {view.whatsapp && (
                    <a
                      className={styles.ask}
                      href={whatsappLink(view.whatsapp, copy.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsappIcon size={18} />
                      <span>{t.modes.ask}</span>
                    </a>
                  )}
                </div>
              )}
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
