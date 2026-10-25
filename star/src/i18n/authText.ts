import type { Lang } from './lang';
import { useLang } from './lang';

/**
 * Every string on the sign-up / sign-in / reset / verify screens, in English
 * and Arabic. The two dictionaries must have the same keys (the type enforces it).
 */
const en = {
  // page titles
  titleSignup: 'Create your account',
  titleLogin: 'Welcome back',
  titleReset: 'Reset your password',
  subSignup: 'It takes a minute. You can add the rest of your details later.',
  subLogin: 'Sign in to continue to your Nagm dashboard.',
  subResetRequest: 'Enter your email to receive a 6-digit verification code.',
  subResetCode: 'Enter the 6-digit code and set your new password.',
  // tabs and footer
  authModeLabel: 'Sign up or sign in',
  tabSignup: 'Sign Up',
  tabLogin: 'Log In',
  haveAccount: 'Already have an account?',
  signInLink: 'Sign in',
  noAccount: "Don't have an account?",
  createOneLink: 'Create one',
  // account types
  chooseAccountType: 'Choose your account type',
  accountType: 'Account type',
  roleCandidate: 'Candidate',
  roleCandidateHint: 'Find a job',
  roleRecruiter: 'Recruiter',
  roleRecruiterHint: 'Hire on your own',
  roleCompany: 'Company',
  roleCompanyHint: 'Register your company',
  createAccount: 'Create account',
  creating: 'Creating…',
  signIn: 'Sign in',
  signingIn: 'Signing in…',
  // fields
  fullName: 'Your name',
  fullNameRequired: 'Your name is required',
  passwordHint: 'At least 8 characters, with 3 of: uppercase, lowercase, number, symbol.',
  useWorkEmail: 'Use your company email (not Gmail, Outlook…). It is how we know the company is yours.',
  teammateHint: "Joining your company's hiring team? Ask your company admin to invite you. The invitation link creates your account in the right place.",
  invitedNote: 'You were invited to join a hiring team on Nagm. Create your account with the invited email to join it.',
  consentPrefix: 'By creating an account, you agree to the ',
  consentSuffix: '.',
  email: 'Email',
  businessEmail: 'Business Email',
  password: 'Password',
  companyName: 'Company Name',
  requiredMark: 'required',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  didYouMean: 'Did you mean',
  // recruiter company choice
  approvalCompany: 'After you verify your email, you add your commercial registration and tax card. Nagm reviews them, and your company can post jobs once it is approved.',
  terms: 'Terms of Service',
  termsAnd: ' and ',
  privacy: 'Privacy Policy',
  // validation
  companyNameRequired: 'Company name is required',
  tooLong: (label: string, max: number) => `${label} must be ${max} characters or less`,
  passwordRequired: 'Password is required',
  passwordTooShort: 'Password must be at least 8 characters',
  passwordTooLong: 'Password must be 128 characters or less',
  passwordClasses: 'Include at least 3 of: uppercase, lowercase, number, symbol',
  // sign in
  keepSignedIn: 'Keep me signed in for 30 days',
  forgotPassword: 'Forgot your password?',
  // forgot password
  yourEmail: 'Your email address',
  sendResetCode: 'Send reset code',
  sendingCode: 'Sending code…',
  resetCodeSent: (email: string) => `A 6-digit reset code was sent to ${email}`,
  newResetCodeSent: (email: string) => `A new 6-digit reset code was sent to ${email}`,
  guestFinishAccount: (email: string) => `You already applied to a job with ${email}. Enter the 6-digit code we sent there and choose a password to finish your account.`,
  changeEmail: 'Change',
  codeLabel: '6-digit verification code',
  noCode: "Didn't receive code?",
  sending: 'Sending…',
  resendIn: (s: number) => `Resend in ${s}s`,
  resendCode: 'Resend code',
  newPassword: 'New password',
  newPasswordPlaceholder: 'At least 8 characters',
  resetting: 'Resetting…',
  resetPassword: 'Reset password',
  backToSignIn: 'Back to sign in',
  enterValidEmail: 'Please enter a valid email address',
  enterCode: 'Please enter the 6-digit verification code',
  resetDone: 'Password reset successfully! Please sign in with your new password.',
  // verify
  verifyTitle: 'Enter your code',
  verifySubtitle: 'We sent a 6-digit code to',
  verifyNoEmailTitle: 'Verify your email',
  verifyNoEmailSubtitle: 'Start from the sign-in page to receive a code.',
  goToSignIn: 'Go to sign in',
  back: 'Back',
  verificationCode: 'Verification code',
  verifying: 'Verifying…',
  verifyContinue: 'Verify & continue',
  newCodeSent: 'A new code is on its way.',
  codeNotSent: 'Your account is created, but we couldn’t send the code just now. Tap “Resend code” in a minute.',
  pendingAccount: 'You started signing up with this email before. We sent you a new code — after confirming, sign in with the password you chose then.',
  backToSignup: 'Back to sign up / Change email',
  // fallbacks when the server gives no usable message
  failCreate: 'Could not create your account.',
  failSignIn: 'Could not sign you in. Check your email and password.',
  failSendReset: 'Failed to send reset code. Please try again.',
  failResend: 'Failed to resend code. Please try again.',
  failReset: 'Failed to reset password. Please try again.',
  failCode: 'That code didn’t work. Please try again.',
  failSignInAfterVerify: 'Your email is verified, but sign-in didn’t complete. Please sign in.',
  failResendVerify: 'Could not resend the code.',
};

