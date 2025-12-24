import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="container py-12" dir="rtl">
      <h1 className="text-4xl font-bold mb-8">تماس با ما</h1>
      <div className="max-w-2xl">
        <Card>
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
                <p className="text-muted-foreground">تهران، خیابان نمونه</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

