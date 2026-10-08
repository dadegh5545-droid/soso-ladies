/**
 * Fixed interface text of the public site. Content that the owner edits
 * (services, contact details) comes from SiteSettings and the catalog; the
 * homepage copy below is the approved redesign copy (October 2026).
 */
export type Lang = 'ar' | 'en';

export type Occasion = 'bride' | 'evening' | 'eid';

export const strings = {
  ar: {
    salonType: 'صالون نسائي',
    defaultSalonName: 'سوسو صالون نسائي',
    defaultTagline: 'جمالك شغفنا',
    galleryTitle: 'من داخل الصالون',
    skipToContent: 'تخطي إلى المحتوى',
    nav: {
      home: 'الرئيسية',
      services: 'الخدمات',
      about: 'عن الصالون',
      contact: 'تواصلي معنا',
    },
    mainNav: 'القائمة الرئيسية',
    menu: 'القائمة',
    closeMenu: 'إغلاق القائمة',
    otherLang: { label: 'EN', name: 'English', href: '/en', lang: 'en' },
    bookOnWhatsapp: 'احجزي عبر واتساب',
    hero: {
      eyebrow: 'صالون نسائي · الدوحة',
      titleLines: ['جمالكِ', 'شغفنا'],
      body: 'مكياج، شعر، حنة وعناية بالأظافر على يد خبيرات، في أجواء نسائية خاصة، أو نصل إليكِ أينما كنتِ.',
      cta: 'احجزي الآن عبر واتساب',
      segmentLabel: 'مكان الخدمة',
      segment: { salon: 'في الصالون', home: 'في بيتك' },
    },
    statement: {
      line1: 'نعتني بكِ كما لو كنتِ',
      line2: 'ضيفةً في بيتنا.',
      body: 'صالون سوسو مكان نسائي بالكامل، هادئ وخاص. وإذا كانت راحتك في بيتك، نأتيكِ بكامل الأدوات وبنفس العناية.',
      facts: [
        ['نسائي', 'بالكامل'],
        ['خدمة منزلية', 'في الدوحة'],
        ['حجز مباشر', 'عبر واتساب'],
      ],
    },
    marqueeLabel: 'خدماتنا',
    services: {
      eyebrow: 'خدماتنا',
      titleLines: ['كل ما تحتاجينه،', 'في مكان واحد.'],
      intro: 'اختاري الخدمة، ثم اسألينا عن الباقة التي تناسب مناسبتك.',
      filterLabel: 'مكان الخدمة',
      filter: { all: 'الكل', salon: 'في الصالون', home: 'خدمة منزلية' },
      tag: { BOTH: 'صالون · منزلي', SALON: 'في الصالون', HOME: 'خدمة منزلية' },
      cta: 'اسألي عن الباقات',
      ctaFor: (name: string) => `اسألي عن باقات ${name} عبر واتساب`,
      empty: 'لا توجد خدمات في هذا الاختيار حالياً.',
      photoSoon: 'صورة قريباً',
    },
    signature: {
      eyebrow: 'خدمتنا المميزة',
      title: 'المكياج الدائم',
      body: 'حواجب، آيلاينر وشفاه بلمسة طبيعية تدوم، لتستيقظي كل صباح جاهزة.',
      cta: 'احجزي استشارة مجانية',
      imageAlt: 'جلسة عناية بالبشرة في الصالون',
    },
    occasions: {
      eyebrow: 'مناسباتك',
      titleLines: ['لكل مناسبة', 'إطلالتها.'],
      bride: 'العروس',
      brideSub: 'باقة متكاملة ليوم العمر',
      evening: 'السهرة',
      eid: 'العيد والمناسبات',
      // The occasion as it reads inside the prefilled WhatsApp message.
      inMessage: { bride: 'العروس', evening: 'السهرة', eid: 'العيد والمناسبات' },
      askFor: (occasion: string) => `اسألي عن تجهيزات ${occasion} عبر واتساب`,
    },
    why: {
      eyebrow: 'لماذا سوسو؟',
      titleLines: ['تفاصيل صغيرة،', 'فرق كبير.'],
      items: [
        { title: 'خصوصية تامة', text: 'مكان نسائي بالكامل، هادئ وخاص بكِ.' },
        { title: 'عناية بالتفاصيل', text: 'نهتم بكل تفصيلة تُبرز جمالك.' },
        { title: 'نصل إليكِ', text: 'خدمة منزلية بكامل الأدوات في الدوحة.' },
        { title: 'تواصل سهل', text: 'رسالة واتساب واحدة تكفي.' },
      ],
    },
    how: {
      eyebrow: 'كيف تطلبين خدمتك؟',
      title: 'ثلاث خطوات فقط.',
      items: [
        { title: 'اختاري خدمتك', text: 'تصفّحي خدماتنا واختاري ما يناسبك.' },
        { title: 'راسلينا على واتساب', text: 'اسألي عن التفاصيل والمواعيد المتاحة.' },
        { title: 'استمتعي بالتجربة', text: 'في الصالون أو في راحة منزلك.' },
      ],
    },
    cta: {
      titleLines: ['جاهزة', 'لإطلالتك الجديدة؟'],
      body: 'راسلينا الآن ونرتّب لك موعدك في الصالون أو في بيتك.',
      button: 'احجزي عبر واتساب',
    },
    footer: {
      address: 'العنوان',
      hours: 'ساعات العمل',
      phone: 'الهاتف',
      instagram: 'انستقرام',
      whatsapp: 'واتساب',
      map: 'الموقع على الخريطة',
      copyright: '© 2026 Soso Ladies Salon · soso-ladies.qa',
    },
    sticky: {
      title: 'احجزي موعدك',
      sub: 'رد سريع عبر واتساب',
      button: 'واتساب',
    },
    messages: {
      booking: 'مرحباً سوسو، أرغب بحجز موعد.',
      service: (service: string) => `مرحباً سوسو، أرغب بالاستفسار عن باقات ${service}.`,
      consultation: 'مرحباً سوسو، أرغب بحجز استشارة مجانية للمكياج الدائم.',
      occasion: (occasion: string) => `مرحباً سوسو، أرغب بالاستفسار عن تجهيزات ${occasion}.`,
    },
  },
  en: {
    salonType: 'Ladies Salon',
    defaultSalonName: 'Soso Ladies Salon',
    defaultTagline: 'جمالك شغفنا',
    galleryTitle: 'Inside the salon',
    skipToContent: 'Skip to content',
    nav: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
    },
    mainNav: 'Main menu',
    menu: 'Menu',
    closeMenu: 'Close menu',
    otherLang: { label: 'ع', name: 'العربية', href: '/', lang: 'ar' },
    bookOnWhatsapp: 'Book on WhatsApp',
    hero: {
      eyebrow: 'Ladies salon · Doha',
      titleLines: ['Your beauty,', 'our passion'],
      body: 'Makeup, hair, henna and nail care by expert women, in a private ladies-only space, or brought to you wherever you are.',
      cta: 'Book now on WhatsApp',
      segmentLabel: 'Where to be served',
      segment: { salon: 'In the salon', home: 'At home' },
    },
    statement: {
      line1: 'We care for you as if you were',
      line2: 'a guest in our home.',
      body: 'Soso is a fully ladies-only salon, calm and private. And if home is where you are most comfortable, we come to you with everything we need and the same care.',
      facts: [
        ['Ladies', 'only'],
        ['Home service', 'across Doha'],
        ['Direct booking', 'on WhatsApp'],
      ],
    },
    marqueeLabel: 'Our services',
    services: {
      eyebrow: 'Our services',
      titleLines: ['Everything you need,', 'in one place.'],
      intro: 'Choose a service, then ask us about the package that suits your occasion.',
      filterLabel: 'Where to be served',
      filter: { all: 'All', salon: 'In the salon', home: 'At home' },
      tag: { BOTH: 'Salon · Home', SALON: 'Salon only', HOME: 'Home only' },
      cta: 'Ask about packages',
      ctaFor: (name: string) => `Ask about ${name} packages on WhatsApp`,
      empty: 'No services for this choice yet.',
      photoSoon: 'Photo coming soon',
    },
    signature: {
      eyebrow: 'Our signature service',
      title: 'Permanent makeup',
      body: 'Brows, eyeliner and lips with a natural finish that lasts, so you wake up ready every morning.',
      cta: 'Book a free consultation',
      imageAlt: 'A facial treatment at the salon',
    },
    occasions: {
      eyebrow: 'Your occasions',
      titleLines: ['Every occasion', 'has its look.'],
      bride: 'The bride',
      brideSub: 'A complete package for your big day',
      evening: 'Evening out',
      eid: 'Eid and occasions',
      inMessage: { bride: 'bridal', evening: 'evening', eid: 'Eid and occasion' },
      askFor: (occasion: string) => `Ask about ${occasion} services on WhatsApp`,
    },
    why: {
      eyebrow: 'Why Soso?',
      titleLines: ['Small details,', 'a big difference.'],
      items: [
        { title: 'Total privacy', text: 'A fully ladies-only space, calm and yours.' },
        { title: 'Attention to detail', text: 'We care about every detail that brings out your beauty.' },
        { title: 'We come to you', text: 'Home service with full equipment across Doha.' },
        { title: 'Easy to reach', text: 'One WhatsApp message is all it takes.' },
      ],
    },
    how: {
      eyebrow: 'How to book',
      title: 'Three steps only.',
      items: [
        { title: 'Choose your service', text: 'Browse our services and pick what suits you.' },
        { title: 'Message us on WhatsApp', text: 'Ask about details and available times.' },
        { title: 'Enjoy the experience', text: 'In the salon or in the comfort of your home.' },
      ],
    },
    cta: {
      titleLines: ['Ready', 'for your new look?'],
      body: 'Message us now and we will arrange your appointment, in the salon or at home.',
      button: 'Book on WhatsApp',
    },
    footer: {
      address: 'Address',
      hours: 'Opening hours',
      phone: 'Phone',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
      map: 'Location on the map',
      copyright: '© 2026 Soso Ladies Salon · soso-ladies.qa',
    },
    sticky: {
      title: 'Book your appointment',
      sub: 'Fast reply on WhatsApp',
      button: 'WhatsApp',
    },
    messages: {
      booking: 'Hi Soso, I would like to book an appointment.',
      service: (service: string) => `Hi Soso, I would like to ask about your ${service} packages.`,
      consultation: 'Hi Soso, I would like to book a free permanent-makeup consultation.',
      occasion: (occasion: string) => `Hi Soso, I would like to ask about ${occasion} services.`,
    },
  },
} as const;

export type Strings = (typeof strings)[Lang];
