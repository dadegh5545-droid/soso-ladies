import type { GetServerSideProps } from 'next';
import { HomePage } from '@/components/site/HomePage';
import { getSiteProps, type SiteProps } from '@/lib/server/site-props';

export const getServerSideProps: GetServerSideProps<SiteProps> = (context) => getSiteProps(context, 'ar');

export default HomePage;
