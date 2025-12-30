import type { Metadata } from "next"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

export const metadata: Metadata = {
  title: "حریم خصوصی | استایلینو",
  description: "نحوه جمع آوری و حفاظت از اطلاعات شخصی کاربران در استایلینو.",
}

export default function PrivacyPage() {
  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      <SectionHeader title="حریم خصوصی" subtitle="حفظ امنیت و اطلاعات شخصی شما" />
      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-7">
        <p>
          اطلاعات شما فقط برای پردازش سفارش و بهبود تجربه خرید استفاده می شود و در اختیار شخص ثالث قرار نمی گیرد.
        </p>
        <ul className="list-disc pr-5 space-y-2">
          <li>اطلاعات تماس صرفا برای اطلاع رسانی وضعیت سفارش استفاده می شود.</li>
          <li>پرداخت ها از طریق درگاه امن بانکی انجام می شود.</li>
        </ul>
      </div>
    </PageContainer>
  )
}