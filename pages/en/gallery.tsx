import type { GetServerSideProps } from 'next';
import { GalleryPage } from '@/components/site/GalleryPage';
import { getSiteProps, type SiteProps } from '@/lib/server/site-props';

export const getServerSideProps: GetServerSideProps<SiteProps> = (context) => getSiteProps(context, 'en');

export default GalleryPage;
