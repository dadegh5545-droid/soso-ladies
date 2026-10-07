import Link from 'next/link';
import type { MissingItem } from '@/lib/admin/missing';
import { useLeaveGuard } from './AdminLayout';
import styles from './admin.module.css';

export function MissingBar({ items, compact }: { items: MissingItem[]; compact?: boolean }) {
  const guardLeave = useLeaveGuard();
  if (items.length === 0) {
    return compact ? null : <p className={styles.allGood}>الموقع مكتمل: كل العناصر الأساسية مُدخلة.</p>;
  }
  return (
    <div className={styles.missing}>
      <span className={styles.missingTitle}>ما ينقص الموقع:</span>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} onClick={guardLeave}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
