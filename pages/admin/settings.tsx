import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AdminLayout, Notice, PageTitle, useUnsavedChanges } from '@/components/admin/AdminLayout';
import { BilingualField, TextField, focusFirstError } from '@/components/admin/fields';
import styles from '@/components/admin/admin.module.css';
import type { SiteSettings } from '@/lib/admin/amplify';
import { getSettings, saveSettings, type SettingsInput } from '@/lib/admin/data';
import { dataErrorMessage, logError } from '@/lib/admin/messages';
import { requireSessionCookie } from '@/lib/server/admin-guard';
import { normalizeWhatsappNumber, whatsappLink } from '@/lib/whatsapp';

export const getServerSideProps = requireSessionCookie;

const TEXT_FIELDS = [
  'salonNameAr', 'salonNameEn', 'taglineAr', 'taglineEn', 'subtitleAr', 'subtitleEn', 'aboutAr', 'aboutEn',
  'whatsappNumber', 'phone', 'instagramUrl', 'addressAr', 'addressEn', 'workingHoursAr', 'workingHoursEn',
  'mapUrl', 'latitude', 'longitude',
] as const;
type FieldName = (typeof TEXT_FIELDS)[number];
type Form = Record<FieldName, string>;

const toForm = (s: SiteSettings | null): Form =>
  Object.fromEntries(TEXT_FIELDS.map((name) => [name, s?.[name] == null ? '' : String(s[name])])) as Form;

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

/** WhatsApp digits: "+974 5…" and "00974 5…" are both accepted and saved as 9745…. */
const whatsappDigits = (value: string) => normalizeWhatsappNumber(value.trim().replace(/^00/, ''));

function validate(form: Form): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!form.salonNameAr.trim()) errors.salonNameAr = 'اسم الصالون بالعربية مطلوب.';
  if (form.whatsappNumber.trim() && !whatsappDigits(form.whatsappNumber)) {
    errors.whatsappNumber = 'اكتبي الرقم بالصيغة الدولية مع رمز الدولة، أرقاماً فقط، مثل 9745XXXXXXX.';
  }
  if (form.phone.trim() && !/^\+?[\d\s()-]{6,20}$/.test(form.phone.trim())) {
    errors.phone = 'رقم الهاتف يحتوي على أرقام فقط (ويمكن أن يبدأ بـ +).';
  }
  if (form.instagramUrl.trim() && !isHttpUrl(form.instagramUrl.trim())) {
    errors.instagramUrl = 'اكتبي الرابط كاملاً، مثل https://www.instagram.com/…';
  }
  if (form.mapUrl.trim() && !isHttpUrl(form.mapUrl.trim())) {
    errors.mapUrl = 'اكتبي الرابط كاملاً ويبدأ بـ https://';
  }
  const lat = form.latitude.trim();
  const lng = form.longitude.trim();
  if (lat || lng) {
    const la = Number(lat);
    const lo = Number(lng);
    if (!lat || !Number.isFinite(la) || Math.abs(la) > 90) errors.latitude = 'خط العرض رقم بين ‎-90 و 90.';
    if (!lng || !Number.isFinite(lo) || Math.abs(lo) > 180) errors.longitude = 'خط الطول رقم بين ‎-180 و 180.';
  }
  return errors;
}

function toInput(form: Form): SettingsInput {
  const text = (name: FieldName) => form[name].trim() || null;
  const number = (name: FieldName) => (form[name].trim() ? Number(form[name]) : null);
  return {
    salonNameAr: form.salonNameAr.trim(),
    salonNameEn: text('salonNameEn'),
    taglineAr: text('taglineAr'),
    taglineEn: text('taglineEn'),
    subtitleAr: text('subtitleAr'),
    subtitleEn: text('subtitleEn'),
    aboutAr: text('aboutAr'),
    aboutEn: text('aboutEn'),
    whatsappNumber: form.whatsappNumber.trim() ? whatsappDigits(form.whatsappNumber) : null,
    phone: text('phone'),
    instagramUrl: text('instagramUrl'),
    addressAr: text('addressAr'),
    addressEn: text('addressEn'),
    workingHoursAr: text('workingHoursAr'),
    workingHoursEn: text('workingHoursEn'),
    mapUrl: text('mapUrl'),
    latitude: number('latitude'),
    longitude: number('longitude'),
  } as SettingsInput;
}

