# گزارش ممیزی UI/UX و فرانت‌اند (Next.js | RTL | فروشگاه مد)

این گزارش بر اساس بررسی کد (بدون اجرای پروژه) تهیه شده است. مسیر فایل‌ها برای هر مورد مشخص شده‌اند.

---

## 🔴 Critical UI/UX problems (must fix)

1) خرابی متن فارسی/Encoding در چندین صفحه و حتی متادیتا (نمایش ?????) — تجربه کاربر و SEO عملا نابود می‌شود.
- app/layout.tsx
- app/(storefront)/auth/signin/page.tsx
- app/(storefront)/auth/signup/page.tsx
- app/(storefront)/auth/error/page.tsx
- app/(storefront)/store/orders/page.tsx
- lib/utils.ts
- lib/order-status.ts

2) واحد پول و متن قیمت ناسازگار/خراب است؛ در بعضی جاها متن واحد پول خراب شده و در بعضی جاها با متن دستی متفاوت نمایش داده می‌شود.
- lib/utils.ts
- app/(storefront)/store/cart/page.tsx
- app/(storefront)/store/checkout/page.tsx

3) لینک‌های اصلی فوتر به صفحات موجود نیستند و کاربر با 404 روبه‌رو می‌شود (Terms/FAQ/Shipping/Size guide/Privacy/Care).
- components/storefront/footer.tsx

4) تصویر جایگزین کارت محصول به مسیری اشاره می‌کند که وجود ندارد و باعث تصویر شکسته می‌شود.
- components/storefront/product-card.tsx

5) صفحه سفارش‌ها عملا فاقد کپی فارسی خوانا است (?????) و وضعیت سفارش نامفهوم می‌شود.
- app/(storefront)/store/orders/page.tsx
- lib/order-status.ts

---

## 🟠 Medium priority issues

1) صفحه جزئیات محصول از سیستم طراحی جداست (رنگ‌ها و تایپوگرافی هاردکد)، باعث شکست هویت بصری برند می‌شود.
- app/(storefront)/store/products/[slug]/page.tsx

2) فیلترهای لیست محصولات ناقص است (state برای category/size/color وجود دارد اما UI ندارد).
- app/(storefront)/store/products/page.tsx

3) مشکلات RTL در فاصله‌گذاری آیکن‌ها (استفاده از ml در جای درست نیست).
- app/(storefront)/store/products/page.tsx
- app/(storefront)/store/cart/page.tsx

4) هم‌پوشانی احتمالی نوار پایین موبایل با نوارهای چسبان Cart/Checkout.
- components/storefront/mobile-bottom-nav.tsx
- app/(storefront)/store/cart/page.tsx

5) انتخاب سایز/رنگ در PDP همگام نیست و می‌تواند کاربر را به وضعیت نامعتبر ببرد.
- app/(storefront)/store/products/[slug]/page.tsx

---

## 🟡 Minor improvements

1) تعریف تکراری و متناقض برای .section-spacing باعث عدم ثبات فاصله‌ها می‌شود.
- app/globals.css

2) کانتینرها یکسان نیستند (page-container / editorial-container / max-w-7xl) و باعث پرش عرضی می‌شوند.
- app/(storefront)/store/page.tsx
- app/(storefront)/store/products/[slug]/page.tsx
- components/ui/page-container.tsx
- app/globals.css

3) کامپوننت‌های ساخته‌شده ولی استفاده‌نشده (debt و ناهماهنگی).
- components/storefront/variant-selector.tsx
- components/storefront/storytelling-section.tsx

4) دکمه‌های آیکن-only بدون aria-label.
- components/storefront/header.tsx
- app/(storefront)/store/products/[slug]/page.tsx

5) لینک شبکه‌های اجتماعی فوتر به # متصل است (خالی).
- components/storefront/footer.tsx

---

## 🟢 Missing features for a clothing store

1) جستجوی سراسری، فیلترهای کامل (برند/سایز/رنگ/جنس/قیمت با اسلایدر)، و مرتب‌سازی.
- app/(storefront)/store/products/page.tsx

2) صفحات سیاست‌ها و خدمات (ارسال، مرجوعی، راهنمای سایز، FAQ، حریم خصوصی، شرایط استفاده).
- components/storefront/footer.tsx

3) ریویو و امتیاز محصول، تصاویر کاربر، پرسش و پاسخ.

4) اطلاعات مد/کالای پوشاک (جنس، فیت، نگهداری، پیشنهاد ست).

5) بنر کمپین‌ها، New In / Best Sellers، و کوپن/پروموشن.

---

## 🎨 Design system improvement suggestions

1) حذف رنگ‌های هاردکد و انتقال به توکن‌ها (استفاده از --primary/--accent/... در همه جا).
- app/(storefront)/store/products/[slug]/page.tsx
- components/storefront/product-card.tsx

2) یکسان‌سازی تایپوگرافی فارسی (scale واحد، وزن‌ها و line-height‌ها ثابت).
- tailwind.config.ts
- app/globals.css

3) یک سیستم فاصله‌گذاری واحد (spacing tokens + section-spacing استاندارد).
- app/globals.css
- components/ui/page-container.tsx

4) استانداردسازی الگوی دکمه‌ها (CTA اصلی/ثانویه/ghost) و عدم ساخت نسخه‌های سفارشی جداگانه.
- components/ui/button.tsx
- app/(storefront)/store/products/[slug]/page.tsx

5) تعریف قرارداد RTL (spacing، align، icon placement) با utilityهای مشخص.

---

## 🧱 Component & layout refactor suggestions

1) شکستن PDP به چند کامپوننت استاندارد (Gallery / Info / VariantSelector / SizeGuide / StickyCTA).
- app/(storefront)/store/products/[slug]/page.tsx
- components/storefront/variant-selector.tsx

2) یک wrapper واحد برای لیست‌ها با SectionHeader و PageContainer.
- app/(storefront)/store/products/page.tsx
- components/ui/section-header.tsx

3) استفاده یکپارچه از StyledCard و حذف Cardهای سفارشی با border-gray-*.
- app/(storefront)/store/products/[slug]/page.tsx
- components/ui/styled-card.tsx

4) یک PriceBlock مشترک برای نمایش قیمت، تخفیف، و واحد پول.
- components/storefront/price.tsx
- lib/utils.ts

5) اتصال واقعی ProductCard به افزودن به سبد/علاقه‌مندی (الان فقط UI است).
- components/storefront/product-card.tsx
- store/cart-store.ts

---

## ⚡ Performance & UX quick wins

1) محدود کردن GSAP به دسکتاپ و استفاده از StorytellingSection به‌جای انیمیشن‌های دستی پراکنده.
- app/(storefront)/store/page.tsx
- components/storefront/storytelling-section.tsx

2) پاکسازی رفرنس‌های GSAP (برای جلوگیری از stacking). 
- app/(storefront)/store/page.tsx

3) بهینه‌سازی تصاویر (priority فقط برای هیرو، sizes دقیق‌تر).
- app/(storefront)/store/products/[slug]/page.tsx
- components/storefront/product-card.tsx

4) حالت loading برای ریدایرکت Checkout (الان صفحه سفید می‌شود).
- app/(storefront)/store/checkout/page.tsx

5) اصلاح منطق استخراج رنگ‌ها در ProductCard (Set روی object باعث تکرار رنگ می‌شود).
- components/storefront/product-card.tsx

---

اگر بخواهی، گام بعدی پیشنهادی:
1) حل ریشه‌ای مشکل Encoding و یکپارچه‌سازی کپی فارسی.
2) بازطراحی PDP و PLP مطابق دیزاین سیستم واحد.
