import type { GetServerSideProps } from 'next';
import { ServicesPage } from '@/components/site/ServicesPage';
import { getSiteProps, type SiteProps } from '@/lib/server/site-props';

export const getServerSideProps: GetServerSideProps<SiteProps> = (context) => getSiteProps(context, 'ar');

export default ServicesPage;
