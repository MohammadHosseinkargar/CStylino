import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { SectionHeader } from "@/components/ui/section-header"
import { PanelContainer } from "@/components/account/panel-container"
import { PanelCard } from "@/components/account/panel-card"

export default async function CustomerProfilePage() {
  const session = await getServerSession(authOptions)

  const name = session?.user?.name || "ثبت نشده"
  const email = session?.user?.email || "ثبت نشده"

  return (
    <PanelContainer dir="rtl">
      <SectionHeader
        title={
          <h1 className="text-xl font-semibold">پروفایل</h1>
        }
        subtitle="اطلاعات حساب و راه‌های ارتباطی خود را بررسی کنید."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelCard>
          <h3 className="text-base font-semibold mb-4">
            {"اطلاعات حساب"}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">نام</span>
              <span className="font-semibold">{name}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">ایمیل</span>
              <span className="font-semibold">{email}</span>
            </div>
          </div>
        </PanelCard>

        <PanelCard>
          <h3 className="text-base font-semibold mb-4">
            {"اطلاعات تماس"}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">شماره تماس</span>
              <span className="font-semibold">ثبت نشده</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">ایمیل پشتیبانی</span>
              <span className="font-semibold">info@stylino.ir</span>
            </div>
          </div>
        </PanelCard>
      </div>
    </PanelContainer>
  )
}