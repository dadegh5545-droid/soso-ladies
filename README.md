# موقع سوسو صالون نسائي

موقع عرض لخدمات الصالون مع تواصل عبر واتساب (بدون نظام حجز)، ولوحة إدارة خاصة بالمالكة.
العربية على `/` والإنجليزية تحت `/en`، ولوحة الإدارة على `/admin`.

| الصفحة | العربية | الإنجليزية |
| --- | --- | --- |
| الرئيسية | `/` | `/en` |
| الخدمات | `/services` | `/en/services` |
| خدمة منزلية | `/home-service` | `/en/home-service` |
| عن سوسو | `/about` | `/en/about` |
| المعرض | `/gallery` | `/en/gallery` |
| تواصلي معنا | `/contact` | `/en/contact` |

المسارات معرّفة في `lib/site/routes.ts`، والنصوص في `lib/site/strings.ts`.

- الواجهة: Next.js 14 (pages router).
- الباك إند: AWS Amplify Gen 2، وتفاصيله في [`docs/backend.md`](docs/backend.md).
- التصميم المعتمد: [`docs/design/DESIGN.md`](docs/design/DESIGN.md).

## التشغيل المحلي

المتطلبات: Node.js 20 أو أحدث، وnpm 10، وAWS CLI v2 مع profile باسم `soso` (SSO).

```sh
npm ci
```

### الاتصال بالـ sandbox

الـ sandbox بيئة تطوير فقط: stack اسمه `amplify-sosoladies-soso-sandbox-…` في الحساب `894344182196` والمنطقة `ap-south-1`.
الواجهة تقرأ عنوانه من `amplify_outputs.json`. هذا الملف يولّده الـ sandbox، وهو غير متتبَّع في git.
إن لم يكن الملف موجوداً، أو تغيّر شيء في مجلد `amplify/`، فأعيدي توليده:

```sh
aws sso login --profile soso
npx ampx sandbox --profile soso --identifier soso --once
```

إن كان في `~/.aws/credentials` قسم `[soso]` قديم بمفاتيح ثابتة، فإن ampx يستخدمه بدل SSO ويفشل بخطأ `SSMCredentialsError`.
عندها وجّهيه إلى ملف فارغ لهذه العملية فقط (PowerShell):

```powershell
$tmp = New-TemporaryFile
$env:AWS_SHARED_CREDENTIALS_FILE = $tmp.FullName
npx ampx sandbox --profile soso --identifier soso --once
Remove-Item Env:AWS_SHARED_CREDENTIALS_FILE; Remove-Item $tmp
```

### تشغيل الموقع

```sh
npm run dev -- -p 3100
```

- الموقع على http://localhost:3100، والإنجليزية على http://localhost:3100/en، ولوحة الإدارة على http://localhost:3100/admin.
- في بيئة التطوير فقط، يظهر محتوى تجريبي عليه شريط أصفر واضح عندما تكون البيانات فارغة.
  لرؤية الحالات الفارغة الحقيقية شغّلي `DEMO_CONTENT=off npm run dev -- -p 3100`.
  هذا المحتوى لا يدخل في بناء الإنتاج.

### الأوامر

| الأمر | ما يفعله |
| --- | --- |
| `npm run dev` | خادم التطوير |
| `npm run build` ثم `npm start` | بناء الإنتاج وتشغيله محلياً |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript للواجهة ولمجلد `amplify/` |
| `npm test` | اختبارات الوحدة (`lib/**/*.test.ts`) |

لإضافة أي اعتمادية جديدة استخدمي `npx npm@10.8.2 install --package-lock-only`، ثم تحقّقي بـ`npm ci --dry-run`. السبب مشروح في `docs/backend.md`.

## هيكل المشروع

```text
amplify/                 الباك إند (auth, data, storage, functions/public-catalog)
components/site/         صفحات الموقع العام وأقسامه (SiteLayout, HeroCarousel, *Page, …)
public/media/            صور الموقع والفيديو ومصادرها (CREDITS.md)
components/admin/        لوحة الإدارة: التخطيط والحقول وشريط «ما ينقص الموقع»
lib/site/                نموذج العرض والنصوص الثابتة (عربي/إنجليزي)
lib/server/              قراءة البيانات كزائر من الخادم، وحماية صفحات الإدارة
lib/admin/               عمليات البيانات وضغط الصور والرفع للوحة الإدارة
lib/whatsapp.ts          روابط ورسائل واتساب
lib/demo-content.ts      محتوى تجريبي لبيئة التطوير فقط
pages/                   الصفحات: / و /en و /admin/* و /api/media و sitemap.xml و robots.txt
public/brand/            ملفات الهوية (منسوخة كما هي من docs/design/brand)
scripts/seed-content.mjs سكربت تعبئة المحتوى ورفع الوسائط
content/                 نصوص المحتوى (soso-content.json) والوسائط المحلية (خارج git)
styles/tokens.css        كل الألوان والخطوط والمسافات
```

