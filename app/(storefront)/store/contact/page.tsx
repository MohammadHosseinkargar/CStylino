import { CardContent } from "@/components/ui/card"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"

export default function ContactPage() {
  return (
    <PageContainer className="py-12" dir="rtl">
      <SectionHeader title="تماس با ما" />
      <div className="max-w-2xl mt-8">
        <StyledCard variant="elevated">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">ایمیل</h3>
                <p className="text-muted-foreground">info@stylino.ir</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">تلفن</h3>
                <p className="text-muted-foreground">021-12345678</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">آدرس</h3>
                <p className="text-muted-foreground">تهران، خیابان ولیعصر</p>
              </div>
            </div>
          </CardContent>
        </StyledCard>
      </div>
    </PageContainer>
  )
}
