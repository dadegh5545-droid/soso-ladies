import { strings } from '@/lib/site/strings';
import type { LText, SiteView } from '@/lib/site/view';
import { SectionHeading } from './SectionHeading';
import styles from './About.module.css';

export function About({ view, about }: { view: SiteView; about: LText }) {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <SectionHeading id="about-title" title={strings[view.lang].aboutTitle} />
      <p className={styles.text} lang={about.lang} dir="auto">
        {about.text}
      </p>
    </section>
  );
}
