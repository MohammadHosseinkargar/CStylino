# راهنمای راه‌اندازی استایلینو

## مراحل نصب

### 1. نصب وابستگی‌ها

```bash
npm install
```

### 2. راه‌اندازی دیتابیس

با Docker:
```bash
docker-compose up -d
```

بدون Docker (PostgreSQL نصب شده):
- یک دیتابیس PostgreSQL ایجاد کنید
- Connection string را در `.env` تنظیم کنید

### 3. تنظیم فایل `.env`

از `env.example.txt` کپی کنید:
```bash
cp env.example.txt .env
```

محتویات `.env` را ویرایش کنید:
- `DATABASE_URL`: آدرس دیتابیس PostgreSQL
- `NEXTAUTH_SECRET`: یک رشته تصادفی برای JWT
- `ZARINPAL_MERCHANT_ID`: Merchant ID از پنل زرین‌پال
- `ZARINPAL_SANDBOX`: `true` برای تست، `false` برای production

### 4. راه‌اندازی دیتابیس

```bash
# تولید Prisma Client
npm run db:generate

# اجرای migrations
npm run db:migrate

# پر کردن دیتابیس با داده‌های نمونه
npm run db:seed
```

### 5. اجرای پروژه

```bash
npm run dev
```

پروژه در `http://localhost:3000` در دسترس است.

## حساب‌های پیش‌فرض

پس از seed:
- **مدیر**: admin@stylino.ir / admin123
- **همکار**: affiliate@stylino.ir / affiliate123

## نکات مهم

### زرین‌پال

این پروژه از SDK زرین‌پال استفاده نمی‌کند و مستقیماً از REST API استفاده می‌کند.

- `ZARINPAL_MERCHANT_ID`: Merchant ID از پنل زرین‌پال
- `ZARINPAL_BASE_URL`: آدرس API (پیش‌فرض: `https://api.zarinpal.com/pg/v4/payment`)
- `ZARINPAL_CALLBACK_URL`: آدرس callback (پیش‌فرض: `http://localhost:3000/api/payment/verify`)

برای تست از sandbox زرین‌پال استفاده کنید.

### تصاویر محصولات

در حال حاضر از URL های Unsplash استفاده شده است. برای production:
1. سیستم آپلود فایل اضافه کنید
2. تصاویر را در S3/R2 یا storage محلی ذخیره کنید
3. URL های تصاویر را در دیتابیس به‌روزرسانی کنید

### RTL و فونت فارسی

فونت Vazirmatn از CDN لود می‌شود. برای production بهتر است فونت را به صورت محلی نصب کنید.

## ساختار دیتابیس

- **User**: کاربران (customer, affiliate, admin)
- **Product**: محصولات
- **ProductVariant**: واریانت‌های محصول (سایز، رنگ، موجودی)
- **Order**: سفارش‌ها
- **OrderItem**: آیتم‌های سفارش
- **Commission**: کمیسیون‌های همکاران
- **PayoutRequest**: درخواست‌های پرداخت
- **Settings**: تنظیمات سیستم

## API Routes

- `/api/products` - لیست محصولات
- `/api/products/[slug]` - جزئیات محصول
- `/api/categories` - دسته‌بندی‌ها
- `/api/orders` - ایجاد و دریافت سفارش‌ها
- `/api/payment/request` - ایجاد درخواست پرداخت
- `/api/payment/verify` - تایید پرداخت (callback از زرین‌پال)
- `/api/payment/verify` - تایید پرداخت
- `/api/auth/signup` - ثبت‌نام
- `/api/affiliate/track` - ردیابی همکار

## صفحات اصلی

### فروشگاه
- `/store` - صفحه اصلی
- `/store/products` - لیست محصولات
- `/store/products/[slug]` - جزئیات محصول
- `/store/cart` - سبد خرید
- `/store/checkout` - پرداخت
- `/store/orders` - سفارش‌های من

### احراز هویت
- `/auth/signin` - ورود
- `/auth/signup` - ثبت‌نام

### پنل مدیریت
- `/admin` - داشبورد
- `/admin/products` - مدیریت محصولات
- `/admin/orders` - مدیریت سفارش‌ها
- `/admin/users` - مدیریت کاربران
- `/admin/affiliates` - مدیریت همکاران
- `/admin/settings` - تنظیمات

### پنل همکاران
- `/affiliate` - داشبورد همکار
- `/affiliate/commissions` - کمیسیون‌ها
- `/affiliate/payout` - درخواست پرداخت
- `/affiliate/sub-affiliates` - زیرمجموعه‌ها

## توسعه

برای توسعه بیشتر:
1. تست‌های واحد و E2E اضافه کنید
2. سیستم آپلود تصاویر پیاده‌سازی کنید
3. سیستم اطلاع‌رسانی اضافه کنید
4. گزارش‌گیری پیشرفته پیاده‌سازی کنید
5. بهینه‌سازی SEO انجام دهید

