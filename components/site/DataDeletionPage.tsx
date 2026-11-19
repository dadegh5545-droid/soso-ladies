import type { SiteProps } from '@/lib/server/site-props';
import { dataDeletion } from '@/lib/site/legal';
import { LegalPage } from './LegalPage';

/** How to ask for your data to be deleted (Meta's data deletion instructions URL). */
export function DataDeletionPage(props: SiteProps) {
  return <LegalPage props={props} page="dataDeletion" doc={dataDeletion[props.view.lang]} />;
}
