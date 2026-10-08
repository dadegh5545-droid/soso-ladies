import type { GetServerSideProps } from 'next';
import { HomeServicePage } from '@/components/site/HomeServicePage';
import { getSiteProps, type SiteProps } from '@/lib/server/site-props';

export const getServerSideProps: GetServerSideProps<SiteProps> = (context) => getSiteProps(context, 'ar');

export default HomeServicePage;