## كيف يُحدَّث المحتوى

تُحدّث المالكة كل شيء من `/admin`:

- **الإعدادات العامة:** واتساب، والهاتف، وانستقرام، والعنوان، وساعات العمل، والخريطة (تظهر في الهيدر والفوتر وصفحة التواصل)، والنبذة (صفحة «عن سوسو»).
- **المعرض:** الصور، وترتيبها، ونصها البديل، وإخفاؤها (تُضاف بعد صور الصالون في صفحة المعرض).
- **الخدمات والفئات:** تظهر في الرئيسية (أول أربع) وصفحة الخدمات وصفحة الخدمة المنزلية (ما يُقدَّم في المنزل).

أي حقل فارغ يختفي عنصره من الموقع. لا تُعرض الأسعار.

**صور الموقع** في `public/media/` (المصادر وأماكن الاستخدام في `CREDITS.md`)، ولا تُعدَّل من اللوحة:

- العرض المتحرك في الرئيسية: الصور الأربع للصالون، 4.5 ثانية لكل صورة (`components/site/HeroCarousel.tsx`).
- صورة الخدمة المرفوعة من اللوحة تظهر بدل الصورة الافتراضية.
- لاستبدال صورة: ضعي ملفاً بنفس الاسم (1280×720 أو أكبر)، ثم انشري.

يظهر التعديل في الموقع خلال دقيقة تقريباً، بدون إعادة بناء:

- الصفحة تُبنى في الخادم عند كل طلب، وتحتفظ بها شبكة التوزيع (CDN) 30 ثانية (`s-maxage=30, stale-while-revalidate=15`).
- الخادم يحتفظ بآخر قراءة ناجحة 15 ثانية.
- لا يُستخدم ISR، لأن Amplify Hosting يقدّم منه نسخة وقت البناء من كل نسخة خادم.

## تعبئة المحتوى (`scripts/seed-content.mjs`)

يملأ السكربت إعدادات الموقع والخدمات من `content/soso-content.json`، ويرفع الصور والفيديو من `content/`.
ملفات الوسائط خارج git (`.gitignore`)، فتوضع في `content/` محلياً.

- **الفيديو:** `content/Soso_Website_Hero_12s.mp4`.
- **صورة الغلاف:** `content/hero-poster.jpg` (أو png أو webp).
- **صور الخدمات:** `content/images/<الاسم>.jpg`.

```powershell
npm run seed                      # dry-run: يعرض ما سيُكتب بدون أي كتابة وبدون دخول
$env:SOSO_OWNER_EMAIL = "…"; $env:SOSO_OWNER_PASSWORD = "…"
npm run seed -- --apply           # يكتب فعلاً بحساب المالكة (مجموعة OWNER)
npm run seed -- --apply --force   # يكتب فوق الخدمات الموجودة وفيديو الهيرو
```

- يتصل بالبيئة الموجودة في `amplify_outputs.json` المحلي.
- الخدمات تُطابَق بالاسم العربي. الموجودة لا تُكرَّر ولا يُكتب فوقها بدون `--force`، ولا يُحذف شيء أبداً.
- إن كان الحساب ما زال بكلمة مرور مؤقتة، يتوقف السكربت: سجّلي الدخول من `/admin/login` مرة أولاً.

**على الإنتاج (بعد نشر الفرع على Amplify Hosting):**

ملف الـ sandbox (`amplify_outputs.json`) يبقى كما هو، لأن خادم التطوير يقرؤه. outputs الإنتاج تُكتب في ملف منفصل، ويُختار بالمتغير `AMPLIFY_OUTPUTS`.

