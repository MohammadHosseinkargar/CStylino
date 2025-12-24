import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

export default function AboutPage() {
  return (
    <PageContainer className="py-12" dir="rtl">
      <SectionHeader title="درباره استایلینو" />
      <div className="prose max-w-none mt-8">
        <p className="text-lg text-muted-foreground mb-4">
          استایلینو با هدف ارائه بهترین تجربه خرید آنلاین پوشاک زنانه در ایران تأسیس شد. ما به کیفیت، زیبایی و رضایت مشتریان خود متعهد هستیم و همواره در تلاشیم تا جدیدترین مدهای روز را با قیمتی مناسب در اختیار شما قرار دهیم.
        </p>
        <p className="text-lg text-muted-foreground">
          تیم ما متشکل از متخصصان مد و پوشاک است که با دقت فراوان محصولات را انتخاب می‌کنند تا شما بتوانید با اطمینان خاطر خرید کنید و از استایل خود لذت ببرید.
        </p>
      </div>
    </PageContainer>
  )
}
