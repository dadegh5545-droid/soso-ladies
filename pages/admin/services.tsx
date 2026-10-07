import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AdminLayout, Notice, PageTitle, useConfirm, useUnsavedChanges } from '@/components/admin/AdminLayout';
import { Switch, TextField, focusFirstError } from '@/components/admin/fields';
import { MissingBar } from '@/components/admin/MissingBar';
import { ChevronIcon, PlusIcon, UploadIcon } from '@/components/icons';
import { PriceText } from '@/components/PriceText';
import styles from '@/components/admin/admin.module.css';
import type { Availability, Service, ServiceCategory, SiteSettings } from '@/lib/admin/amplify';
import {
  createCategory,
  createService,
  deleteCategory,
  deleteService,
  getSettings,
  listCategories,
  listServices,
  moveItem,
  nextSortOrder,
  updateCategory,
  updateService,
} from '@/lib/admin/data';
import { compressImage, newMediaKey, previewUrl, removeMedia, uploadMedia } from '@/lib/admin/media';
import { dataErrorMessage, logError } from '@/lib/admin/messages';
import { missingItems } from '@/lib/admin/missing';
import { formatPrice } from '@/lib/price';
import { requireSessionCookie } from '@/lib/server/admin-guard';

export const getServerSideProps = requireSessionCookie;

const AVAILABILITY: { key: Availability; label: string; hint: string }[] = [
  { key: 'SALON', label: 'في الصالون فقط', hint: 'تظهر للزائرات تحت تبويب «في الصالون» فقط.' },
  { key: 'HOME', label: 'منزلية فقط', hint: 'تظهر تحت تبويب «خدمة منزلية» فقط، بشارة «خدمة منزلية».' },
  { key: 'BOTH', label: 'الاثنان', hint: 'تظهر تحت التبويبين، بشارتين: «في الصالون» و«خدمة منزلية».' },
];

const NEW_CATEGORY = '__new__';

type Form = {
  id: string | null;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryId: string;
  availability: Availability | '';
  price: string;
  durationMinutes: string;
  isVisible: boolean;
  imageKey: string | null;
  newImage: File | null;
  removeImage: boolean;
};

type Errors = Partial<Record<'nameAr' | 'categoryId' | 'availability' | 'price' | 'durationMinutes' | 'newCategory', string>>;

const emptyForm = (categoryId = ''): Form => ({
  id: null,
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  categoryId,
  availability: '',
  price: '',
  durationMinutes: '',
  isVisible: true,
  imageKey: null,
  newImage: null,
  removeImage: false,
});

const toForm = (s: Service): Form => ({
  id: s.id,
  nameAr: s.nameAr,
  nameEn: s.nameEn ?? '',
  descriptionAr: s.descriptionAr ?? '',
  descriptionEn: s.descriptionEn ?? '',
  categoryId: s.categoryId,
  availability: s.availability ?? '',
  price: s.price == null ? '' : String(s.price),
  durationMinutes: s.durationMinutes == null ? '' : String(s.durationMinutes),
  isVisible: !!s.isVisible,
  imageKey: s.imageKey ?? null,
  newImage: null,
  removeImage: false,
});

const sameForm = (a: Form, b: Form) =>
  (Object.keys(a) as (keyof Form)[]).every((k) => a[k] === b[k]);

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.nameAr.trim()) errors.nameAr = 'اسم الخدمة بالعربية مطلوب.';
  if (!form.categoryId || form.categoryId === NEW_CATEGORY) errors.categoryId = 'اختاري فئة الخدمة.';
  if (!form.availability) errors.availability = 'حدّدي أين تُقدَّم الخدمة.';
  if (form.price.trim() && !(Number(form.price) > 0)) errors.price = 'السعر رقم أكبر من صفر، أو اتركيه فارغاً.';
  if (form.durationMinutes.trim() && !/^\d{1,4}$/.test(form.durationMinutes.trim())) {
    errors.durationMinutes = 'المدة بالدقائق رقم صحيح، أو اتركيها فارغة.';
  }
  return errors;
}

const Badges = ({ availability }: { availability: Availability | null | undefined }) => (
  <>
    {availability !== 'HOME' && <span className={styles.badgeSalon}>في الصالون</span>}
    {availability !== 'SALON' && <span className={styles.badgeHome}>خدمة منزلية</span>}
  </>
);