function SettingsForm() {
  const [loaded, setLoaded] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  // No record yet: the form starts from the brand name and can be saved as is.
  const [exists, setExists] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    getSettings()
      .then((s) => {
        const initial = toForm(s);
        if (!s) initial.salonNameAr = 'سوسو صالون نسائي';
        setExists(!!s);
        setLoaded(initial);
        setForm(initial);
      })
      .catch((e) => {
        logError('load settings', e);
        setStatus({ kind: 'error', text: dataErrorMessage(e) });
      });
  }, []);

  const dirty = useMemo(() => !!form && !!loaded && TEXT_FIELDS.some((n) => form[n] !== loaded[n]), [form, loaded]);
  useUnsavedChanges('settings', dirty);

  // Jump to the field named in the URL hash (links from "ما ينقص الموقع").
  useEffect(() => {
    if (!form) return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.focus();
    // Only once the form first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!form]);

  if (!form) return status ? <Notice kind={status.kind}>{status.text}</Notice> : <p role="status">جارٍ التحميل…</p>;

  const set = (name: FieldName) => (value: string) => {
    setForm((f) => (f ? { ...f, [name]: value } : f));
    setStatus(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ kind: 'error', text: 'راجعي الحقول المحددة باللون الأحمر.' });
      requestAnimationFrame(() => focusFirstError(formRef.current));
      return;
    }
    setSaving(true);
    try {
      const saved = await saveSettings(toInput(form));
      const next = toForm(saved);
      setLoaded(next);
      setForm(next);
      setExists(true);
      setStatus({ kind: 'success', text: 'تم الحفظ. تظهر التعديلات في الموقع خلال دقيقة تقريباً.' });
    } catch (e) {
      logError('save settings', e);
      setStatus({ kind: 'error', text: dataErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const wa = whatsappDigits(form.whatsappNumber);

  return (
    <form ref={formRef} className={styles.card} onSubmit={onSubmit} noValidate>
      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>الهوية والنصوص</h2>
        <BilingualField idPrefix="salonName" label="اسم الصالون" required ar={form.salonNameAr} en={form.salonNameEn} onAr={set('salonNameAr')} onEn={set('salonNameEn')} errorAr={errors.salonNameAr} />
        <BilingualField idPrefix="tagline" label="الشعار النصي في أعلى الصفحة" hint="إن تُرك فارغاً يظهر «جمالك شغفنا»." ar={form.taglineAr} en={form.taglineEn} onAr={set('taglineAr')} onEn={set('taglineEn')} />
        <BilingualField idPrefix="subtitle" label="سطر قصير تحت الشعار" ar={form.subtitleAr} en={form.subtitleEn} onAr={set('subtitleAr')} onEn={set('subtitleEn')} multiline rows={2} />
        <BilingualField idPrefix="about" label="نبذة «عن الصالون»" ar={form.aboutAr} en={form.aboutEn} onAr={set('aboutAr')} onEn={set('aboutEn')} multiline rows={5} />
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>التواصل</h2>
        <TextField
          id="whatsappNumber"
          label="رقم الواتساب"
          optional
          dir="ltr"
          inputMode="tel"
          autoComplete="off"
          placeholder="9745XXXXXXX"
          value={form.whatsappNumber}
          onChange={set('whatsappNumber')}
          error={errors.whatsappNumber}
          hint={
            wa ? (
              <>
                معاينة الرابط:{' '}
                <a className={styles.link} href={whatsappLink(wa)} target="_blank" rel="noopener noreferrer" dir="ltr">
                  {whatsappLink(wa)}
                </a>
              </>
            ) : (
              'بالصيغة الدولية مع رمز الدولة، أرقاماً فقط (بدون + أو 00). إن تُرك فارغاً تختفي أزرار الواتساب.'
            )
          }
        />
        <div className={styles.pair}>
          <TextField id="phone" label="رقم الهاتف" optional dir="ltr" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
          <TextField id="instagramUrl" label="رابط انستقرام" optional dir="ltr" inputMode="url" placeholder="https://www.instagram.com/…" value={form.instagramUrl} onChange={set('instagramUrl')} error={errors.instagramUrl} />
        </div>
        <BilingualField idPrefix="address" label="العنوان" ar={form.addressAr} en={form.addressEn} onAr={set('addressAr')} onEn={set('addressEn')} multiline rows={2} />
        <BilingualField idPrefix="workingHours" label="ساعات العمل" ar={form.workingHoursAr} en={form.workingHoursEn} onAr={set('workingHoursAr')} onEn={set('workingHoursEn')} multiline rows={3} />
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>الخريطة</h2>
        <p className={styles.muted}>
          مع الإحداثيات تظهر خريطة OpenStreetMap في الصفحة. بدونها يظهر زر «افتحي الموقع على الخريطة» برابط الخريطة. وبدون الاثنين تختفي الخريطة.
        </p>
        <TextField id="mapUrl" label="رابط الخريطة" optional dir="ltr" inputMode="url" placeholder="https://maps.app.goo.gl/…" value={form.mapUrl} onChange={set('mapUrl')} error={errors.mapUrl} />
        <div className={styles.pair}>
          <TextField id="latitude" label="خط العرض (Latitude)" optional dir="ltr" inputMode="decimal" placeholder="25.2854" value={form.latitude} onChange={set('latitude')} error={errors.latitude} />
          <TextField id="longitude" label="خط الطول (Longitude)" optional dir="ltr" inputMode="decimal" placeholder="51.5310" value={form.longitude} onChange={set('longitude')} error={errors.longitude} />
        </div>
      </section>

      {status && <Notice kind={status.kind}>{status.text}</Notice>}
      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryButton} disabled={saving || (!dirty && exists)}>
          {saving ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={saving || !dirty}
          onClick={() => {
            if (loaded) setForm(loaded);
            setErrors({});
            setStatus(null);
          }}
        >
          إلغاء التعديلات
        </button>
      </div>
    </form>
  );
}

export default function AdminSettings() {
  return (
    <AdminLayout title="الإعدادات العامة">
      <PageTitle title="الإعدادات العامة" lead="كل نص بالعربية، والإنجليزية اختيارية. أي حقل فارغ يختفي عنصره من الموقع." />
      <SettingsForm />
    </AdminLayout>
  );
}
