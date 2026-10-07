import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './admin.module.css';

type Common = {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  error?: string | null;
};

function LabelText({ label, required, optional }: Pick<Common, 'label' | 'required' | 'optional'>) {
  return (
    <>
      {label}
      {required && (
        <span className={styles.required} aria-hidden="true">
          {' '}*
        </span>
      )}
      {optional && <span className={styles.optional}> اختياري</span>}
    </>
  );
}

type TextFieldProps = Common & {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>;

export function TextField({ label, required, optional, hint, error, value, onChange, multiline, rows = 3, id, ...rest }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const common = {
    id: fieldId,
    value,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
  };
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        <LabelText label={label} required={required} optional={optional} />
      </label>
      {multiline ? (
        <textarea
          {...common}
          className={styles.textarea}
          rows={rows}
          dir={rest.dir}
          lang={rest.lang}
          placeholder={rest.placeholder}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        />
      ) : (
        <input {...rest} {...common} className={styles.input} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}

/** Arabic (primary) and English (optional) versions of one text, side by side on wide screens. */
export function BilingualField({
  label,
  required,
  hint,
  ar,
  en,
  onAr,
  onEn,
  multiline,
  rows,
  errorAr,
  idPrefix,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  ar: string;
  en: string;
  onAr: (value: string) => void;
  onEn: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  errorAr?: string | null;
  idPrefix: string;
}) {
  return (
    <div className={styles.pair}>
      <TextField
        id={`${idPrefix}Ar`}
        label={`${label} (بالعربية)`}
        required={required}
        optional={!required}
        hint={hint}
        error={errorAr}
        value={ar}
        onChange={onAr}
        multiline={multiline}
        rows={rows}
        dir="rtl"
        lang="ar"
      />
      <TextField
        id={`${idPrefix}En`}
        label={`${label} (بالإنجليزية)`}
        optional
        hint="إن تُرك فارغاً تظهر النسخة العربية في الصفحة الإنجليزية."
        value={en}
        onChange={onEn}
        multiline={multiline}
        rows={rows}
        dir="ltr"
        lang="en"
      />
    </div>
  );
}

export function Switch({ checked, onChange, onLabel, offLabel }: { checked: boolean; onChange: (value: boolean) => void; onLabel: string; offLabel: string }) {
  const labelId = useId();
  return (
    <div className={styles.switchRow}>
      <span id={labelId} className={styles.switchLabel}>
        {checked ? onLabel : offLabel}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        className={styles.switch}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

/** Focuses the first invalid field after a failed save. */
export function focusFirstError(container: HTMLElement | null) {
  const el = container?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
  el?.focus();
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
