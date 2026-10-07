import type { GetServerSideProps } from 'next';
import { HomePage } from '@/components/site/HomePage';
import { getHomeProps, type HomeProps } from '@/lib/server/home-props';

export const getServerSideProps: GetServerSideProps<HomeProps> = (context) => getHomeProps(context, 'en');

export default HomePage;
