import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings } from '@/lib/site/strings';
import type { LText, SiteView } from '@/lib/site/view';
import { SectionHeading } from './SectionHeading';
import styles from './About.module.css';

export function About({ view, about }: { view: SiteView; about: LText }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} data-reveal className={styles.section} aria-labelledby="about-title">
      <div {...revealItem(0)}>
        <SectionHeading id="about-title" title={strings[view.lang].aboutTitle} />
      </div>
      <div className={styles.card} {...revealItem(1)}>
        <span className={styles.quote} aria-hidden="true">
          ”
        </span>
        <p className={styles.text} lang={about.lang} dir="auto">
          {about.text}
        </p>
      </div>
    </section>
  );
}