function ServicesEditor() {
  const confirm = useConfirm();
  const [services, setServices] = useState<Service[] | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [base, setBase] = useState<Form>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ ar: '', en: '' });
  const formRef = useRef<HTMLFormElement>(null);

  const dirty = !sameForm(form, base);
  useUnsavedChanges('service-form', dirty);

  useEffect(() => {
    Promise.all([listServices(), listCategories(), getSettings()])
      .then(([s, c, st]) => {
        setServices(s);
        setCategories(c);
        setSettings(st);
        const start = emptyForm(c[0]?.id ?? '');
        setForm(start);
        setBase(start);
      })
      .catch((e) => {
        logError('load services', e);
        setStatus({ kind: 'error', text: dataErrorMessage(e) });
      });
  }, []);

  // Preview of the stored image or of the newly chosen file.
  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    if (form.newImage) {
      revoke = URL.createObjectURL(form.newImage);
      setImageUrl(revoke);
    } else if (form.imageKey && !form.removeImage) {
      previewUrl(form.imageKey)
        .then((url) => !cancelled && setImageUrl(url))
        .catch(() => !cancelled && setImageUrl(null));
    } else {
      setImageUrl(null);
    }
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [form.newImage, form.imageKey, form.removeImage]);

  const missing = useMemo(
    () => (services ? missingItems({ settings, services, categories }) : []),
    [settings, services, categories],
  );

  const fail = (context: string, e: unknown) => {
    logError(context, e);
    setStatus({ kind: 'error', text: dataErrorMessage(e) });
  };

  const discardOk = () => !dirty || window.confirm('لديك تعديلات غير محفوظة على هذه الخدمة. هل تريدين تركها؟');

  const select = (service: Service | null) => {
    if (!discardOk()) return;
    const next = service ? toForm(service) : emptyForm(categories[0]?.id ?? '');
    setForm(next);
    setBase(next);
    setErrors({});
    setStatus(null);
    setNewCategory({ ar: '', en: '' });
    requestAnimationFrame(() => document.getElementById('f-name')?.focus());
  };

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus(null);
  };

  const addCategory = async () => {
    if (!newCategory.ar.trim()) {
      setErrors((e) => ({ ...e, newCategory: 'اسم الفئة بالعربية مطلوب.' }));
      return;
    }
    try {
      const created = await createCategory({
        nameAr: newCategory.ar.trim(),
        nameEn: newCategory.en.trim() || null,
        sortOrder: nextSortOrder(categories),
      });
      setCategories((list) => [...list, created]);
      set('categoryId', created.id);
      setNewCategory({ ar: '', en: '' });
      setErrors(({ newCategory: _, categoryId: __, ...rest }) => rest);
    } catch (e) {
      fail('create category', e);
    }
  };

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!services) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ kind: 'error', text: 'راجعي الحقول المحددة باللون الأحمر.' });
      requestAnimationFrame(() => focusFirstError(formRef.current));
      return;
    }
    setSaving(true);
    let uploadedKey: string | null = null;
    try {
      let imageKey = form.removeImage ? null : form.imageKey;
      if (form.newImage) {
        const image = await compressImage(form.newImage);
        uploadedKey = newMediaKey('services', image.ext);
        await uploadMedia(uploadedKey, image.blob, image.contentType);
        imageKey = uploadedKey;
      }
      const input = {
        nameAr: form.nameAr.trim(),
        nameEn: form.nameEn.trim() || null,
        descriptionAr: form.descriptionAr.trim() || null,
        descriptionEn: form.descriptionEn.trim() || null,
        categoryId: form.categoryId,
        availability: form.availability as Availability,
        price: form.price.trim() ? Number(form.price) : null,
        durationMinutes: form.durationMinutes.trim() ? Number(form.durationMinutes) : null,
        isVisible: form.isVisible,
        imageKey,
      };
      const saved = form.id
        ? await updateService({ id: form.id, ...input })
        : await createService({ ...input, sortOrder: nextSortOrder(services) });
      if (form.imageKey && form.imageKey !== imageKey) await removeMedia(form.imageKey);

      setServices((list) => {
        const rest = (list ?? []).filter((s) => s.id !== saved.id);
        return form.id ? (list ?? []).map((s) => (s.id === saved.id ? saved : s)) : [...rest, saved];
      });
      const next = toForm(saved);
      setForm(next);
      setBase(next);
      setStatus({ kind: 'success', text: 'تم حفظ الخدمة. تظهر في الموقع خلال دقيقة تقريباً.' });
    } catch (e) {
      if (uploadedKey) await removeMedia(uploadedKey);
      fail('save service', e);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!form.id) return;
    const ok = await confirm({
      title: 'حذف الخدمة؟',
      body: `تُحذف «${base.nameAr}» وصورتها نهائياً من الموقع.`,
      confirmLabel: 'حذف الخدمة',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteService(form.id);
      await removeMedia(base.imageKey);
      setServices((list) => list?.filter((s) => s.id !== form.id) ?? list);
      const next = emptyForm(categories[0]?.id ?? '');
      setForm(next);
      setBase(next);
      setStatus({ kind: 'success', text: 'تم حذف الخدمة.' });
    } catch (e) {
      fail('delete service', e);
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    if (!services) return;
    const { items, changed } = moveItem(services, index, delta);
    setServices(items);
    try {
      await Promise.all(changed.map((s) => updateService({ id: s.id, sortOrder: s.sortOrder })));
    } catch (e) {
      fail('reorder services', e);
    }
  };

  if (!services) return status ? <Notice kind={status.kind}>{status.text}</Notice> : <p role="status">جارٍ التحميل…</p>;

  const hint = AVAILABILITY.find((a) => a.key === form.availability)?.hint ?? 'اختاري أين تُقدَّم الخدمة؛ هذا يحدد التبويب والشارات في الموقع.';
  const showNewCategory = form.categoryId === NEW_CATEGORY || categories.length === 0;

  return (
    <>
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={() => select(null)}>
          <PlusIcon size={18} />
          <span>خدمة جديدة</span>
        </button>
      </div>
      <MissingBar items={missing} compact />

      <div className={styles.twoColumns}>
        <section className={styles.listColumn} aria-label="قائمة الخدمات">
          {services.length === 0 && <p className={styles.muted}>لا توجد خدمات بعد. أضيفي أول خدمة من النموذج.</p>}
          <ul className={styles.list}>
            {services.map((service, index) => {
              const category = categories.find((c) => c.id === service.categoryId);
              return (
                <li key={service.id} className={styles.row} data-active={form.id === service.id || undefined}>
                  <button type="button" className={styles.rowMain} onClick={() => select(service)} aria-current={form.id === service.id || undefined}>
                    <span className={styles.rowName}>{service.nameAr}</span>
                    <span className={styles.badges}>
                      <Badges availability={service.availability} />
                      {!service.isVisible && <span className={styles.badgeHidden}>مخفية</span>}
                      {category && !category.isVisible && <span className={styles.badgeHidden}>فئتها مخفية</span>}
                      {category && <span className={styles.badgeNeutral}>{category.nameAr}</span>}
                      {formatPrice(service.price) && (
                        <span className={styles.badgeNeutral}>
                          <PriceText lang="ar" amount={formatPrice(service.price) as string} />
                        </span>
                      )}
                    </span>
                  </button>
                  <div className={styles.arrows}>
                    <button type="button" className={styles.arrow} aria-label={`نقل «${service.nameAr}» للأعلى`} disabled={index === 0} onClick={() => move(index, -1)}>
                      <ChevronIcon direction="up" size={18} />
                    </button>
                    <button type="button" className={styles.arrow} aria-label={`نقل «${service.nameAr}» للأسفل`} disabled={index === services.length - 1} onClick={() => move(index, 1)}>
                      <ChevronIcon direction="down" size={18} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <form ref={formRef} className={`${styles.card} ${styles.formColumn}`} onSubmit={onSave} noValidate>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{form.id ? 'تعديل الخدمة' : 'خدمة جديدة'}</h2>
            <Switch checked={form.isVisible} onChange={(v) => set('isVisible', v)} onLabel="ظاهرة في الموقع" offLabel="مخفية عن الموقع" />
          </div>

          <TextField id="f-name" label="اسم الخدمة (بالعربية)" required value={form.nameAr} onChange={(v) => set('nameAr', v)} error={errors.nameAr} />
          <TextField label="اسم الخدمة (بالإنجليزية)" optional dir="ltr" lang="en" placeholder="Service name" value={form.nameEn} onChange={(v) => set('nameEn', v)} />
          <TextField label="الوصف (بالعربية)" optional multiline rows={3} value={form.descriptionAr} onChange={(v) => set('descriptionAr', v)} />
          <TextField label="الوصف (بالإنجليزية)" optional multiline rows={3} dir="ltr" lang="en" value={form.descriptionEn} onChange={(v) => set('descriptionEn', v)} />

          <div className={styles.field}>
            <label htmlFor="f-cat" className={styles.label}>
              الفئة <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <select
              id="f-cat"
              className={styles.select}
              value={categories.length === 0 ? NEW_CATEGORY : form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              aria-invalid={errors.categoryId ? true : undefined}
              aria-required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                  {c.isVisible ? '' : ' (مخفية)'}
                </option>
              ))}
              <option value={NEW_CATEGORY}>+ فئة جديدة</option>
            </select>
            {errors.categoryId && <span className={styles.error}>{errors.categoryId}</span>}
          </div>

          {showNewCategory && (
            <div className={styles.pair}>
              <TextField label="اسم الفئة الجديدة (بالعربية)" required value={newCategory.ar} onChange={(v) => setNewCategory((n) => ({ ...n, ar: v }))} error={errors.newCategory} />
              <TextField label="اسم الفئة (بالإنجليزية)" optional dir="ltr" lang="en" value={newCategory.en} onChange={(v) => setNewCategory((n) => ({ ...n, en: v }))} />
              <div className={styles.actions}>
                <button type="button" className={styles.smallButton} onClick={addCategory}>
                  <PlusIcon size={16} />
                  <span>إضافة الفئة</span>
                </button>
              </div>
            </div>
          )}

          <fieldset className={styles.fieldset} aria-describedby={errors.availability ? 'availability-hint availability-error' : 'availability-hint'}>
            <legend className={styles.legend}>
              أين تُقدَّم هذه الخدمة؟ <span className={styles.required} aria-hidden="true">*</span>
            </legend>
            <div className={styles.options}>
              {AVAILABILITY.map((option) => (
                <label key={option.key} className={styles.option}>
                  <input
                    type="radio"
                    name="availability"
                    value={option.key}
                    checked={form.availability === option.key}
                    onChange={() => set('availability', option.key)}
                    data-invalid={errors.availability ? 'true' : undefined}
                  />
                  <span className={styles.optionLabel}>{option.label}</span>
                </label>
              ))}
            </div>
            <p id="availability-hint" className={styles.hint}>
              {hint}
            </p>
            {errors.availability && (
              <span id="availability-error" className={styles.error}>
                {errors.availability}
              </span>
            )}
          </fieldset>

          <div className={styles.pair}>
            <TextField
              label="السعر (ر.ق)"
              optional
              dir="ltr"
              inputMode="decimal"
              value={form.price}
              onChange={(v) => set('price', v)}
              error={errors.price}
              hint={
                formatPrice(Number(form.price)) ? (
                  <>
                    يظهر في الموقع: <PriceText lang="ar" amount={formatPrice(Number(form.price)) as string} />
                  </>
                ) : (
                  'يظهر في الموقع «من … ر.ق».'
                )
              }
            />
            <TextField label="المدة بالدقائق" optional dir="ltr" inputMode="numeric" placeholder="60" value={form.durationMinutes} onChange={(v) => set('durationMinutes', v)} error={errors.durationMinutes} />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>
              صورة الخدمة <span className={styles.optional}>اختيارية</span>
            </span>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.thumb} src={imageUrl} alt={`صورة ${form.nameAr || 'الخدمة'}`} style={{ width: 160, height: 120 }} />
            )}
            <label className={styles.drop}>
              <UploadIcon size={26} />
              <span>{form.newImage ? form.newImage.name : 'اضغطي لرفع صورة. تُصغَّر وتُضغط تلقائياً قبل الرفع.'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    set('newImage', file);
                    set('removeImage', false);
                  }
                  e.target.value = '';
                }}
              />
            </label>
            {(form.newImage || (form.imageKey && !form.removeImage)) && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.smallDanger}
                  onClick={() => {
                    set('newImage', null);
                    set('removeImage', !!form.imageKey);
                  }}
                >
                  إزالة الصورة
                </button>
              </div>
            )}
          </div>

          {status && <Notice kind={status.kind}>{status.text}</Notice>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={saving || (!dirty && !!form.id)}>
              {saving ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={saving || !dirty}
              onClick={() => {
                setForm(base);
                setErrors({});
                setStatus(null);
              }}
            >
              إلغاء
            </button>
            {form.id && (
              <button type="button" className={styles.dangerLink} onClick={onDelete} disabled={saving}>
                حذف الخدمة
              </button>
            )}
          </div>
        </form>
      </div>

      <CategoriesCard
        categories={categories}
        services={services}
        onChange={setCategories}
        onError={fail}
      />
    </>
  );
}

