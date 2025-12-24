"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"

export default function AffiliateSettingsPage() {
  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">تنظیمات</h1>
        <p className="text-muted-foreground">تنظیمات پنل همکاری</p>
      </div>

      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            تنظیمات حساب کاربری
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="bankAccount">شماره حساب بانکی</Label>
            <Input
              id="bankAccount"
              type="text"
              placeholder="برای دریافت پرداخت‌ها"
              className="persian-number"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="shaba">شماره شبا</Label>
            <Input
              id="shaba"
              type="text"
              placeholder="IR..."
              className="persian-number"
            />
          </div>
          <Button className="btn-editorial w-full">ذخیره تغییرات</Button>
        </CardContent>
      </Card>
    </div>
  )
}

