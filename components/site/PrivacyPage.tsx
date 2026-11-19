import type { SiteProps } from '@/lib/server/site-props';
import { privacyPolicy } from '@/lib/site/legal';
import { LegalPage } from './LegalPage';

/** Privacy policy (Meta requires it for the salon's messaging app). */
export function PrivacyPage(props: SiteProps) {
  return <LegalPage props={props} page="privacy" doc={privacyPolicy[props.view.lang]} />;
}
