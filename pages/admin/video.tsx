import { useEffect, useState } from 'react';
import { AdminLayout, Notice, PageTitle, useConfirm, useUnsavedChanges } from '@/components/admin/AdminLayout';
import { UploadIcon } from '@/components/icons';
import styles from '@/components/admin/admin.module.css';
import type { SiteSettings } from '@/lib/admin/amplify';
import { getSettings, saveSettings } from '@/lib/admin/data';
import {
  VIDEO_WARN_BYTES,
  VIDEO_WARN_SECONDS,
  compressImage,
  formatMegabytes,
  newMediaKey,
  posterFromVideo,
  previewUrl,
  readVideoInfo,
  removeMedia,
  uploadMedia,
  type VideoInfo,
} from '@/lib/admin/media';
import { dataErrorMessage, logError } from '@/lib/admin/messages';
import { requireSessionCookie } from '@/lib/server/admin-guard';

export const getServerSideProps = requireSessionCookie;

const VIDEO_TYPES = ['video/mp4', 'video/webm'];

function warningsFor(file: File, info: VideoInfo): string[] {
  const warnings: string[] = [];
  if (info.duration > VIDEO_WARN_SECONDS) {
    warnings.push(`مدة الفيديو ${Math.round(info.duration)} ثانية، أطول من ${VIDEO_WARN_SECONDS} ثانية.`);
  }
  if (file.size > VIDEO_WARN_BYTES) {
    warnings.push(`حجم الفيديو ${formatMegabytes(file.size)}، أكبر من 20MB.`);
  }
  if (info.height > info.width) {
    warnings.push('الفيديو عمودي، والمكان في أعلى الصفحة عرضي؛ قد تُقص أطرافه.');
  }
  return warnings;
}

