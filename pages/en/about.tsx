import type { GetServerSideProps } from 'next';
import { AboutPage } from '@/components/site/AboutPage';
import { getSiteProps, type SiteProps } from '@/lib/server/site-props';

export const getServerSideProps: GetServerSideProps<SiteProps> = (context) => getSiteProps(context, 'en');

export default AboutPage;
