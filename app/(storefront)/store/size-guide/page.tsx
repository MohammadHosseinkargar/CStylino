import type { Metadata } from "next"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

export const metadata: Metadata = {
  title: "راهنمای سایز | استایلینو",
  description: "راهنمای انتخاب سایز مناسب برای خرید پوشاک استایلینو.",
}

export default function SizeGuidePage() {
  return (
    <PageContainer className="py-12 md:py-20" dir="rtl">
      <SectionHeader title="راهنمای سایز" subtitle="راهنمای انتخاب سایز مناسب" />
      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-7">
        <p>برای انتخاب سایز دقیق، اندازه های خود را با جدول راهنما مقایسه کنید.</p>
        <ul className="list-disc pr-5 space-y-2">
          <li>اندازه ها بر اساس سانتی متر هستند.</li>
          <li>در صورت تردید، سایز بزرگ تر را انتخاب کنید.</li>
        </ul>
      </div>
    </PageContainer>
  )
}