import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
})

export const signUpSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد."),
  email: z.string().email("ایمیل معتبر وارد کنید."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
  phone: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است."),
  nameEn: z.string().optional(),
  slug: z.string().min(1, "اسلاگ محصول الزامی است."),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  basePrice: z.number().int().positive("قیمت باید عدد مثبت باشد."),
  categoryId: z.string().min(1, "دسته بندی الزامی است."),
  images: z
    .array(
      z.string().refine((value) => {
        const trimmed = value.trim()
        if (!trimmed) return false
        if (/^https?:\/\//i.test(trimmed)) return true
        if (/^file:\/\//i.test(trimmed)) return false
        if (/^blob:/i.test(trimmed)) return false
        if (/^[a-zA-Z]:[\\/]/.test(trimmed)) return false
        if (trimmed.startsWith("//")) return false
        return trimmed.startsWith("/")
      }, "Invalid url")
    )
    .min(1, "????? ?? ????? ????? ???? ???."),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
})

export const variantSchema = z.object({
  size: z.string().min(1, "سایز الزامی است."),
  color: z.string().min(1, "رنگ الزامی است."),
  colorHex: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "کد رنگ معتبر نیست."),
  stockOnHand: z.number().int().min(0, "موجودی نمی تواند منفی باشد."),
  sku: z.string().min(1, "کد SKU الزامی است."),
  priceOverride: z.number().int().positive().optional(),
})

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "نام مشتری الزامی است."),
  shippingPhone: z.string().min(10, "شماره تماس معتبر نیست."),
  shippingProvince: z.string().min(1, "استان الزامی است."),
  shippingCity: z.string().min(1, "شهر الزامی است."),
  shippingAddress: z.string().min(10, "آدرس کامل الزامی است."),
  shippingPostalCode: z.string().optional(),
  notes: z.string().optional(),
})

export const commissionSettingsSchema = z.object({
  level1Percentage: z.number().int().min(0).max(100),
  level2Percentage: z.number().int().min(0).max(100),
})

export const payoutRequestSchema = z.object({
  amount: z.number().int().positive("مبلغ باید عدد مثبت باشد."),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
})

export const adminSettingsSchema = z.object({
  flatShippingCost: z.coerce
    .number({
      required_error: "هزینه ارسال الزامی است.",
      invalid_type_error: "هزینه ارسال معتبر نیست.",
    })
    .int("هزینه ارسال باید عدد صحیح باشد.")
    .min(0, "هزینه ارسال نمی تواند منفی باشد."),
  commissionLevel1Percent: z.coerce
    .number({
      required_error: "درصد سطح ۱ الزامی است.",
      invalid_type_error: "درصد سطح ۱ معتبر نیست.",
    })
    .int("درصد سطح ۱ باید عدد صحیح باشد.")
    .min(0, "درصد سطح ۱ نمی تواند منفی باشد.")
    .max(100, "درصد سطح ۱ باید بین ۰ تا ۱۰۰ باشد."),
  commissionLevel2Percent: z.coerce
    .number({
      required_error: "درصد سطح ۲ الزامی است.",
      invalid_type_error: "درصد سطح ۲ معتبر نیست.",
    })
    .int("درصد سطح ۲ باید عدد صحیح باشد.")
    .min(0, "درصد سطح ۲ نمی تواند منفی باشد.")
    .max(100, "درصد سطح ۲ باید بین ۰ تا ۱۰۰ باشد."),
})

const iranShebaRegex = /^IR[0-9]{24}$/i

export const affiliateBankInfoSchema = z.object({
  bankShaba: z
    .string()
    .min(1, "شماره شبا الزامی است.")
    .regex(iranShebaRegex, "شماره شبا معتبر نیست. مثال: IR123456789012345678901234"),
  bankCard: z.string().min(1, "شماره کارت الزامی است."),
  bankAccount: z.string().min(1, "شماره حساب الزامی است."),
})
