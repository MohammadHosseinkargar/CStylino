# راهنمای یکپارچه‌سازی زرین‌پال

## ✅ پیاده‌سازی کامل با REST API مستقیم

این پروژه **بدون استفاده از SDK** و مستقیماً از REST API زرین‌پال استفاده می‌کند.

## 🔧 تنظیمات

### متغیرهای محیطی

```env
ZARINPAL_MERCHANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ZARINPAL_BASE_URL="https://api.zarinpal.com/pg/v4/payment"
ZARINPAL_CALLBACK_URL="http://localhost:3000/api/payment/verify"
```

### نکات مهم

- ❌ **هیچ SDK یا پکیج npm برای زرین‌پال نصب نشده است**
- ✅ تمام درخواست‌ها از سمت سرور (Route Handlers) انجام می‌شود
- ✅ Merchant ID فقط در متغیرهای محیطی است و به کلاینت ارسال نمی‌شود
- ✅ تایید پرداخت idempotent است (می‌تواند چند بار فراخوانی شود)

## 📋 جریان پرداخت

### 1. ایجاد سفارش

```typescript
POST /api/orders
{
  items: [...],
  shippingData: {...}
}
```

سفارش با status = `pending` ایجاد می‌شود.

### 2. درخواست پرداخت

```typescript
POST /api/payment/request
{
  orderId: "order-id"
}
```

سرور:
1. سفارش را پیدا می‌کند
2. درخواست پرداخت از زرین‌پال می‌گیرد
3. Authority را در دیتابیس ذخیره می‌کند
4. URL درگاه پرداخت را برمی‌گرداند

### 3. هدایت به درگاه

کلاینت کاربر را به این URL هدایت می‌کند:
```
https://www.zarinpal.com/pg/StartPay/{authority}
```

### 4. Callback از زرین‌پال

زرین‌پال کاربر را به این URL برمی‌گرداند:
```
/api/payment/verify?Authority={authority}&Status=OK&orderId={orderId}
```

### 5. تایید پرداخت

Route Handler `/api/payment/verify`:
1. Authority و orderId را بررسی می‌کند
2. اگر Status !== "OK" → سفارش را canceled می‌کند
3. اگر سفارش قبلاً پردازش شده → idempotent check
4. درخواست تایید به زرین‌پال می‌فرستد
5. اگر code === 100 یا 101:
   - سفارش را به `processing` تغییر می‌دهد
   - RefID را ذخیره می‌کند
   - کمیسیون‌های همکاران را ایجاد می‌کند (pending)
6. کاربر را به صفحه success/failed هدایت می‌کند

## 💰 سیستم کمیسیون

### زمان ایجاد کمیسیون

کمیسیون‌ها **بعد از تایید موفق پرداخت** ایجاد می‌شوند:

```typescript
// در app/api/payment/verify/route.ts
if (verificationResult.success) {
  // Update order status
  await prisma.order.update({...})
  
  // Create commissions
  if (order.refAffiliateId) {
    await createCommissionsForOrder(order.id)
  }
}
```

### وضعیت کمیسیون‌ها

- **pending**: در انتظار تحویل سفارش
- **available**: قابل برداشت (وقتی order.status = delivered)
- **paid**: پرداخت شده
- **void**: باطل شده (وقتی order.status = canceled/refunded)

### سطوح کمیسیون

- **Level 1 (10%)**: همکار مستقیم که سفارش را معرفی کرده
- **Level 2 (5%)**: همکار والد (parent affiliate) همکار مستقیم

## 🔒 امنیت

### Idempotent Verification

تایید پرداخت idempotent است:

```typescript
// Check if already processed
if (order.status !== OrderStatus.pending) {
  if (order.status === OrderStatus.processing) {
    // Already verified, redirect to success
    return redirect('/store/payment/success')
  }
  // Otherwise redirect to failed
}
```

### جلوگیری از Double Verification

```typescript
// Check if commissions already exist
const existingCommissions = await prisma.commission.findMany({
  where: { orderId: order.id },
})

if (existingCommissions.length > 0) {
  return // Skip creation
}
```

## 🐛 مدیریت خطا

### کدهای خطای زرین‌پال

- **100**: موفق
- **101**: قبلاً تایید شده (idempotent)
- **-9**: خطای اعتبارسنجی
- **-10**: Merchant ID نامعتبر
- **-11**: درخواست نامعتبر
- **-12**: درخواست تکراری

### Error Handling

```typescript
try {
  const result = await zarinpalVerify({...})
  if (!result.success) {
    // Log error
    console.error("Verification failed:", result.error)
    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.canceled },
    })
  }
} catch (error) {
  // Handle network/server errors
}
```

## 📝 تست

### Sandbox Mode

برای تست از Merchant ID تست استفاده کنید:
- Merchant ID تست: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- در sandbox، پرداخت‌ها واقعی نیستند

### Production

1. Merchant ID واقعی را از پنل زرین‌پال دریافت کنید
2. در `.env` تنظیم کنید
3. Callback URL را در پنل زرین‌پال تنظیم کنید
4. تست کنید

## ✅ Checklist

- [x] حذف SDK زرین‌پال از package.json
- [x] پیاده‌سازی REST API مستقیم
- [x] Route Handler برای درخواست پرداخت
- [x] Route Handler برای تایید پرداخت
- [x] Idempotent verification
- [x] ایجاد کمیسیون بعد از تایید پرداخت
- [x] مدیریت خطا
- [x] مستندات

## 📚 منابع

- [مستندات API زرین‌پال](https://docs.zarinpal.com/)
- [پنل زرین‌پال](https://www.zarinpal.com)

