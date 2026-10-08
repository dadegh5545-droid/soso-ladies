import type { GetServerSideProps } from 'next';
import { ContactPage } from '@/components/site/ContactPage';
import { getSiteProps, type SiteProps } from '@/lib/server/site-props';

export const getServerSideProps: GetServerSideProps<SiteProps> = (context) => getSiteProps(context, 'en');

export default ContactPage;
