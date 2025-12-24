import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"

export default async function AdminAffiliatesPage() {
  const affiliates = await prisma.user.findMany({
    where: {
      role: "affiliate",
    },
    include: {
      _count: {
        select: {
          referredOrdersAsAffiliate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const commissions = await prisma.commission.findMany({
    where: {
      affiliate: {
        role: "affiliate",
      },
    },
    include: {
      affiliate: {
        select: { name: true, email: true },
      },
    },
  })

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">همکاران</h1>
        <p className="text-muted-foreground">مدیریت سیستم همکاری در فروش</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>لیست همکاران</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates.length > 0 ? (
              <div className="space-y-4">
                {affiliates.map((affiliate) => (
                  <div
                    key={affiliate.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/40 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">{affiliate.name || affiliate.email}</div>
                      <div className="text-sm text-muted-foreground">
                        کد: {affiliate.affiliateCode} • {affiliate._count.referredOrdersAsAffiliate} فروش
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                هنوز همکاری ثبت نشده است
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>کمیسیون‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length > 0 ? (
              <div className="space-y-4">
                {commissions.slice(0, 10).map((commission) => (
                  <div
                    key={commission.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/40 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {commission.affiliate.name || commission.affiliate.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        سطح {commission.level} • {formatDate(commission.createdAt)}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{formatPrice(commission.amount)}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {commission.status === "pending" && "در انتظار"}
                        {commission.status === "available" && "در دسترس"}
                        {commission.status === "paid" && "پرداخت شده"}
                        {commission.status === "void" && "باطل شده"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                هنوز کمیسیونی ثبت نشده است
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

