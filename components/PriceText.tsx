import type { Lang } from '@/lib/site/strings';

/**
 * "من 1,500 ر.ق" / "From QAR 1,500". In Arabic the number is isolated as
 * left-to-right so its digits and separators never reorder.
 */
export function PriceText({ lang, amount }: { lang: Lang; amount: string }) {
  if (lang === 'en') return <>From QAR {amount}</>;
  return (
    <>
      من <bdi dir="ltr">{amount}</bdi> ر.ق
    </>
  );
}
