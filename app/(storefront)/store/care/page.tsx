import type { Metadata } from "next"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

export const metadata: Metadata = {
  title: "نگهداری لباس | استایلینو",
  description: "راهنمای نگهداری صحیح پوشاک برای ماندگاری بیشتر.",
}

export default function CarePage() {
  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      <SectionHeader title="نگهداری لباس" subtitle="نکات مراقبت از پوشاک" />
      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-7">
        <p>با رعایت نکات ساده، دوام لباس ها را بیشتر کنید و ظاهرشان را تازه نگه دارید.</p>
        <ul className="list-disc pr-5 space-y-2">
          <li>شستشو با آب سرد یا ولرم و شوینده ملایم انجام شود.</li>
          <li>از خشک کن با دمای بالا برای پارچه های حساس استفاده نکنید.</li>
          <li>برای اتو از دمای مناسب جنس پارچه استفاده کنید.</li>
        </ul>
      </div>
    </PageContainer>
  )
}