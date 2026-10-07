import Image from 'next/image';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import styles from './BrandStrip.module.css';

/**
 * The shop sign, redrawn as vector art (public/brand). Always the same: it
 * does not depend on any data, and it keeps its right-to-left order on the
 * English page too. The pieces rise in on scroll and the face floats gently.
 */
export function BrandStrip({ lang }: { lang: Lang }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.strip} aria-label={strings[lang].brandStrip} dir="rtl">
      <div className={styles.frame} aria-hidden="true" />
      <div className={styles.block} {...revealItem(1)}>
        <Image src="/brand/sousou-yellow.svg" alt="سوسو" lang="ar" width={435} height={120} unoptimized className={styles.sousou} />
        <Image src="/brand/pill-arabic.svg" alt="صالون نسائي" lang="ar" width={370} height={82} unoptimized className={styles.pill} />
      </div>
      <div className={styles.faceWrap} {...revealItem(0)}>
        <Image src="/brand/face-white.svg" alt="" width={205} height={313} unoptimized className={styles.face} />
      </div>
      <div className={styles.block} {...revealItem(2)}>
        <Image src="/brand/soso-yellow.svg" alt="Soso" lang="en" width={390} height={182} unoptimized className={styles.soso} />
        <Image src="/brand/pill-latin.svg" alt="Ladies Salon" lang="en" width={366} height={78} unoptimized className={styles.pill} />
      </div>
    </section>
  );
}
