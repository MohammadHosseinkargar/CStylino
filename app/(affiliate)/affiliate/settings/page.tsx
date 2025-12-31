import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"

export default function AffiliateSettingsPage() {
  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader title="تنظیمات" subtitle="اطلاعات تسویه حساب همکاری" />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            اطلاعات بانکی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="bankAccount">شماره حساب یا کارت</Label>
            <Input
              id="bankAccount"
              type="text"
              placeholder="شماره کارت یا حساب بانکی"
              className="persian-number"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="shaba">شماره شبا</Label>
            <Input id="shaba" type="text" placeholder="IR..." className="persian-number" />
          </div>
          <Button className="btn-editorial w-full">ذخیره اطلاعات</Button>
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
