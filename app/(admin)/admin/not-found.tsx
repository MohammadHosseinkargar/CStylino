import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
      <Card className="card-editorial max-w-md">
        <CardContent className="p-12 text-center">
          <h1 className="text-hero font-bold mb-4">صفحه پیدا نشد</h1>
          <p className="text-body text-muted-foreground mb-8 leading-relaxed">
            صفحه ای که دنبالش هستید وجود ندارد یا حذف شده است.
          </p>
          <Link href="/admin">
            <Button className="btn-editorial">
              <ArrowLeft className="w-5 h-5 ml-2" />
              بازگشت به داشبورد
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
