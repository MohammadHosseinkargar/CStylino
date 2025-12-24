import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function AdminSettingsPage() {
  const settings = await prisma.settings.findFirst()

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">تنظیمات</h1>
        <p className="text-muted-foreground">تنظیمات عمومی سیستم</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>تنظیمات کمیسیون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="level1Commission">کمیسیون سطح ۱ (درصد)</Label>
              <Input
                id="level1Commission"
                type="number"
                defaultValue={settings?.level1CommissionPercent || 10}
                className="persian-number"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="level2Commission">کمیسیون سطح ۲ (درصد)</Label>
              <Input
                id="level2Commission"
                type="number"
                defaultValue={settings?.level2CommissionPercent || 5}
                className="persian-number"
              />
            </div>
            <Button className="btn-editorial w-full">ذخیره تغییرات</Button>
          </CardContent>
        </Card>

        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>تنظیمات ارسال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="shippingCost">هزینه ارسال (تومان)</Label>
              <Input
                id="shippingCost"
                type="number"
                defaultValue={settings?.flatShippingCost || 50000}
                className="persian-number"
              />
            </div>
            <Button className="btn-editorial w-full">ذخیره تغییرات</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