function VideoEditor() {
  const confirm = useConfirm();
  const [settings, setSettings] = useState<SiteSettings | null | undefined>(undefined);
  const [current, setCurrent] = useState<{ video: string | null; poster: string | null }>({ video: null, poster: null });
  const [video, setVideo] = useState<{ file: File; info: VideoInfo; warnings: string[]; url: string } | null>(null);
  const [poster, setPoster] = useState<{ file: File; url: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);

  useUnsavedChanges('video', !!video || !!poster);

  const load = async () => {
    const s = await getSettings();
    setSettings(s);
    setCurrent({
      video: s?.heroVideoKey ? await previewUrl(s.heroVideoKey) : null,
      poster: s?.heroPosterKey ? await previewUrl(s.heroPosterKey) : null,
    });
  };

  useEffect(() => {
    load().catch((e) => {
      logError('load video', e);
      setStatus({ kind: 'error', text: dataErrorMessage(e) });
    });
  }, []);

  // Local previews use object URLs; free them when replaced.
  useEffect(() => () => {
    if (video) URL.revokeObjectURL(video.url);
  }, [video]);
  useEffect(() => () => {
    if (poster) URL.revokeObjectURL(poster.url);
  }, [poster]);

  const pickVideo = async (file: File | undefined) => {
    setStatus(null);
    if (!file) return;
    if (!VIDEO_TYPES.includes(file.type)) {
      setStatus({ kind: 'error', text: 'اختاري ملف فيديو بصيغة MP4 أو WebM.' });
      return;
    }
    try {
      const info = await readVideoInfo(file);
      setVideo({ file, info, warnings: warningsFor(file, info), url: URL.createObjectURL(file) });
    } catch (e) {
      logError('read video', e);
      setStatus({ kind: 'error', text: dataErrorMessage(e) });
    }
  };

  const pickPoster = (file: File | undefined) => {
    setStatus(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus({ kind: 'error', text: 'اختاري صورة للغلاف.' });
      return;
    }
    setPoster({ file, url: URL.createObjectURL(file) });
  };

  const save = async () => {
    if (!video && !poster) return;
    setStatus(null);
    setProgress(0);
    const oldVideo = settings?.heroVideoKey ?? null;
    const oldPoster = settings?.heroPosterKey ?? null;
    const uploaded: string[] = [];
    try {
      let heroVideoKey = oldVideo;
      if (video) {
        const ext = video.file.type === 'video/webm' ? 'webm' : 'mp4';
        heroVideoKey = newMediaKey('hero', ext);
        await uploadMedia(heroVideoKey, video.file, video.file.type, (f) => setProgress(f * 0.85));
        uploaded.push(heroVideoKey);
      }

      // A chosen poster wins; otherwise a new video brings its first frame.
      let heroPosterKey = oldPoster;
      const posterImage = poster
        ? await compressImage(poster.file)
        : video
          ? await posterFromVideo(video.file)
          : null;
      if (posterImage) {
        heroPosterKey = newMediaKey('hero', posterImage.ext);
        await uploadMedia(heroPosterKey, posterImage.blob, posterImage.contentType, (f) => setProgress(0.85 + f * 0.15));
        uploaded.push(heroPosterKey);
      }

      await saveSettings({
        ...(settings ? {} : { salonNameAr: 'سوسو صالون نسائي' }),
        heroVideoKey,
        heroPosterKey,
      });

      // Old files are removed only after the new keys are saved.
      if (heroVideoKey !== oldVideo) await removeMedia(oldVideo);
      if (heroPosterKey !== oldPoster) await removeMedia(oldPoster);

      setVideo(null);
      setPoster(null);
      await load();
      setStatus({ kind: 'success', text: 'تم الحفظ. يظهر الفيديو في الموقع خلال دقيقة تقريباً.' });
    } catch (e) {
      logError('save video', e);
      // Nothing points at files uploaded by a failed save: remove them.
      for (const key of uploaded) await removeMedia(key);
      setStatus({ kind: 'error', text: dataErrorMessage(e) });
    } finally {
      setProgress(null);
    }
  };

  const removeVideo = async () => {
    const ok = await confirm({
      title: 'حذف الفيديو الرئيسي؟',
      body: 'يُحذف الفيديو وصورة الغلاف من الموقع ومن التخزين. يظهر مكانه لون الهوية.',
      confirmLabel: 'حذف الفيديو',
      danger: true,
    });
    if (!ok || !settings) return;
    try {
      await saveSettings({ heroVideoKey: null, heroPosterKey: null });
      await removeMedia(settings.heroVideoKey);
      await removeMedia(settings.heroPosterKey);
      await load();
      setStatus({ kind: 'success', text: 'تم حذف الفيديو.' });
    } catch (e) {
      logError('remove video', e);
      setStatus({ kind: 'error', text: dataErrorMessage(e) });
    }
  };

  if (settings === undefined) {
    return status ? <Notice kind={status.kind}>{status.text}</Notice> : <p role="status">جارٍ التحميل…</p>;
  }

  const busy = progress !== null;

  return (
    <div className={styles.card}>
      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>الفيديو الحالي</h2>
        {current.video ? (
          <div className={styles.preview} style={{ aspectRatio: '16 / 9' }}>
            <video className={styles.previewImage} src={current.video} poster={current.poster ?? undefined} muted loop playsInline controls preload="metadata" />
          </div>
        ) : (
          <p className={styles.muted}>لا يوجد فيديو. يظهر في أعلى الصفحة {current.poster ? 'صورة الغلاف' : 'لون الهوية'}.</p>
        )}
        {current.poster && (
          <div>
            <p className={styles.label}>صورة الغلاف (تظهر قبل تحميل الفيديو)</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.thumb} src={current.poster} alt="صورة الغلاف الحالية" style={{ width: 192, height: 108 }} />
          </div>
        )}
        {settings?.heroVideoKey && (
          <div className={styles.actions}>
            <button type="button" className={styles.smallDanger} onClick={removeVideo} disabled={busy}>
              حذف الفيديو
            </button>
          </div>
        )}
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>{settings?.heroVideoKey ? 'استبدال الفيديو' : 'رفع فيديو'}</h2>
        <p className={styles.muted}>
          فيديو عرضي بدون صوت، يُعرض تلقائياً ويتكرر. الأفضل أن يكون أقصر من {VIDEO_WARN_SECONDS} ثانية وأصغر من 20MB ليُحمَّل بسرعة على الجوال.
        </p>
        <label className={styles.drop}>
          <UploadIcon size={26} />
          <span>{video ? `${video.file.name} (${formatMegabytes(video.file.size)}، ${Math.round(video.info.duration)} ثانية)` : 'اضغطي لاختيار فيديو MP4 أو WebM'}</span>
          <input type="file" accept="video/mp4,video/webm" onChange={(e) => pickVideo(e.target.files?.[0])} disabled={busy} />
        </label>
        {video && video.warnings.length > 0 && (
          <div className={styles.warning} role="status">
            <strong>تنبيه:</strong>
            <ul>
              {video.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            يمكنك المتابعة، لكن الفيديو الكبير يبطئ الصفحة على الجوال.
          </div>
        )}
        {video && (
          <div className={styles.preview} style={{ aspectRatio: '16 / 9' }}>
            <video className={styles.previewImage} src={video.url} muted loop playsInline autoPlay />
          </div>
        )}
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>صورة الغلاف</h2>
        <p className={styles.muted}>اختيارية. إن لم ترفعي صورة تُؤخذ تلقائياً من أول إطار في الفيديو الجديد.</p>
        <label className={styles.drop}>
          <UploadIcon size={26} />
          <span>{poster ? poster.file.name : 'اضغطي لاختيار صورة غلاف. تُصغَّر وتُضغط تلقائياً قبل الرفع.'}</span>
          <input type="file" accept="image/*" onChange={(e) => pickPoster(e.target.files?.[0])} disabled={busy} />
        </label>
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.thumb} src={poster.url} alt="معاينة صورة الغلاف الجديدة" style={{ width: 192, height: 108 }} />
        )}
      </section>

      {progress !== null && <progress className={styles.progress} value={progress} max={1} aria-label="تقدّم الرفع" />}
      {status && <Notice kind={status.kind}>{status.text}</Notice>}

      <div className={styles.formActions}>
        <button type="button" className={styles.primaryButton} onClick={save} disabled={busy || (!video && !poster)}>
          {busy ? 'جارٍ الرفع…' : 'حفظ'}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setVideo(null);
            setPoster(null);
            setStatus(null);
          }}
          disabled={busy || (!video && !poster)}
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

export default function AdminVideo() {
  return (
    <AdminLayout title="الفيديو الرئيسي">
      <PageTitle title="الفيديو الرئيسي" lead="الفيديو الذي يظهر في أعلى الصفحة الرئيسية." />
      <VideoEditor />
    </AdminLayout>
  );
}
