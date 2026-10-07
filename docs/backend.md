# الباك إند (Amplify Gen 2)

الملفات: `amplify/backend.ts` و`amplify/auth` و`amplify/data` و`amplify/storage` و`amplify/functions/public-catalog`.
لا توجد بيانات تجريبية؛ قاعدة البيانات تبدأ فارغة.

## الدخول (Auth)

- دخول بالإيميل وكلمة المرور فقط.
- التسجيل الذاتي مقفل (`AllowAdminCreateUserOnly`)، فالمستخدمون يُنشَؤون من Cognito فقط.
- مجموعة واحدة: `OWNER`.
- استعادة كلمة المرور برمز يصل إلى الإيميل (`EMAIL_ONLY`).

## النماذج (Data)

حقول `*Ar` هي النص الأساسي، وحقول `*En` اختيارية؛ الواجهة تعرض العربي عند غياب الإنجليزي.

| النموذج | الحقول |
| --- | --- |
| `SiteSettings` (سجل واحد) | `salonNameAr/En`، `taglineAr/En` (الواجهة تعرض «جمالك شغفنا» عند غيابه)، `subtitleAr/En`، `aboutAr/En`، `whatsappNumber` (أرقام دولية فقط)، `phone`، `instagramUrl`، `addressAr/En`، `workingHoursAr/En`، `mapUrl`، `latitude`، `longitude`، `heroVideoKey`، `heroPosterKey` |
| `ServiceCategory` | `nameAr/En`، `sortOrder`، `isVisible` |
| `Service` | `nameAr/En`، `descriptionAr/En`، `categoryId`، `availability` (`SALON` أو `HOME` أو `BOTH`، مطلوب)، `price`، `durationMinutes`، `imageKey`، `sortOrder`، `isVisible` |
| `GalleryImage` | `fileKey`، `altAr/En`، `sortOrder`، `isVisible` |

- **المطلوب:** `salonNameAr` و`nameAr` و`altAr` و`fileKey` و`categoryId` و`availability`. باقي الحقول اختيارية، والواجهة تخفي عنصر أي حقل فارغ.
- **`SiteSettings`:** سجل واحد معرّفه ثابت `main` (`SITE_SETTINGS_ID` في `amplify/data/site-settings.ts`). لوحة الإدارة تنشئه مرة بهذا المعرّف ثم تحدّثه فقط.
- **`isVisible`:** قيمته الافتراضية `true`، والقيمة الفارغة تُعامَل كمخفي.

## الصلاحيات

| | الزائر (بدون دخول) | مجموعة `OWNER` |
| --- | --- | --- |
| `SiteSettings` | قراءة | كل العمليات |
| `ServiceCategory` و`Service` و`GalleryImage` | عبر `getPublicCatalog` فقط | كل العمليات |
| الملفات (Storage) | قراءة | قراءة ورفع وحذف |

### `getPublicCatalog`

الزائر لا يصل إلى جداول الخدمات والفئات والمعرض مباشرة؛ يقرأها عبر `getPublicCatalog`.

هذا الاستعلام دالة Lambda تقرأ الجداول وتُرجع `{ categories, services, galleryImages }`:

- **الفلترة:** تتم في الخادم. الخدمة الظاهرة داخل فئة مخفية لا تظهر.
- **الترتيب:** كل قائمة مرتبة بـ`sortOrder`.
- **الصلاحيات:** للدالة صلاحية `dynamodb:Scan` فقط على الجداول الثلاثة.

### أوضاع الاتصال (authMode)

- **الزائر:** `identityPool`، وهو الافتراضي.
- **المالكة في لوحة الإدارة:** تمرّر `authMode: 'userPool'`.

## مسارات الملفات (Storage)

| المسار | المحتوى |
| --- | --- |
| `media/hero/*` | الفيديو الرئيسي وصورته (poster) |
| `media/gallery/*` | صور المعرض |
| `media/services/*` | صور الخدمات |

تُحفظ مسارات الملفات في الحقول `heroVideoKey` و`heroPosterKey` و`fileKey` و`imageKey`.

## إضافة المالكة إلى مجموعة OWNER

بعد أول نشر (sandbox أو Amplify Hosting) تُنشأ مجموعة `OWNER` تلقائيًا.

1. افتح Amazon Cognito في نفس الحساب والـregion، ثم User pools، واختر الـpool الذي يبدأ اسمه بـ`amplifyAuthUserPool`.
2. من Users اختر Create user:
   - أدخل الإيميل.
   - فعّل Mark email address as verified، لأن استعادة كلمة المرور تحتاج إيميلًا موثّقًا.
   - اختر كلمة مرور مؤقتة، أو أرسل دعوة بالإيميل.
3. من Groups افتح `OWNER` ثم Add user to group واختر المستخدمة.
4. عند أول دخول تُطلب منها كلمة مرور جديدة.

أو عبر AWS CLI:

```sh
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username <EMAIL> \
  --group-name OWNER
```

- `USER_POOL_ID` موجود في `amplify_outputs.json` تحت `auth.user_pool_id`.
- بعد الإضافة إلى المجموعة يجب تسجيل الخروج ثم الدخول من جديد حتى تظهر المجموعة في الجلسة.
