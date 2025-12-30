import type { Metadata } from "next"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

export const metadata: Metadata = {
  title: "ارسال و مرجوعی | استایلینو",
  description: "جزئیات ارسال، مرجوعی و زمان بندی تحویل سفارش ها.",
}

export default function ShippingPage() {
  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      <SectionHeader title="ارسال و مرجوعی" subtitle="زمان بندی ارسال و قوانین مرجوعی" />
      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-7">
        <p>سفارش ها پس از پردازش، با بسته بندی مناسب برای شما ارسال می شوند.</p>
        <ul className="list-disc pr-5 space-y-2">
          <li>تهران: تحویل بین ۱ تا ۲ روز کاری</li>
          <li>شهرستان: تحویل بین ۳ تا ۵ روز کاری</li>
          <li>مرجوعی تا ۷ روز پس از تحویل با حفظ شرایط کالا امکان پذیر است.</li>
        </ul>
      </div>
    </PageContainer>
  )
}