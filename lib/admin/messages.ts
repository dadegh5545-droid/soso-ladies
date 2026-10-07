/** Arabic messages for errors shown in the admin panel. */
import { DataError } from './data';

const AUTH_MESSAGES: Record<string, string> = {
  NotAuthorizedException: 'الإيميل أو كلمة المرور غير صحيحة.',
  UserNotFoundException: 'الإيميل أو كلمة المرور غير صحيحة.',
  UserNotConfirmedException: 'هذا الحساب غير مفعّل بعد.',
  PasswordResetRequiredException: 'يجب تعيين كلمة مرور جديدة لهذا الحساب.',
  InvalidPasswordException:
    'كلمة المرور لا تستوفي الشروط: 8 أحرف على الأقل، وفيها حرف إنجليزي كبير وصغير ورقم ورمز.',
  InvalidParameterException: 'تحقّقي من البيانات المدخلة.',
  CodeMismatchException: 'رمز التحقق غير صحيح.',
  ExpiredCodeException: 'انتهت صلاحية الرمز. اطلبي رمزاً جديداً.',
  LimitExceededException: 'محاولات كثيرة. حاولي مرة أخرى بعد قليل.',
  TooManyRequestsException: 'محاولات كثيرة. حاولي مرة أخرى بعد قليل.',
  TooManyFailedAttemptsException: 'محاولات كثيرة. حاولي مرة أخرى بعد قليل.',
  EmptySignInUsername: 'اكتبي الإيميل.',
  EmptySignInPassword: 'اكتبي كلمة المرور.',
  NetworkError: 'تعذّر الاتصال. تحقّقي من الإنترنت ثم حاولي مرة أخرى.',
};

export function authErrorMessage(error: unknown): string {
  const name = (error as { name?: string })?.name ?? '';
  return AUTH_MESSAGES[name] ?? 'حدث خطأ غير متوقع. حاولي مرة أخرى.';
}

export function dataErrorMessage(error: unknown): string {
  if (error instanceof DataError) {
    if (error.errors.some((e) => /Unauthorized/i.test(e.errorType ?? '') || /Not Authorized/i.test(e.message ?? ''))) {
      return 'لا تملكين صلاحية هذا الإجراء. سجّلي الخروج ثم الدخول من جديد.';
    }
    return 'تعذّر الحفظ. حاولي مرة أخرى.';
  }
  const name = (error as { name?: string })?.name ?? '';
  if (name === 'NetworkError' || name === 'TypeError') return AUTH_MESSAGES.NetworkError;
  if (/decode-failed|canvas-unavailable|encode-failed/.test((error as Error)?.message ?? '')) {
    return 'تعذّر قراءة الصورة. جرّبي صورة بصيغة JPG أو PNG.';
  }
  if ((error as Error)?.message === 'video-unreadable') {
    return 'تعذّر قراءة الفيديو. استخدمي ملف MP4 أو WebM.';
  }
  return 'حدث خطأ غير متوقع. حاولي مرة أخرى.';
}

/** Logs the error class and message only (never tokens or request data). */
export function logError(context: string, error: unknown) {
  const e = error as Error;
  console.error(`[admin] ${context}: ${e?.name ?? 'Error'}: ${e?.message ?? ''}`);
}
