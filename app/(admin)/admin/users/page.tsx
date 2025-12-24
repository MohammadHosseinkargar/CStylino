import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">کاربران</h1>
        <p className="text-muted-foreground">مدیریت کاربران سیستم</p>
      </div>

      <Card className="card-editorial">
        <CardHeader>
          <CardTitle>لیست کاربران</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/40 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{user.name || "بدون نام"}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • {formatDate(user.createdAt)}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                      {user.role === "admin" && "مدیر"}
                      {user.role === "affiliate" && "همکار"}
                      {user.role === "customer" && "مشتری"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              هنوز کاربری ثبت نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

