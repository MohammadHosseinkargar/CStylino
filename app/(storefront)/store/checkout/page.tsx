"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart-store"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkoutSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Price } from "@/components/storefront/price"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MapPin, Phone, User } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotal } = useCartStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/store/checkout")
    }
    if (items.length === 0) {
      router.push("/store/cart")
    }
  }, [session, items.length, router])

  useEffect(() => {
    if (session?.user?.name) {
      setValue("customerName", session.user.name)
    }
  }, [session, setValue])

  if (!session || items.length === 0) {
    return null
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingData: data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "خطا در ثبت سفارش")
      }

      const { order } = await response.json()

      const paymentResponse = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json()
        throw new Error(error.error || "خطا در ایجاد درخواست پرداخت")
      }

      const { url } = await paymentResponse.json()
      window.location.href = url
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ثبت سفارش",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const shippingCost = Number(process.env.NEXT_PUBLIC_FLAT_SHIPPING_COST ?? 50000)
  const itemsTotal = getTotal()
  const total = itemsTotal + shippingCost

  return (
    <div className="editorial-container py-8 md:py-12 lg:py-20 px-4 md:px-0" dir="rtl">
      <div className="mb-8 md:mb-16">
        <h1 className="text-2xl md:text-hero font-bold mb-3 md:mb-4">ثبت سفارش</h1>
        <p className="text-sm md:text-body text-muted-foreground leading-relaxed">
          لطفا اطلاعات خود و آدرس ارسال را تکمیل کنید تا به درگاه پرداخت هدایت شوید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-editorial border-border/40">
            <CardHeader className="pb-6">
              <CardTitle className="text-title flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                اطلاعات مشتری
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName" className="mb-3 block text-sm font-semibold">
                    نام و نام خانوادگی
                  </Label>
                  <Input
                    id="customerName"
                    {...register("customerName")}
                    placeholder="نام و نام خانوادگی"
                    className="h-12"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.customerName.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="shippingPhone" className="mb-3 block text-sm font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    شماره موبایل
                  </Label>
                  <Input
                    id="shippingPhone"
                    {...register("shippingPhone")}
                    placeholder="09123456789"
                    className="h-12 persian-number"
                  />
                  {errors.shippingPhone && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.shippingPhone.message as string}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-editorial border-border/40">
            <CardHeader className="pb-6">
              <CardTitle className="text-title flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                آدرس ارسال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingProvince" className="mb-3 block text-sm font-semibold">
                      استان
                    </Label>
                    <Input
                      id="shippingProvince"
                      {...register("shippingProvince")}
                      placeholder="تهران"
                      className="h-12"
                    />
                    {errors.shippingProvince && (
                      <p className="text-sm text-destructive mt-2">
                        {errors.shippingProvince.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="shippingCity" className="mb-3 block text-sm font-semibold">
                      شهر
                    </Label>
                    <Input
                      id="shippingCity"
                      {...register("shippingCity")}
                      placeholder="تهران"
                      className="h-12"
                    />
                    {errors.shippingCity && (
                      <p className="text-sm text-destructive mt-2">
                        {errors.shippingCity.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingAddress" className="mb-3 block text-sm font-semibold">
                    آدرس کامل
                  </Label>
                  <Input
                    id="shippingAddress"
                    {...register("shippingAddress")}
                    placeholder="خیابان، کوچه، پلاک، واحد"
                    className="h-12"
                  />
                  {errors.shippingAddress && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.shippingAddress.message as string}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingPostalCode" className="mb-3 block text-sm font-semibold">
                      کد پستی
                    </Label>
                    <Input
                      id="shippingPostalCode"
                      {...register("shippingPostalCode")}
                      placeholder="1234567890"
                      className="h-12 persian-number"
                    />
                  </div>
                  <div className="flex items-end text-xs text-muted-foreground">
                    روش ارسال: پست پیشتاز (هزینه ثابت)
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="mb-3 block text-sm font-semibold">
                    توضیحات سفارش (اختیاری)
                  </Label>
                  <textarea
                    id="notes"
                    {...register("notes")}
                    className="w-full px-5 py-4 border-2 border-input bg-background rounded-xl min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:border-primary/50 transition-all duration-300 resize-none focus-editorial"
                    placeholder="توضیحات مورد نیاز برای سفارش..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full btn-editorial h-14 text-base"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
                  پرداخت و تمام!
                </Button>
                <p className="text-xs text-muted-foreground">
                  روش پرداخت: زرین پال
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
          <Card className="card-editorial border-border/40">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-base md:text-title">خلاصه سفارش</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 pb-6 border-b border-border/50">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-body">
                    <span className="text-muted-foreground line-clamp-1">
                      {item.productName} - {item.quantity}
                    </span>
                    <span className="font-semibold persian-number">
                      {(item.price * item.quantity).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">جمع محصولات:</span>
                  <span className="font-semibold persian-number">
                    {itemsTotal.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">هزینه ارسال:</span>
                  <span className="font-semibold persian-number">
                    {shippingCost.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>
              <div className="border-t border-border/50 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-subtitle font-bold">مبلغ نهایی:</span>
                  <Price price={total} size="lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
