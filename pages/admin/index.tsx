import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminLayout, Notice, PageTitle } from '@/components/admin/AdminLayout';
import { MissingBar } from '@/components/admin/MissingBar';
import styles from '@/components/admin/admin.module.css';
import type { GalleryImage, Service, ServiceCategory, SiteSettings } from '@/lib/admin/amplify';
import { getSettings, listCategories, listGalleryImages, listServices } from '@/lib/admin/data';
import { dataErrorMessage, logError } from '@/lib/admin/messages';
import { missingItems } from '@/lib/admin/missing';
import { requireSessionCookie } from '@/lib/server/admin-guard';

export const getServerSideProps = requireSessionCookie;

type Loaded = { settings: SiteSettings | null; services: Service[]; categories: ServiceCategory[]; gallery: GalleryImage[] };

function Summary() {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSettings(), listServices(), listCategories(), listGalleryImages()])
      .then(([settings, services, categories, gallery]) => setData({ settings, services, categories, gallery }))
      .catch((e) => {
        logError('summary', e);
        setError(dataErrorMessage(e));
      });
  }, []);

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!data) return <p role="status">جارٍ التحميل…</p>;

  const visibleServices = data.services.filter((s) => s.isVisible).length;
  const visibleImages = data.gallery.filter((g) => g.isVisible).length;
  const stats = [
    { value: visibleServices, label: 'خدمات ظاهرة', href: '/admin/services' },
    { value: data.services.length - visibleServices, label: 'خدمات مخفية', href: '/admin/services' },
    { value: data.categories.length, label: 'فئات', href: '/admin/services' },
    { value: visibleImages, label: 'صور ظاهرة في المعرض', href: '/admin/gallery' },
  ];

  return (
    <>
      <MissingBar items={missingItems(data)} />
      <div className={styles.stats}>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={styles.stat}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </Link>
        ))}
      </div>
      <p className={styles.muted}>تظهر التعديلات في الموقع خلال دقيقة تقريباً بعد الحفظ.</p>
    </>
  );
}

export default function AdminHome() {
  return (
    <AdminLayout title="الملخص">
      <PageTitle title="الملخص" lead="نظرة سريعة على محتوى الموقع وما ينقصه." />
      <Summary />
    </AdminLayout>
  );
}