1. ولّدي outputs الفرع المنشور في مجلد مؤقت:

   ```powershell
   npx ampx generate outputs --app-id <APP_ID> --branch main --profile soso --out-dir $env:TEMP\soso-prod
   Copy-Item $env:TEMP\soso-prod\amplify_outputs.json amplify_outputs.production.json
   ```

   - `APP_ID` في صفحة التطبيق في Amplify console (للإنتاج الحالي `d25q08krig2cft`).
   - الملف خارج git (`amplify_outputs*`).
2. شغّلي التجربة ثم الكتابة. السكربت يطبع أولاً الـ user pool المستهدف:

   ```powershell
   $env:AMPLIFY_OUTPUTS = "amplify_outputs.production.json"
   npm run seed
   npm run seed -- --apply
   Remove-Item Env:AMPLIFY_OUTPUTS
   ```

   الكتابة تحتاج حساب مالكة الإنتاج في `SOSO_OWNER_EMAIL` و`SOSO_OWNER_PASSWORD`.

## إنشاء حساب المالكة

لا يوجد تسجيل ذاتي، فالحساب يُنشأ يدوياً في Cognito.
كل بيئة لها user pool مستقل: الـ sandbox بيئة، وكل فرع منشور على Amplify Hosting بيئة أخرى. أنشئي الحساب في البيئة التي ستستخدمها المالكة.

1. افتحي Amazon Cognito في الحساب والمنطقة نفسيهما، ثم User pools، واختاري الـ pool الخاص بالبيئة.
2. من Users اختاري Create user:
   - أدخلي الإيميل.
   - فعّلي Mark email address as verified.
   - اختاري كلمة مرور مؤقتة.
3. من Groups افتحي `OWNER`، ثم Add user to group، واختاري المستخدمة.
4. عند أول دخول من `/admin/login` تُطلب منها كلمة مرور جديدة.

أو عبر AWS CLI:

```sh
aws cognito-idp admin-create-user --profile soso --region ap-south-1 \
  --user-pool-id <USER_POOL_ID> --username <EMAIL> \
  --user-attributes Name=email,Value=<EMAIL> Name=email_verified,Value=true
aws cognito-idp admin-add-user-to-group --profile soso --region ap-south-1 \
  --user-pool-id <USER_POOL_ID> --username <EMAIL> --group-name OWNER
```

`USER_POOL_ID` في `amplify_outputs.json` تحت `auth.user_pool_id`.
أي حساب ليس في مجموعة `OWNER` يرى رسالة «غير مصرّح» ويُسجَّل خروجه.

## النشر على Amplify Hosting

1. في Amplify console (المنطقة `ap-south-1`) اختاري Create new app، ثم GitHub، ثم المستودع `dadegh5545-droid/soso-ladies` والفرع `main`.
2. يقرأ Amplify ملف `amplify.yml` من المستودع:
   - في مرحلة الباك إند يشغّل `npm ci` ثم `npx ampx pipeline-deploy`. هذا ينشئ باك إند خاصاً بالفرع ويولّد `amplify_outputs.json` أثناء البناء، فلا يُعتمد على أي ملف محلي.
   - في مرحلة الواجهة يشغّل `npm run build`.
3. بعد ربط الدومين، أضيفي متغير البيئة `SITE_URL` (مثلاً `https://example.com`) من Hosting، ثم Environment variables، ثم أعيدي النشر.
   - يُستخدم في روابط canonical وhreflang وOG وsitemap.
   - بدونه تُستخدم قيمة Host من الطلب.
4. بعد أول نشر أنشئي حساب المالكة في user pool هذه البيئة (القسم السابق)، ثم ارفعي الفيديو والصور، واملئي الإعدادات.

الـ sandbox لا يُربط بالإنتاج، ولا تُنقل بياناته إليه.

## الأمان

- **الكتابة لمجموعة `OWNER` فقط:** صلاحيات النماذج والتخزين تفرض ذلك في الباك إند، والواجهة ليست هي الحارس. للزائر Deny صريح على كل mutations وsubscriptions في IAM.
- **ما يقرؤه الزائر:**
  - الإعدادات.
  - `getPublicCatalog`، وهو يُرجع الظاهر فقط.
  - ملفات `media/*`. والخادم لا يقدّم عبر `/media/*` إلا الملفات التي تشير إليها الصفحة حالياً.
- **`/admin`:** عليه `noindex` (وسم meta وترويسة `X-Robots-Tag`)، وهو خارج الـ sitemap. لا تُعرض صفحاته بدون جلسة.
- **في git:** لا أسرار ولا `.env` ولا `amplify_outputs.json` (انظري `.gitignore`).
