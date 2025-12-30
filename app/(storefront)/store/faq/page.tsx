import type { Metadata } from "next"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

export const metadata: Metadata = {
  title: "سوالات متداول | استایلینو",
  description: "پاسخ به پرسش های رایج خرید آنلاین از استایلینو.",
}

export default function FaqPage() {
  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      <SectionHeader title="سوالات متداول" subtitle="پاسخ به پرسش های رایج خرید آنلاین" />
      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-7">
        <div>
          <p className="font-semibold text-foreground">چطور سفارشم را پیگیری کنم؟</p>
          <p>از بخش سفارش های من می توانید وضعیت ارسال را مشاهده کنید.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">امکان تعویض یا مرجوعی هست؟</p>
          <p>تا ۷ روز پس از دریافت، با هماهنگی پشتیبانی امکان مرجوعی وجود دارد.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">هزینه ارسال چگونه محاسبه می شود؟</p>
          <p>هزینه ارسال در مرحله پرداخت نمایش داده می شود و به صورت شفاف اعلام می گردد.</p>
        </div>
      </div>
    </PageContainer>
  )
}