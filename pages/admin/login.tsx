import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent } from 'react';
import { confirmResetPassword, confirmSignIn, resetPassword, signIn, signOut } from 'aws-amplify/auth';
import { AdminHead, sessionIsOwner } from '@/components/admin/AdminLayout';
import { TextField } from '@/components/admin/fields';
import styles from '@/components/admin/admin.module.css';
import { authErrorMessage, logError } from '@/lib/admin/messages';

/**
 * Email + password only. There is no sign-up: the owner account is created
 * in Cognito (README). First sign-in asks for a new password; "forgot
 * password" sends a code to the verified email.
 */
type Step = 'checking' | 'signIn' | 'newPassword' | 'forgot' | 'forgotCode';

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Already signed in as the owner: go straight to the panel.
  useEffect(() => {
    sessionIsOwner()
      .then(async (result) => {
        if (result === 'owner') return router.replace('/admin');
        if (result === 'not-owner') await signOut();
        setStep('signIn');
      })
      .catch(() => setStep('signIn'));
  }, [router]);

  const finishSignIn = async () => {
    const result = await sessionIsOwner();
    if (result === 'owner') {
      await router.replace('/admin');
      return;
    }
    await signOut();
    setPassword('');
    setStep('signIn');
    setError('هذا الحساب لا يملك صلاحية إدارة الموقع، وتم تسجيل خروجه.');
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (e) {
      logError('auth', e);
      if ((e as Error).name === 'PasswordResetRequiredException') {
        setStep('forgotCode');
        await resetPassword({ username: email.trim() }).catch(() => undefined);
        setInfo('أرسلنا رمز تحقق إلى إيميلك لتعيين كلمة مرور جديدة.');
      } else {
        setError(authErrorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const onSignIn = (event: FormEvent) => {
    event.preventDefault();
    run(async () => {
      const { nextStep } = await signIn({ username: email.trim(), password });
      if (nextStep.signInStep === 'DONE') return finishSignIn();
      if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setStep('newPassword');
        setInfo('أول دخول: اختاري كلمة مرور جديدة خاصة بك.');
        return;
      }
      if (nextStep.signInStep === 'RESET_PASSWORD') {
        await resetPassword({ username: email.trim() });
        setStep('forgotCode');
        setInfo('أرسلنا رمز تحقق إلى إيميلك لتعيين كلمة مرور جديدة.');
        return;
      }
      await signOut();
      setError('هذه الخطوة غير مدعومة في لوحة الإدارة. تواصلي مع المسؤول التقني.');
    });
  };

  const passwordsMatch = () => {
    if (newPassword !== newPassword2) {
      setError('كلمتا المرور غير متطابقتين.');
      return false;
    }
    return true;
  };

  const onNewPassword = (event: FormEvent) => {
    event.preventDefault();
    if (!passwordsMatch()) return;
    run(async () => {
      const { nextStep } = await confirmSignIn({ challengeResponse: newPassword });
      if (nextStep.signInStep === 'DONE') return finishSignIn();
      setError('تعذّر إكمال الدخول. حاولي مرة أخرى.');
    });
  };

  const onForgot = (event: FormEvent) => {
    event.preventDefault();
    run(async () => {
      await resetPassword({ username: email.trim() });
      setStep('forgotCode');
      setInfo('إن كان الإيميل مسجّلاً فسيصلك رمز تحقق خلال دقائق.');
    });
  };

  const onForgotCode = (event: FormEvent) => {
    event.preventDefault();
    if (!passwordsMatch()) return;
    run(async () => {
      await confirmResetPassword({ username: email.trim(), confirmationCode: code.trim(), newPassword });
      setPassword('');
      setNewPassword('');
      setNewPassword2('');
      setCode('');
      setStep('signIn');
      setInfo('تم تعيين كلمة المرور. سجّلي الدخول بها الآن.');
    });
  };

  const passwordHint = '8 أحرف على الأقل، وفيها حرف إنجليزي كبير وصغير ورقم ورمز.';

  return (
    <div className={styles.loginPage} dir="rtl" lang="ar">
      <AdminHead title="تسجيل الدخول" />
      <main className={styles.loginCard}>
        <Image src="/brand/soso-magenta.svg" alt="Soso" width={390} height={182} unoptimized priority className={styles.loginLogo} />
        <h1 className={styles.cardTitle}>
          {step === 'forgot' || step === 'forgotCode' ? 'استعادة كلمة المرور' : 'الدخول إلى لوحة الإدارة'}
        </h1>

        {info && (
          <p className={styles.notice} data-kind="info" role="status">
            {info}
          </p>
        )}
        {error && (
          <p className={styles.notice} data-kind="error" role="alert">
            {error}
          </p>
        )}

        {step === 'checking' && <p role="status">جارٍ التحقق…</p>}

        {step === 'signIn' && (
          <form className={styles.form} onSubmit={onSignIn} noValidate>
            <TextField label="الإيميل" type="email" autoComplete="username" dir="ltr" required value={email} onChange={setEmail} />
            <TextField label="كلمة المرور" type="password" autoComplete="current-password" dir="ltr" required value={password} onChange={setPassword} />
            <button className={styles.primaryButton} type="submit" disabled={busy || !email || !password}>
              {busy ? 'جارٍ الدخول…' : 'دخول'}
            </button>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setError(null);
                setInfo(null);
                setStep('forgot');
              }}
            >
              نسيتِ كلمة المرور؟
            </button>
          </form>
        )}

        {step === 'newPassword' && (
          <form className={styles.form} onSubmit={onNewPassword} noValidate>
            <TextField label="كلمة المرور الجديدة" type="password" autoComplete="new-password" dir="ltr" required hint={passwordHint} value={newPassword} onChange={setNewPassword} />
            <TextField label="تأكيد كلمة المرور" type="password" autoComplete="new-password" dir="ltr" required value={newPassword2} onChange={setNewPassword2} />
            <button className={styles.primaryButton} type="submit" disabled={busy || !newPassword || !newPassword2}>
              {busy ? 'جارٍ الحفظ…' : 'حفظ والدخول'}
            </button>
          </form>
        )}

        {step === 'forgot' && (
          <form className={styles.form} onSubmit={onForgot} noValidate>
            <TextField label="الإيميل" type="email" autoComplete="username" dir="ltr" required value={email} onChange={setEmail} />
            <button className={styles.primaryButton} type="submit" disabled={busy || !email}>
              {busy ? 'جارٍ الإرسال…' : 'أرسلي رمز التحقق'}
            </button>
            <button type="button" className={styles.textButton} onClick={() => setStep('signIn')}>
              العودة إلى الدخول
            </button>
          </form>
        )}

        {step === 'forgotCode' && (
          <form className={styles.form} onSubmit={onForgotCode} noValidate>
            <TextField label="رمز التحقق" inputMode="numeric" autoComplete="one-time-code" dir="ltr" required value={code} onChange={setCode} />
            <TextField label="كلمة المرور الجديدة" type="password" autoComplete="new-password" dir="ltr" required hint={passwordHint} value={newPassword} onChange={setNewPassword} />
            <TextField label="تأكيد كلمة المرور" type="password" autoComplete="new-password" dir="ltr" required value={newPassword2} onChange={setNewPassword2} />
            <button className={styles.primaryButton} type="submit" disabled={busy || !code || !newPassword || !newPassword2}>
              {busy ? 'جارٍ الحفظ…' : 'تعيين كلمة المرور'}
            </button>
            <button type="button" className={styles.textButton} onClick={() => setStep('signIn')}>
              العودة إلى الدخول
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
