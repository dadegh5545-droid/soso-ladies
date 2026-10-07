import { useEffect, useMemo, useState } from 'react';
import { AdminLayout, Notice, PageTitle, useConfirm, useUnsavedChanges } from '@/components/admin/AdminLayout';
import { Switch, TextField } from '@/components/admin/fields';
import { ChevronIcon, UploadIcon } from '@/components/icons';
import styles from '@/components/admin/admin.module.css';
import type { GalleryImage } from '@/lib/admin/amplify';
import {
  createGalleryImage,
  deleteGalleryImage,
  listGalleryImages,
  moveItem,
  nextSortOrder,
  updateGalleryImage,
} from '@/lib/admin/data';
import { compressImage, newMediaKey, previewUrl, removeMedia, uploadMedia } from '@/lib/admin/media';
import { dataErrorMessage, logError } from '@/lib/admin/messages';
import { requireSessionCookie } from '@/lib/server/admin-guard';

export const getServerSideProps = requireSessionCookie;

const DEFAULT_ALT = 'صورة من داخل الصالون';

type Draft = { altAr: string; altEn: string };

function GalleryEditor() {
  const confirm = useConfirm();
  const [items, setItems] = useState<GalleryImage[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dirtyIds = useMemo(
    () =>
      Object.entries(drafts)
        .filter(([id, d]) => {
          const item = items?.find((i) => i.id === id);
          return item && (d.altAr !== item.altAr || d.altEn !== (item.altEn ?? ''));
        })
        .map(([id]) => id),
    [drafts, items],
  );
  useUnsavedChanges('gallery', dirtyIds.length > 0 || !!upload);

  const withPreviews = async (list: GalleryImage[]) => {
    const missing = list.filter((item) => !urls[item.id]);
    const entries = await Promise.all(missing.map(async (item) => [item.id, await previewUrl(item.fileKey)] as const));
    if (entries.length) setUrls((u) => ({ ...u, ...Object.fromEntries(entries) }));
  };

  const reload = async () => {
    const list = await listGalleryImages();
    setItems(list);
    await withPreviews(list);
  };

  useEffect(() => {
    reload().catch((e) => {
      logError('load gallery', e);
      setStatus({ kind: 'error', text: dataErrorMessage(e) });
    });
    // Load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fail = (context: string, e: unknown) => {
    logError(context, e);
    setStatus({ kind: 'error', text: dataErrorMessage(e) });
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !items) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) {
      setStatus({ kind: 'error', text: 'اختاري صوراً فقط.' });
      return;
    }
    setStatus(null);
    setUpload({ done: 0, total: images.length });
    let sortOrder = nextSortOrder(items);
    const failed: string[] = [];
    for (const file of images) {
      let key: string | null = null;
      try {
        const image = await compressImage(file);
        key = newMediaKey('gallery', image.ext);
        await uploadMedia(key, image.blob, image.contentType);
        await createGalleryImage({ fileKey: key, altAr: DEFAULT_ALT, sortOrder });
        sortOrder += 10;
      } catch (e) {
        logError('upload gallery image', e);
        if (key) await removeMedia(key);
        failed.push(file.name);
      }
      setUpload((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    setUpload(null);
    await reload().catch((e) => fail('reload gallery', e));
    setStatus(
      failed.length
        ? { kind: 'error', text: `تعذّر رفع: ${failed.join('، ')}. جرّبي صوراً بصيغة JPG أو PNG.` }
        : { kind: 'success', text: 'تم رفع الصور. عدّلي النص البديل لكل صورة ليصف ما فيها.' },
    );
  };

  const draftOf = (item: GalleryImage): Draft => drafts[item.id] ?? { altAr: item.altAr, altEn: item.altEn ?? '' };
  const setDraft = (item: GalleryImage, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [item.id]: { ...draftOf(item), ...patch } }));

  const saveAlt = async (item: GalleryImage) => {
    const draft = draftOf(item);
    if (!draft.altAr.trim()) {
      setStatus({ kind: 'error', text: 'النص البديل بالعربية مطلوب لكل صورة.' });
      return;
    }
    setBusyId(item.id);
    try {
      const saved = await updateGalleryImage({ id: item.id, altAr: draft.altAr.trim(), altEn: draft.altEn.trim() || null });
      setItems((list) => list?.map((i) => (i.id === item.id ? { ...i, ...saved } : i)) ?? list);
      setDrafts(({ [item.id]: _, ...rest }) => rest);
      setStatus({ kind: 'success', text: 'تم حفظ النص البديل.' });
    } catch (e) {
      fail('save alt', e);
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (item: GalleryImage, isVisible: boolean) => {
    setBusyId(item.id);
    try {
      await updateGalleryImage({ id: item.id, isVisible });
      setItems((list) => list?.map((i) => (i.id === item.id ? { ...i, isVisible } : i)) ?? list);
    } catch (e) {
      fail('toggle image', e);
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    if (!items) return;
    const { items: next, changed } = moveItem(items, index, delta);
    setItems(next);
    try {
      await Promise.all(changed.map((i) => updateGalleryImage({ id: i.id, sortOrder: i.sortOrder })));
    } catch (e) {
      fail('reorder gallery', e);
      await reload().catch(() => undefined);
    }
  };

  const remove = async (item: GalleryImage) => {
    const ok = await confirm({
      title: 'حذف الصورة؟',
      body: 'تُحذف الصورة من المعرض ومن التخزين، ولا يمكن التراجع.',
      confirmLabel: 'حذف الصورة',
      danger: true,
    });
    if (!ok) return;
    setBusyId(item.id);
    try {
      // The record first: a leftover file is never shown, a record without its file would be.
      await deleteGalleryImage(item.id);
      await removeMedia(item.fileKey);
      setItems((list) => list?.filter((i) => i.id !== item.id) ?? list);
      setDrafts(({ [item.id]: _, ...rest }) => rest);
      setStatus({ kind: 'success', text: 'تم حذف الصورة.' });
    } catch (e) {
      fail('delete image', e);
    } finally {
      setBusyId(null);
    }
  };

  if (!items) return status ? <Notice kind={status.kind}>{status.text}</Notice> : <p role="status">جارٍ التحميل…</p>;

  return (
    <>
      <div className={styles.card}>
        <label className={styles.drop}>
          <UploadIcon size={26} />
          <span>
            {upload
              ? `جارٍ رفع الصور… ${upload.done} من ${upload.total}`
              : 'اضغطي لاختيار صورة أو عدة صور. تُصغَّر وتُضغط تلقائياً قبل الرفع.'}
          </span>
          <input type="file" accept="image/*" multiple disabled={!!upload} onChange={(e) => onFiles(e.target.files).finally(() => (e.target.value = ''))} />
        </label>
        {upload && <progress className={styles.progress} value={upload.done} max={upload.total} aria-label="تقدّم رفع الصور" />}
        {status && <Notice kind={status.kind}>{status.text}</Notice>}
      </div>

      {items.length === 0 ? (
        <p className={styles.muted}>لا توجد صور بعد. قسم المعرض لا يظهر في الموقع حتى تضيفي صورة ظاهرة.</p>
      ) : (
        <ul className={styles.galleryGrid}>
          {items.map((item, index) => {
            const draft = draftOf(item);
            const dirty = dirtyIds.includes(item.id);
            const busy = busyId === item.id;
            return (
              <li key={item.id} className={styles.galleryItem}>
                <div className={styles.galleryImage}>
                  {urls[item.id] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.previewImage} src={urls[item.id]} alt={item.altAr} />
                  )}
                </div>
                <TextField label="النص البديل (بالعربية)" required value={draft.altAr} onChange={(v) => setDraft(item, { altAr: v })} hint={draft.altAr === DEFAULT_ALT ? 'هذا نص افتراضي؛ صفي ما في الصورة.' : undefined} />
                <TextField label="النص البديل (بالإنجليزية)" optional dir="ltr" lang="en" value={draft.altEn} onChange={(v) => setDraft(item, { altEn: v })} />
                <div className={styles.itemFooter}>
                  {dirty && (
                    <button type="button" className={styles.smallButton} onClick={() => saveAlt(item)} disabled={busy}>
                      حفظ النص
                    </button>
                  )}
                  <Switch checked={!!item.isVisible} onChange={(v) => toggle(item, v)} onLabel="ظاهرة" offLabel="مخفية" />
                  <div className={styles.actions} style={{ marginInlineStart: 'auto' }}>
                    <button type="button" className={styles.arrow} aria-label="نقل إلى الأمام" disabled={index === 0 || busy} onClick={() => move(index, -1)}>
                      <ChevronIcon direction="right" size={18} />
                    </button>
                    <button type="button" className={styles.arrow} aria-label="نقل إلى الخلف" disabled={index === items.length - 1 || busy} onClick={() => move(index, 1)}>
                      <ChevronIcon direction="left" size={18} />
                    </button>
                    <button type="button" className={styles.smallDanger} onClick={() => remove(item)} disabled={busy}>
                      حذف
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function AdminGallery() {
  return (
    <AdminLayout title="المعرض">
      <PageTitle title="المعرض" lead="صور «من داخل الصالون». الترتيب هنا هو ترتيبها في الموقع." />
      <GalleryEditor />
    </AdminLayout>
  );
}