function CategoriesCard({
  categories,
  services,
  onChange,
  onError,
}: {
  categories: ServiceCategory[];
  services: Service[];
  onChange: (next: ServiceCategory[]) => void;
  onError: (context: string, e: unknown) => void;
}) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ id: string; ar: string; en: string } | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const editingDirty = !!editing && (() => {
    const c = categories.find((x) => x.id === editing.id);
    return !!c && (c.nameAr !== editing.ar || (c.nameEn ?? '') !== editing.en);
  })();
  useUnsavedChanges('category-edit', editingDirty);

  const replace = (saved: ServiceCategory) => onChange(categories.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)));

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.ar.trim()) {
      setNotice({ kind: 'error', text: 'اسم الفئة بالعربية مطلوب.' });
      return;
    }
    try {
      replace(await updateCategory({ id: editing.id, nameAr: editing.ar.trim(), nameEn: editing.en.trim() || null }));
      setEditing(null);
      setNotice({ kind: 'success', text: 'تم حفظ الفئة.' });
    } catch (e) {
      onError('update category', e);
    }
  };

  const toggle = async (category: ServiceCategory, isVisible: boolean) => {
    try {
      replace(await updateCategory({ id: category.id, isVisible }));
    } catch (e) {
      onError('toggle category', e);
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const { items, changed } = moveItem(categories, index, delta);
    onChange(items);
    try {
      await Promise.all(changed.map((c) => updateCategory({ id: c.id, sortOrder: c.sortOrder })));
    } catch (e) {
      onError('reorder categories', e);
    }
  };

  const remove = async (category: ServiceCategory) => {
    const used = services.filter((s) => s.categoryId === category.id).length;
    if (used > 0) {
      setNotice({ kind: 'error', text: `لا يمكن حذف «${category.nameAr}» لأن فيها ${used} خدمة. انقلي خدماتها إلى فئة أخرى أو احذفيها أولاً.` });
      return;
    }
    const ok = await confirm({ title: 'حذف الفئة؟', body: `تُحذف فئة «${category.nameAr}».`, confirmLabel: 'حذف الفئة', danger: true });
    if (!ok) return;
    try {
      await deleteCategory(category.id);
      onChange(categories.filter((c) => c.id !== category.id));
      setNotice({ kind: 'success', text: 'تم حذف الفئة.' });
    } catch (e) {
      onError('delete category', e);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="categories-title">
      <div>
        <h2 id="categories-title" className={styles.cardTitle}>
          الفئات
        </h2>
        <p className={styles.muted}>تظهر في الموقع كشرائح لتصفية الخدمات. الفئة المخفية تُخفي كل خدماتها.</p>
      </div>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      {categories.length === 0 ? (
        <p className={styles.muted}>لا توجد فئات بعد. أضيفي فئة من نموذج الخدمة («+ فئة جديدة»).</p>
      ) : (
        <ul className={styles.list}>
          {categories.map((category, index) => (
            <li key={category.id} className={styles.categoryRow}>
              {editing?.id === category.id ? (
                <div className={styles.form} style={{ flexGrow: 1 }}>
                  <div className={styles.pair}>
                    <TextField label="اسم الفئة (بالعربية)" required value={editing.ar} onChange={(v) => setEditing({ ...editing, ar: v })} />
                    <TextField label="اسم الفئة (بالإنجليزية)" optional dir="ltr" lang="en" value={editing.en} onChange={(v) => setEditing({ ...editing, en: v })} />
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className={styles.smallButton} onClick={saveEdit}>
                      حفظ
                    </button>
                    <button type="button" className={styles.smallButton} onClick={() => setEditing(null)}>
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.rowMain}>
                    <span className={styles.rowName}>{category.nameAr}</span>
                    <span className={styles.badges}>
                      {category.nameEn && (
                        <span className={styles.badgeNeutral} lang="en" dir="ltr">
                          {category.nameEn}
                        </span>
                      )}
                      <span className={styles.badgeNeutral}>{services.filter((s) => s.categoryId === category.id).length} خدمة</span>
                    </span>
                  </div>
                  <Switch checked={!!category.isVisible} onChange={(v) => toggle(category, v)} onLabel="ظاهرة" offLabel="مخفية" />
                  <button type="button" className={styles.smallButton} onClick={() => setEditing({ id: category.id, ar: category.nameAr, en: category.nameEn ?? '' })}>
                    تعديل
                  </button>
                  <button type="button" className={styles.smallDanger} onClick={() => remove(category)}>
                    حذف
                  </button>
                  <div className={styles.arrows}>
                    <button type="button" className={styles.arrow} aria-label={`نقل «${category.nameAr}» للأعلى`} disabled={index === 0} onClick={() => move(index, -1)}>
                      <ChevronIcon direction="up" size={18} />
                    </button>
                    <button type="button" className={styles.arrow} aria-label={`نقل «${category.nameAr}» للأسفل`} disabled={index === categories.length - 1} onClick={() => move(index, 1)}>
                      <ChevronIcon direction="down" size={18} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminServices() {
  return (
    <AdminLayout title="الخدمات">
      <PageTitle title="الخدمات" lead="أضيفي الخدمات وحدّدي أين تُقدَّم كل خدمة. تظهر التعديلات في الموقع خلال دقيقة." />
      <ServicesEditor />
    </AdminLayout>
  );
}
