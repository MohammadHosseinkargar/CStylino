import type { Metadata } from "next"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

export const metadata: Metadata = {
  title: "شرایط استفاده | استایلینو",
  description: "قوانین خرید و استفاده از خدمات استایلینو.",
}

export default function TermsPage() {
  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      <SectionHeader title="شرایط استفاده" subtitle="آخرین به روزرسانی: ۱۴۰۳/۱۰/۰۱" />
      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-7">
        <p>
          با ثبت سفارش در استایلینو، قوانین زیر را می پذیرید. هدف ما ارائه تجربه خرید شفاف و حرفه ای است.
        </p>
        <ul className="list-disc pr-5 space-y-2">
          <li>ثبت سفارش به منزله تایید اطلاعات کالا، قیمت و زمان ارسال است.</li>
          <li>در صورت اتمام موجودی، مبلغ پرداختی به طور کامل بازگردانده می شود.</li>
          <li>استفاده از محتوای سایت بدون اجازه کتبی مجاز نیست.</li>
        </ul>
      </div>
    </PageContainer>
  )
}