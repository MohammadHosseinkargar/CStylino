import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("لطفاً ایمیل معتبری وارد کنید."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
})

export const signUpSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف داشته باشد."),
  email: z.string().email("لطفاً ایمیل معتبری وارد کنید."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
  phone: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, "نام محصول نمی‌تواند خالی باشد."),
  nameEn: z.string().optional(),
  slug: z.string().min(1, "شناسه یکتا (slug) نمی‌تواند خالی باشد."),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  basePrice: z.number().int().positive("قیمت پایه باید عددی مثبت باشد."),
  categoryId: z.string().min(1, "دسته‌بندی باید مشخص شده باشد."),
  images: z.array(z.string().url()).min(1, "حداقل یک تصویر معتبر برای محصول انتخاب کنید."),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
})

export const variantSchema = z.object({
  size: z.string().min(1, "سایز محصول مشخص نشده است."),
  color: z.string().min(1, "رنگ محصول مشخص نیست."),
  colorHex: z.string().regex(/^#[0-9A-F]{6}$/i, "لطفاً یک کد رنگ معتبر وارد کنید."),
  stock: z.number().int().min(0, "موجودی نمی‌تواند منفی باشد."),
  sku: z.string().min(1, "SKU باید وارد شود."),
  priceOverride: z.number().int().positive().optional(),
})

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "نام گیرنده باید حداقل ۲ حرف داشته باشد."),
  shippingPhone: z.string().min(10, "شماره همراه وارد شده معتبر نیست."),
  shippingProvince: z.string().min(1, "استان ارسال باید انتخاب شود."),
  shippingCity: z.string().min(1, "شهر ارسال باید مشخص شود."),
  shippingAddress: z.string().min(10, "آدرس ارسال باید حداقل ۱۰ کاراکتر داشته باشد."),
  shippingPostalCode: z.string().optional(),
  notes: z.string().optional(),
})

export const commissionSettingsSchema = z.object({
  level1Percentage: z.number().int().min(0).max(100),
  level2Percentage: z.number().int().min(0).max(100),
})

export const payoutRequestSchema = z.object({
  amount: z.number().int().positive("مبلغ باید عددی مثبت باشد."),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
})

export const adminSettingsSchema = z.object({
  flatShippingCost: z.coerce
    .number({
      required_error: "هزینه ارسال باید وارد شود.",
      invalid_type_error: "هزینه ارسال باید عددی باشد.",
    })
    .int("هزینه ارسال باید عددی صحیح باشد.")
    .min(0, "هزینه ارسال نمی‌تواند منفی باشد."),
  commissionLevel1Percent: z.coerce
    .number({
      required_error: "درصد کمیسیون سطح اول ضروری است.",
      invalid_type_error: "درصد کمیسیون سطح اول باید عددی باشد.",
    })
    .int("درصد کمیسیون سطح اول باید عددی صحیح باشد.")
    .min(0, "درصد کمیسیون سطح اول نمی‌تواند منفی باشد.")
    .max(100, "درصد کمیسیون سطح اول نمی‌تواند بیش از ۱۰۰ باشد."),
  commissionLevel2Percent: z.coerce
    .number({
      required_error: "درصد کمیسیون سطح دوم ضروری است.",
      invalid_type_error: "درصد کمیسیون سطح دوم باید عددی باشد.",
    })
    .int("درصد کمیسیون سطح دوم باید عددی صحیح باشد.")
    .min(0, "درصد کمیسیون سطح دوم نمی‌تواند منفی باشد.")
    .max(100, "درصد کمیسیون سطح دوم نمی‌تواند بیش از ۱۰۰ باشد."),
})