type AuthText = typeof en;

const ar: AuthText = {
  titleSignup: 'أنشئ حسابك',
  titleLogin: 'مرحباً بعودتك',
  titleReset: 'إعادة تعيين كلمة المرور',
  subSignup: 'يستغرق دقيقة واحدة، وتستطيع إكمال بياناتك لاحقاً.',
  subLogin: 'سجّل الدخول للمتابعة إلى لوحة نجم.',
  subResetRequest: 'أدخل بريدك الإلكتروني ليصلك رمز تحقق من 6 أرقام.',
  subResetCode: 'أدخل الرمز المكوّن من 6 أرقام واختر كلمة مرور جديدة.',
  authModeLabel: 'إنشاء حساب أو تسجيل الدخول',
  tabSignup: 'إنشاء حساب',
  tabLogin: 'تسجيل الدخول',
  haveAccount: 'لديك حساب بالفعل؟',
  signInLink: 'سجّل الدخول',
  noAccount: 'ليس لديك حساب؟',
  createOneLink: 'أنشئ حساباً',
  chooseAccountType: 'اختر نوع الحساب',
  accountType: 'نوع الحساب',
  roleCandidate: 'مرشّح',
  roleCandidateHint: 'ابحث عن وظيفة',
  roleRecruiter: 'مسؤول توظيف',
  roleRecruiterHint: 'وظّف بشكل مستقل',
  roleCompany: 'شركة',
  roleCompanyHint: 'سجّل شركتك',
  createAccount: 'إنشاء الحساب',
  creating: 'جارٍ إنشاء الحساب…',
  signIn: 'تسجيل الدخول',
  signingIn: 'جارٍ تسجيل الدخول…',
  fullName: 'اسمك',
  fullNameRequired: 'الاسم مطلوب',
  passwordHint: '8 أحرف على الأقل، و3 من: حرف كبير، حرف صغير، رقم، رمز.',
  useWorkEmail: 'استخدم بريد شركتك (وليس Gmail أو Outlook…)؛ هكذا نتأكد أن الشركة تخصّك.',
  teammateHint: 'تنضم إلى فريق التوظيف في شركتك؟ اطلب من مسؤول الشركة أن يرسل لك دعوة؛ رابط الدعوة ينشئ حسابك في المكان الصحيح.',
  invitedNote: 'تمت دعوتك للانضمام إلى فريق توظيف على نجم. أنشئ حسابك بالبريد الذي وصلته الدعوة للانضمام.',
  consentPrefix: 'بإنشاء الحساب فأنت توافق على ',
  consentSuffix: '.',
  email: 'البريد الإلكتروني',
  businessEmail: 'بريد العمل',
  password: 'كلمة المرور',
  companyName: 'اسم الشركة',
  requiredMark: 'مطلوب',
  showPassword: 'إظهار كلمة المرور',
  hidePassword: 'إخفاء كلمة المرور',
  didYouMean: 'هل تقصد',
  approvalCompany: 'بعد تأكيد بريدك الإلكتروني تضيف السجل التجاري والبطاقة الضريبية. تراجعها نجم، وتستطيع شركتك نشر الوظائف بعد الموافقة عليها.',
  terms: 'شروط الخدمة',
  termsAnd: ' و',
  privacy: 'سياسة الخصوصية',
  companyNameRequired: 'اسم الشركة مطلوب',
  tooLong: (label: string, max: number) => `يجب ألا يزيد ${label} عن ${max} حرفاً`,
  passwordRequired: 'كلمة المرور مطلوبة',
  passwordTooShort: 'يجب أن تتكوّن كلمة المرور من 8 أحرف على الأقل',
  passwordTooLong: 'يجب ألا تزيد كلمة المرور عن 128 حرفاً',
  passwordClasses: 'استخدم 3 على الأقل من: حرف كبير، حرف صغير، رقم، رمز',
  keepSignedIn: 'ابقَ مسجّلاً لمدة 30 يوماً',
  forgotPassword: 'نسيت كلمة المرور؟',
  yourEmail: 'بريدك الإلكتروني',
  sendResetCode: 'إرسال رمز إعادة التعيين',
  sendingCode: 'جارٍ إرسال الرمز…',
  resetCodeSent: (email: string) => `أرسلنا رمزاً من 6 أرقام إلى ${email}`,
  newResetCodeSent: (email: string) => `أرسلنا رمزاً جديداً من 6 أرقام إلى ${email}`,
  guestFinishAccount: (email: string) => `سبق أن تقدّمت لوظيفة بالبريد ${email}. أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إليه واختر كلمة مرور لإكمال حسابك.`,
  changeEmail: 'تغيير',
  codeLabel: 'رمز التحقق (6 أرقام)',
  noCode: 'لم يصلك الرمز؟',
  sending: 'جارٍ الإرسال…',
  resendIn: (s: number) => `إعادة الإرسال بعد ${s} ث`,
  resendCode: 'إعادة إرسال الرمز',
  newPassword: 'كلمة المرور الجديدة',
  newPasswordPlaceholder: '8 أحرف على الأقل',
  resetting: 'جارٍ إعادة التعيين…',
  resetPassword: 'إعادة تعيين كلمة المرور',
  backToSignIn: 'العودة لتسجيل الدخول',
  enterValidEmail: 'أدخل بريداً إلكترونياً صحيحاً',
  enterCode: 'أدخل رمز التحقق المكوّن من 6 أرقام',
  resetDone: 'تمت إعادة تعيين كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.',
  verifyTitle: 'أدخل الرمز',
  verifySubtitle: 'أرسلنا رمزاً من 6 أرقام إلى',
  verifyNoEmailTitle: 'تحقّق من بريدك الإلكتروني',
  verifyNoEmailSubtitle: 'ابدأ من صفحة تسجيل الدخول ليصلك الرمز.',
  goToSignIn: 'الذهاب لتسجيل الدخول',
  back: 'رجوع',
  verificationCode: 'رمز التحقق',
  verifying: 'جارٍ التحقق…',
  verifyContinue: 'تحقّق وتابع',
  newCodeSent: 'أرسلنا رمزاً جديداً.',
  codeNotSent: 'تم إنشاء حسابك، لكن تعذّر إرسال الرمز الآن. اضغط «إعادة إرسال الرمز» بعد دقيقة.',
  pendingAccount: 'بدأت التسجيل بهذا البريد من قبل. أرسلنا لك رمزاً جديداً — بعد التأكيد سجّل الدخول بكلمة المرور التي اخترتها وقتها.',
  backToSignup: 'العودة للتسجيل / تغيير البريد',
  failCreate: 'تعذّر إنشاء حسابك.',
  failSignIn: 'تعذّر تسجيل دخولك. تحقّق من البريد الإلكتروني وكلمة المرور.',
  failSendReset: 'تعذّر إرسال رمز إعادة التعيين. حاول مرة أخرى.',
  failResend: 'تعذّرت إعادة إرسال الرمز. حاول مرة أخرى.',
  failReset: 'تعذّرت إعادة تعيين كلمة المرور. حاول مرة أخرى.',
  failCode: 'الرمز غير صحيح. حاول مرة أخرى.',
  failSignInAfterVerify: 'تم تأكيد بريدك، لكن لم يكتمل تسجيل الدخول. سجّل الدخول من فضلك.',
  failResendVerify: 'تعذّرت إعادة إرسال الرمز.',
};

