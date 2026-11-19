import type { GetServerSideProps } from 'next';
import { PrivacyPage } from '@/components/site/PrivacyPage';
import { getSiteProps, type SiteProps } from '@/lib/server/site-props';

// Fixed text: answers 200 even when the site data cannot be read (Meta checks this URL).
export const getServerSideProps: GetServerSideProps<SiteProps> = (context) =>
  getSiteProps(context, 'ar', { fixedContent: true });

export default PrivacyPage;
