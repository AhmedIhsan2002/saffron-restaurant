# تحديثات نسخة Saffron الجديدة

## ما تم تغييره

### الواجهة

- إعادة تصميم الصفحة العامة بهوية أخضر زيتوني + ذهبي زعفراني + كريمي.
- إضافة Hero بصور مشاوي شامية أصلية.
- إضافة شعار رمزي جديد وخط عربي Cairo.
- إعادة بناء الهيدر، شريط الفئات، بطاقات المنتجات، شبكة المنتجات، footer، وحالات التحميل.
- جعل التصميم responsive للهاتف واللابتوب.
- إضافة favicon وmeta description وtheme color.
- استبدال الصور الاحتياطية بالصور الجديدة عند عدم وجود صورة للمنتج.

### الجودة

- إصلاح أخطاء TypeScript الأساسية.
- إصلاح إعداد `vite.config.ts` ليكون Vite config صحيحًا مع React plugin.
- نجاح `npm run build`.
- نجاح `npm run lint`.
- ضغط الصور لتقليل حجمها من حوالي 31MB إلى حوالي 1.7MB.

### الباك إند والأمان

- إضافة `public_token` عشوائي للطلبات.
- جعل تتبع الطلب يعتمد على token غير قابل للتخمين بدل رقم الطلب المتسلسل.
- إضافة migration لتعبئة tokens للطلبات القديمة.
- إضافة rate limiting لتسجيل الدخول وإنشاء الطلبات.
- جعل CORS قابلًا للضبط عبر `CORS_ALLOWED_ORIGINS`.
- جعل مدة Sanctum token قابلة للضبط عبر `SANCTUM_EXPIRATION`.
- منع استخدام بيانات مدير ثابتة في production؛ يجب توفير `ADMIN_EMAIL` و`ADMIN_PASSWORD`.

## التشغيل

### Frontend

```bash
cd saffron-frontend
npm ci
npm run dev
```

للبناء:

```bash
npm run build
npm run lint
```

### Backend

قبل التشغيل، يجب أن تتطابق نسخة PHP مع `composer.lock`، ويفضل PHP 8.4.1 أو أحدث حسب الحزم المقفلة حاليًا:

```bash
cd saffron-backend
composer install
php artisan migrate --seed
php artisan serve
```

في بيئة الإنتاج يجب ضبط:

```env
APP_ENV=production
APP_DEBUG=false
ADMIN_EMAIL=ضع_بريد_المدير
ADMIN_PASSWORD=ضع_كلمة_مرور_قوية
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
SANCTUM_EXPIRATION=480
```

> لا تستخدم كلمة المرور التجريبية المحلية في الإنتاج.

## ملاحظة مهمة

المعاينة المحلية للفرونت تظهر رسالة تعذر الاتصال إذا لم يكن Laravel API يعمل على عنوان `VITE_API_URL` الصحيح. هذا متوقع وليس خطأً في الواجهة نفسها؛ عند تشغيل الباك إند وضبط `.env` ستظهر الفئات والمنتجات الفعلية.
