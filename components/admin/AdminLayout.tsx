import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import {
  CloseIcon,
  ExternalIcon,
  GridIcon,
  ImageIcon,
  ListIcon,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  VideoIcon,
} from '@/components/icons';
import '@/lib/admin/amplify';
import { logError } from '@/lib/admin/messages';
import styles from './admin.module.css';

export const OWNER_GROUP = 'OWNER';
const UNSAVED_MESSAGE = 'لديك تعديلات غير محفوظة. هل تريدين مغادرة الصفحة بدونها؟';

const NAV = [
  { href: '/admin', label: 'الملخص', Icon: GridIcon },
  { href: '/admin/settings', label: 'الإعدادات العامة', Icon: SettingsIcon },
  { href: '/admin/video', label: 'الفيديو الرئيسي', Icon: VideoIcon },
  { href: '/admin/gallery', label: 'المعرض', Icon: ImageIcon },
  { href: '/admin/services', label: 'الخدمات', Icon: ListIcon },
];

/** True when the current session belongs to the OWNER group. */
export async function sessionIsOwner(): Promise<'owner' | 'not-owner' | 'signed-out'> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken;
  if (!token) return 'signed-out';
  const groups = token.payload['cognito:groups'];
  return Array.isArray(groups) && groups.includes(OWNER_GROUP) ? 'owner' : 'not-owner';
}

type ConfirmOptions = { title: string; body?: string; confirmLabel: string; danger?: boolean };

type AdminContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  setDirty: (key: string, dirty: boolean) => void;
  guardLeave: (event: MouseEvent) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

function useAdminContext() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('Admin hooks must be used inside AdminLayout');
  return value;
}

/** Click handler for in-panel links: asks before leaving unsaved edits. */
export const useLeaveGuard = () => useAdminContext().guardLeave;

/** A promise-based confirmation dialog (every delete asks first). */
export const useConfirm = () => useAdminContext().confirm;

/**
 * Marks the page as having unsaved edits: closing the tab, reloading or
 * leaving through the panel's menu then asks first.
 */
export function useUnsavedChanges(key: string, dirty: boolean) {
  const { setDirty } = useAdminContext();
  useEffect(() => {
    setDirty(key, dirty);
    return () => setDirty(key, false);
  }, [key, dirty, setDirty]);
}

export function AdminHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{`${title} | لوحة إدارة سوسو`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );
}

