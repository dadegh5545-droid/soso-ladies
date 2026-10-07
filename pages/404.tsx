import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from './404.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <Head>
        <title>الصفحة غير موجودة</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Image src="/brand/soso-magenta.svg" alt="Soso" width={390} height={182} unoptimized className={styles.logo} />
      <h1 className={styles.title}>الصفحة غير موجودة</h1>
      <p lang="en" dir="ltr" className={styles.en}>
        Page not found
      </p>
      <div className={styles.links}>
        <Link href="/">الصفحة الرئيسية</Link>
        <Link href="/en" lang="en">
          Home page
        </Link>
      </div>
    </main>
  );
}