export const AUTH_TEXT: Record<Lang, AuthText> = { en, ar };

export function useAuthText(): AuthText & { lang: Lang; isAr: boolean } {
  const lang = useLang();
  return { ...AUTH_TEXT[lang], lang, isAr: lang === 'ar' };
}

// ---------------------------------------------------------------------------
// Server messages. The API answers in English; these are the ones the auth
// screens can receive, so an Arabic page doesn't suddenly show English errors.
// Unknown messages pass through unchanged (better English than nothing).

const SERVER_AR: Record<string, string> = {
  'We could not send the code right now. Please try again in a few minutes.': 'تعذّر إرسال الرمز الآن. حاول مرة أخرى بعد دقائق.',
  'This email already has an account waiting to be confirmed. We will send a new code.': 'هذا البريد لديه حساب بانتظار التأكيد. سنرسل رمزاً جديداً.',
  'Email already exists': 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
  'An account already exists for this email address.': 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
  'This email already has a personal account. A company must register with its own business email address.':
    'هذا البريد مرتبط بحساب شخصي. يجب أن تسجّل الشركة ببريد العمل الخاص بها.',
  'Company registration requires a business email address (e.g., name@yourcompany.com).':
    'يتطلّب تسجيل الشركة بريد عمل (مثل name@yourcompany.com).',
  'The company you picked could not be found. Search again, or create it.':
    'تعذّر العثور على الشركة التي اخترتها. ابحث مجدداً أو أنشئها.',
  'Choose a company from the list': 'اختر شركة من القائمة',
  'Enter a valid email address': 'أدخل بريداً إلكترونياً صحيحاً',
  'Password must be at least 8 characters and include at least 3 of: uppercase, lowercase, number, symbol':
    'يجب أن تتكوّن كلمة المرور من 8 أحرف على الأقل وتحتوي على 3 على الأقل من: حرف كبير، حرف صغير، رقم، رمز',
  'Password must be 128 characters or less': 'يجب ألا تزيد كلمة المرور عن 128 حرفاً',
  'Enter a valid phone number (e.g. 01012345678 or +20 101 234 5678)':
    'أدخل رقم هاتف صحيحاً (مثل 01012345678 أو ‎+20 101 234 5678)',
  'First name is required': 'الاسم الأول مطلوب',
  'Company name is required': 'اسم الشركة مطلوب',
  'LinkedIn profile must be a valid link': 'أدخل رابط ملف صحيحاً على linkedin.com',
  'Website must be a valid link': 'أدخل رابط موقع صحيحاً',
  'User registration failed': 'تعذّر إنشاء الحساب. حاول مرة أخرى.',
  'OTP must be 6 digits': 'يجب أن يتكوّن الرمز من 6 أرقام',
  'OTP must contain only digits': 'يجب أن يحتوي الرمز على أرقام فقط',
  'The verification code you entered is incorrect. Please try again or request a new code.':
    'رمز التحقق غير صحيح. حاول مرة أخرى أو اطلب رمزاً جديداً.',
  'The verification code is invalid or has expired. Please request a new one.':
    'رمز التحقق غير صالح أو انتهت صلاحيته. اطلب رمزاً جديداً.',
  'This verification code has expired. Please request a new one.': 'انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.',
  'No verification code found. Please request a new verification code.': 'لا يوجد رمز تحقق. اطلب رمزاً جديداً.',
  'Too many incorrect codes. Please wait 15 minutes and try again, or request a new code.':
    'محاولات خاطئة كثيرة. انتظر 15 دقيقة ثم حاول مرة أخرى، أو اطلب رمزاً جديداً.',
  'Too many verification or reset code requests. Please wait a moment.': 'طلبات رموز كثيرة. انتظر قليلاً ثم حاول مرة أخرى.',
  'Too many login attempts. Please wait 60 seconds before trying again.': 'محاولات دخول كثيرة. انتظر 60 ثانية ثم حاول مرة أخرى.',
  'Too many attempts. Please wait a few minutes and try again.': 'محاولات كثيرة. انتظر بضع دقائق ثم حاول مرة أخرى.',
  'Email already verified. You can log in now.': 'تم تأكيد البريد الإلكتروني بالفعل. يمكنك تسجيل الدخول الآن.',
  'Invalid email or password. Please check your credentials.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'Invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'This code is incorrect or has expired. Check the latest email, or request a new code.':
    'الرمز غير صحيح أو انتهت صلاحيته. تحقّق من أحدث رسالة، أو اطلب رمزاً جديداً.',
  'Invalid or expired OTP': 'الرمز غير صحيح أو انتهت صلاحيته.',
  'Password set. You can sign in now.': 'تم تعيين كلمة المرور. يمكنك تسجيل الدخول الآن.',
  'You are signed in, but the app could not be opened. Please try again.': 'تم تسجيل دخولك، لكن تعذّر فتح التطبيق. حاول مرة أخرى.',
  'Session ended. Please sign in again.': 'انتهت الجلسة. سجّل الدخول مرة أخرى.',
  'Password is required': 'كلمة المرور مطلوبة',
  'Password is too long': 'كلمة المرور طويلة جداً',
  'Sign-in is temporarily unavailable. Please try again in a few minutes.': 'تسجيل الدخول غير متاح مؤقتاً. حاول مرة أخرى بعد بضع دقائق.',
  'Server error. Our team has been notified, please try again in a moment.': 'خطأ في الخادم. حاول مرة أخرى بعد قليل.',
  'Network error: unable to connect to server. Please check your internet connection.':
    'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت.',
  'Something went wrong. Please try again.': 'حدث خطأ ما. حاول مرة أخرى.',
  'Failed to verify OTP': 'تعذّر التحقق من الرمز. حاول مرة أخرى.',
};

const SERVER_AR_PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/^Please wait (\d+)s before requesting a new code$/, (m) => `انتظر ${m[1]} ثانية قبل طلب رمز جديد.`],
  [/^Too many failed sign-in attempts\. Try again in (\d+)s\.$/, (m) => `محاولات دخول فاشلة كثيرة. حاول مرة أخرى بعد ${m[1]} ثانية.`],
  [/^Too many incorrect codes\. Please wait (\d+)s and try again, or request a new code\.$/,
    (m) => `محاولات خاطئة كثيرة. انتظر ${m[1]} ثانية ثم حاول مرة أخرى، أو اطلب رمزاً جديداً.`],
];

export function localizeServerMessage(message: string, lang: Lang): string {
  if (lang === 'en' || !message) return message;
  if (SERVER_AR[message]) return SERVER_AR[message];
  for (const [re, build] of SERVER_AR_PATTERNS) {
    const m = message.match(re);
    if (m) return build(m);
  }
  return message;
}