type Status = 'checking' | 'owner' | 'not-owner';

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [menuOpen, setMenuOpen] = useState(false);
  const dirtyKeys = useRef(new Set<string>());
  const [, forceRender] = useState(0);

  useEffect(() => {
    let active = true;
    sessionIsOwner()
      .then(async (result) => {
        if (!active) return;
        if (result === 'owner') {
          setStatus('owner');
          return;
        }
        if (result === 'not-owner') {
          setStatus('not-owner');
          await signOut().catch(() => undefined);
          return;
        }
        // Stale cookies without a usable session: clear them, then log in.
        await signOut().catch(() => undefined);
        router.replace('/admin/login');
      })
      .catch(async (error) => {
        logError('session check', error);
        await signOut().catch(() => undefined);
        if (active) router.replace('/admin/login');
      });
    return () => {
      active = false;
    };
  }, [router]);

  const setDirty = useCallback((key: string, dirty: boolean) => {
    const had = dirtyKeys.current.has(key);
    if (dirty === had) return;
    if (dirty) dirtyKeys.current.add(key);
    else dirtyKeys.current.delete(key);
    forceRender((n) => n + 1);
  }, []);
  const hasUnsaved = dirtyKeys.current.size > 0;

  useEffect(() => {
    if (!hasUnsaved) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsaved]);

  // Confirmation dialog
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
        requestAnimationFrame(() => dialogRef.current?.showModal());
      }),
    [],
  );
  const answer = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
    dialogRef.current?.close();
  };

  const leaveGuard = (event: MouseEvent) => {
    if (hasUnsaved && !window.confirm(UNSAVED_MESSAGE)) {
      event.preventDefault();
      return;
    }
    setMenuOpen(false);
  };

  const onSignOut = async () => {
    if (hasUnsaved && !window.confirm(UNSAVED_MESSAGE)) return;
    await signOut().catch((error) => logError('sign out', error));
    router.replace('/admin/login');
  };

  if (status === 'checking') {
    return (
      <div className={styles.centerScreen} dir="rtl" lang="ar">
        <AdminHead title={title} />
        <p role="status">جارٍ التحقق من الدخول…</p>
      </div>
    );
  }

  if (status === 'not-owner') {
    return (
      <div className={styles.centerScreen} dir="rtl" lang="ar">
        <AdminHead title="غير مصرّح" />
        <div className={styles.card} role="alert">
          <h1 className={styles.cardTitle}>غير مصرّح بالدخول</h1>
          <p>هذا الحساب لا يملك صلاحية إدارة الموقع، وتم تسجيل خروجه.</p>
          <Link className={styles.primaryButton} href="/admin/login">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ confirm, setDirty, guardLeave: leaveGuard }}>
      <AdminHead title={title} />
      <div className={styles.shell} dir="rtl" lang="ar">
        <header className={styles.topbar}>
          <span className={styles.brandTitle}>لوحة الإدارة</span>
          <button
            type="button"
            className={styles.iconButton}
            aria-expanded={menuOpen}
            aria-controls="admin-sidebar"
            aria-label={menuOpen ? 'إغلاق القائمة' : 'القائمة'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </header>

        <aside id="admin-sidebar" className={styles.sidebar} data-open={menuOpen || undefined}>
          <div className={styles.sidebarBrand}>
            <span className={styles.sidebarName}>سوسو صالون نسائي</span>
            <span className={styles.sidebarSub}>لوحة الإدارة</span>
          </div>
          <nav className={styles.sidebarNav} aria-label="أقسام لوحة الإدارة">
            {NAV.map(({ href, label, Icon }) => {
              const current = router.pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={styles.navItem}
                  aria-current={current ? 'page' : undefined}
                  onClick={leaveGuard}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}
            <a className={styles.navItem} href="/" target="_blank" rel="noopener noreferrer">
              <ExternalIcon size={20} />
              <span>عرض الموقع</span>
            </a>
          </nav>
          <button type="button" className={styles.signOut} onClick={onSignOut}>
            <LogoutIcon size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </aside>

        <main className={styles.main}>{children}</main>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        dir="rtl"
        lang="ar"
        aria-labelledby="confirm-title"
        onCancel={(event) => {
          event.preventDefault();
          answer(false);
        }}
      >
        {pending && (
          <div className={styles.dialogBody}>
            <h2 id="confirm-title" className={styles.cardTitle}>
              {pending.title}
            </h2>
            {pending.body && <p>{pending.body}</p>}
            <div className={styles.actions}>
              <button
                type="button"
                className={pending.danger ? styles.dangerButton : styles.primaryButton}
                onClick={() => answer(true)}
              >
                {pending.confirmLabel}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => answer(false)} autoFocus>
                إلغاء
              </button>
            </div>
          </div>
        )}
      </dialog>
    </AdminContext.Provider>
  );
}

/** Page title row: heading, optional lead and an action on the side. */
export function PageTitle({ title, lead, action }: { title: string; lead?: string; action?: ReactNode }) {
  return (
    <div className={styles.pageTitle}>
      <div>
        <h1 className={styles.h1}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
      {action}
    </div>
  );
}

/** Polite status line (saved / errors) for screen readers and sighted users. */
export function Notice({ kind, children }: { kind: 'success' | 'error' | 'info'; children: ReactNode }) {
  return (
    <p className={styles.notice} data-kind={kind} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
