/**
 * The privacy policy and data-deletion pages, which Meta requires before the
 * salon's messaging app (WhatsApp, Instagram, Facebook) can be published.
 *
 * Fixed text on purpose: these are the details given to Meta, so they do not
 * follow the admin settings, and the pages render in full even when the data
 * cannot be read. In the text, {whatsapp}, {email}, {privacy} and
 * {dataDeletion} become links.
 */
import type { Lang } from './strings';

export const LEGAL_CONTACT = {
  /** wa.me format: digits only, with the country code. */
  whatsapp: '97433428070',
  whatsappDisplay: '+974 3342 8070',
  email: 'sosoladiessalon@gmail.com',
} as const;

export const LEGAL_LINKS = ['whatsapp', 'email', 'privacy', 'dataDeletion'] as const;
export type LegalLink = (typeof LEGAL_LINKS)[number];

export type LegalBlock = { p: string } | { ul: readonly string[] } | { ol: readonly string[] };
export type LegalSection = { id: string; title: string; body: readonly LegalBlock[] };

/** The WhatsApp and email cards that close the page. */
export type LegalContact = {
  title: string;
  whatsappLabel: string;
  emailLabel: string;
  /** Prefilled request (data deletion); without it the cards just open a chat or an email. */
  request?: { message: string; emailSubject: string };
};

export type LegalDoc = {
  effective?: { label: string; date: string; iso: string };
  sections: readonly LegalSection[];
  contact: LegalContact;
};

const EFFECTIVE_ISO = '2026-11-19';

export const privacyPolicy: Record<Lang, LegalDoc> = {
  ar: {
    effective: { label: 'تاريخ السريان', date: '19 نوفمبر 2026', iso: EFFECTIVE_ISO },
    sections: [
      {
        id: 'who-we-are',
        title: 'من نحن',
        body: [
          {
            p: 'سوسو صالون نسائي (Soso Ladies Salon)، في مشيرب، الدوحة، قطر. نحن المسؤولون عن البيانات التي تشاركينها معنا، ويمكنكِ التواصل معنا بشأنها عبر واتساب على {whatsapp} أو بالبريد الإلكتروني {email}.',
          },
        ],
      },
      {
        id: 'what-we-collect',
        title: 'البيانات التي نجمعها',
        body: [
          {
            p: 'نجمع فقط ما ترسلينه إلينا بنفسكِ عبر واتساب وانستقرام وفيسبوك ماسنجر، وعبر روابط التواصل والحجز في موقعنا:',
          },
          {
            ul: [
              'الاسم.',
              'رقم الهاتف.',
              'الرسائل التي تتبادلينها معنا.',
              'تفاصيل الحجز، مثل الخدمة والموعد، وموقع الزيارة في الخدمة المنزلية.',
            ],
          },
        ],
      },
      {
        id: 'how-we-use-it',
        title: 'لماذا نستخدمها',
        body: [
          { p: 'نستخدم هذه البيانات من أجل:' },
          {
            ul: [
              'الرد على رسائلكِ واستفساراتكِ.',
              'إدارة حجوزاتكِ ومواعيد الخدمة المنزلية.',
              'إرسال معلومات عن خدماتنا وعروضنا، ويمكنكِ أن تطلبي إيقافها في أي وقت.',
            ],
          },
        ],
      },
      {
        id: 'platforms',
        title: 'المنصات التي نستخدمها',
        body: [
          {
            p: 'نستقبل الرسائل ونرد عليها عبر منصات Meta (واتساب، انستقرام، فيسبوك)، وعبر منصة لإدارة رسائل الأعمال تساعدنا على تنظيم المحادثات. وتعالج هذه المنصات البيانات أيضاً وفق سياسات الخصوصية الخاصة بها.',
          },
        ],
      },
      {
        id: 'sharing',
        title: 'مشاركة البيانات',
        body: [
          {
            p: 'لا نبيع بياناتكِ الشخصية، ولا نشاركها مع أي طرف ثالث، إلا مع مزوّدي الخدمات الذين نحتاجهم لتشغيل هذه الخدمات، مثل المنصات المذكورة أعلاه، وبالقدر اللازم لذلك فقط.',
          },
        ],
      },
      {
        id: 'retention',
        title: 'مدة الاحتفاظ بالبيانات',
        body: [{ p: 'نحتفظ ببياناتكِ فقط طوال المدة اللازمة لإدارة حجوزاتكِ وخدمتكِ، ثم نحذفها.' }],
      },
      {
        id: 'your-rights',
        title: 'حقوقكِ',
        body: [
          {
            p: 'يحق لكِ في أي وقت أن تطلبي الاطلاع على بياناتكِ أو تصحيحها أو حذفها. راسلينا على {whatsapp} أو {email}، ولطلب الحذف اتبعي الخطوات في صفحة {dataDeletion}.',
          },
        ],
      },
      {
        id: 'changes',
        title: 'تحديث هذه السياسة',
        body: [{ p: 'إذا عدّلنا هذه السياسة، ننشر النسخة الجديدة في هذه الصفحة مع تاريخ السريان الجديد.' }],
      },
    ],
    contact: { title: 'تواصلي معنا', whatsappLabel: 'واتساب', emailLabel: 'البريد الإلكتروني' },
  },
  en: {
    effective: { label: 'Effective date', date: '19 November 2026', iso: EFFECTIVE_ISO },
    sections: [
      {
        id: 'who-we-are',
        title: 'Who we are',
        body: [
          {
            p: 'Soso Ladies Salon (سوسو صالون نسائي), Msheireb, Doha, Qatar. We are responsible for the data you share with us, and you can contact us about it on WhatsApp at {whatsapp} or by email at {email}.',
          },
        ],
      },
      {
        id: 'what-we-collect',
        title: 'What we collect',
        body: [
          {
            p: 'We collect only what you send us yourself through WhatsApp, Instagram, Facebook Messenger and the contact and booking links on our website:',
          },
          {
            ul: [
              'Your name.',
              'Your phone number.',
              'The messages you exchange with us.',
              'Booking details, such as the service, the date and time, and the visit location for home services.',
            ],
          },
        ],
      },
      {
        id: 'how-we-use-it',
        title: 'Why we use it',
        body: [
          { p: 'We use this data to:' },
          {
            ul: [
              'Reply to your messages and questions.',
              'Manage your bookings and home-service appointments.',
              'Share information about our services and offers. You can ask us to stop at any time.',
            ],
          },
        ],
      },
      {
        id: 'platforms',
        title: 'Platforms we use',
        body: [
          {
            p: 'We receive and reply to messages on Meta platforms (WhatsApp, Instagram and Facebook) and through a business messaging management platform that helps us organise conversations. These platforms also process data under their own privacy policies.',
          },
        ],
      },
      {
        id: 'sharing',
        title: 'Sharing your data',
        body: [
          {
            p: 'We do not sell your personal data. We do not share it with third parties, except the service providers we need to run these services, such as the platforms above, and only as far as they need it.',
          },
        ],
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        body: [{ p: 'We keep your data only as long as we need it for your bookings and customer service, and then delete it.' }],
      },
      {
        id: 'your-rights',
        title: 'Your rights',
        body: [
          {
            p: 'You can ask us at any time to access, correct or delete your data. Message us at {whatsapp} or {email}. To request deletion, follow the steps on our {dataDeletion} page.',
          },
        ],
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        body: [{ p: 'If we change this policy, we will publish the new version on this page with a new effective date.' }],
      },
    ],
    contact: { title: 'Contact us', whatsappLabel: 'WhatsApp', emailLabel: 'Email' },
  },
};

export const dataDeletion: Record<Lang, LegalDoc> = {
  ar: {
    sections: [
      {
        id: 'how-to-request',
        title: 'كيف تطلبين الحذف',
        body: [
          {
            ol: [
              'أرسلي رسالة واتساب إلى {whatsapp}، أو بريداً إلكترونياً إلى {email}.',
              'اكتبي في رسالتكِ اسمكِ ورقم هاتفكِ، واذكري أنكِ تطلبين حذف بياناتكِ.',
            ],
          },
        ],
      },
      {
        id: 'what-happens-next',
        title: 'بعد استلام طلبكِ',
        body: [
          { p: 'نحذف بياناتكِ خلال 30 يوماً من استلام الطلب، ونرسل لكِ رسالة تؤكد إتمام الحذف.' },
          { p: 'لمعرفة البيانات التي نجمعها وكيف نستخدمها، اطّلعي على {privacy}.' },
        ],
      },
    ],
    contact: {
      title: 'أرسلي طلبكِ',
      whatsappLabel: 'اطلبي الحذف عبر واتساب',
      emailLabel: 'اطلبي الحذف بالبريد الإلكتروني',
      request: {
        message: 'مرحباً سوسو، أرغب بحذف بياناتي.\nالاسم: \nرقم الهاتف: ',
        emailSubject: 'طلب حذف البيانات',
      },
    },
  },
  en: {
    sections: [
      {
        id: 'how-to-request',
        title: 'How to request deletion',
        body: [
          {
            ol: [
              'Send a WhatsApp message to {whatsapp}, or an email to {email}.',
              'Include your name and phone number, and say that you would like your data deleted.',
            ],
          },
        ],
      },
      {
        id: 'what-happens-next',
        title: 'What happens next',
        body: [
          { p: 'We delete your data within 30 days of receiving your request, and send you a message to confirm it is done.' },
          { p: 'To see what data we collect and how we use it, read our {privacy}.' },
        ],
      },
    ],
    contact: {
      title: 'Send your request',
      whatsappLabel: 'Request deletion on WhatsApp',
      emailLabel: 'Request deletion by email',
      request: {
        message: 'Hi Soso, I would like my data deleted.\nName: \nPhone number: ',
        emailSubject: 'Data deletion request',
      },
    },
  },
};

export type LegalPart = string | { link: LegalLink };

/** Splits a text into plain runs and {link} placeholders, in order. */
export function splitLinks(text: string): LegalPart[] {
  // With a capture group, split puts the placeholder names at the odd indexes.
  return text.split(/\{(\w+)\}/).flatMap((part, i): LegalPart[] => {
    if (i % 2 === 0) return part ? [part] : [];
    if (!(LEGAL_LINKS as readonly string[]).includes(part)) throw new Error(`Unknown link {${part}} in legal text`);
    return [{ link: part as LegalLink }];
  });
}

/** mailto: link, with the request's subject and body when there is one. */
export function legalMailto(request?: LegalContact['request']): string {
  const base = `mailto:${LEGAL_CONTACT.email}`;
  if (!request) return base;
  // encodeURIComponent, not URLSearchParams: mail apps show "+" literally.
  return `${base}?subject=${encodeURIComponent(request.emailSubject)}&body=${encodeURIComponent(request.message)}`;
}
