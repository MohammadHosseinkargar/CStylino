"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart-store"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkoutSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Price } from "@/components/storefront/price"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2, MapPin, Phone, User } from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotal } = useCartStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [shippingCost, setShippingCost] = useState<number | null>(null)

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

  useEffect(() => {
    let isMounted = true

    const loadShippingCost = async () => {
      try {
        const response = await fetch("/api/settings/public")
        if (!response.ok) {
          throw new Error("Failed to load shipping cost")
        }
        const data = await response.json()
        if (isMounted) {
          const parsed = Number(data.flatShippingCost)
          setShippingCost(Number.isFinite(parsed) ? parsed : 0)
        }
      } catch (error) {
        if (isMounted) {
          setShippingCost(null)
        }
      }
    }

    loadShippingCost()

    return () => {
      isMounted = false
    }
  }, [])

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
        throw new Error(error.error || "خطا در دریافت درگاه پرداخت")
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

  const itemsTotal = getTotal()
  const total = shippingCost === null ? null : itemsTotal + shippingCost

  return (
    <PageContainer className="py-8 md:py-12 lg:py-16" dir="rtl">
      <SectionHeader
        title="ثبت سفارش"
        subtitle="لطفاً اطلاعات خود را وارد کنید تا سفارش شما در سریع‌ترین زمان ممکن پردازش شود."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <StyledCard variant="elevated" className="border-border/40">
            <CardHeader className="pb-6">
              <CardTitle className="text-title flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                اطلاعات تماس
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="customerName" className="mb-3 block text-sm font-semibold">
                    نام و نام خانوادگی
                  </Label>
                  <Input
                    id="customerName"
                    {...register("customerName")}
                    placeholder="نام و نام خانوادگی"
                    className={cn(
                      "h-12",
                      errors.customerName &&
                        "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive bg-destructive/5"
                    )}
                  />
                  {errors.customerName && (
                    <p className="text-xs font-medium text-destructive mt-2">
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
                    className={cn(
                      "h-12 persian-number",
                      errors.shippingPhone &&
                        "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive bg-destructive/5"
                    )}
                  />
                  {errors.shippingPhone && (
                    <p className="text-xs font-medium text-destructive mt-2">
                      {errors.shippingPhone.message as string}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </StyledCard>

          <StyledCard variant="elevated" className="border-border/40">
            <CardHeader className="pb-6">
              <CardTitle className="text-title flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                آدرس ارسال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="shippingProvince" className="mb-3 block text-sm font-semibold">
                      استان
                    </Label>
                    <Input
                      id="shippingProvince"
                      {...register("shippingProvince")}
                      placeholder="استان"
                      className={cn(
                        "h-12",
                        errors.shippingProvince &&
                          "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive bg-destructive/5"
                      )}
                    />
                    {errors.shippingProvince && (
                      <p className="text-xs font-medium text-destructive mt-2">
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
                      placeholder="شهر"
                      className={cn(
                        "h-12",
                        errors.shippingCity &&
                          "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive bg-destructive/5"
                      )}
                    />
                    {errors.shippingCity && (
                      <p className="text-xs font-medium text-destructive mt-2">
                        {errors.shippingCity.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingAddress" className="mb-3 block text-sm font-semibold">
                    آدرس دقیق
                  </Label>
                  <Input
                    id="shippingAddress"
                    {...register("shippingAddress")}
                    placeholder="خیابان، کوچه، پلاک، واحد"
                    className={cn(
                      "h-12",
                      errors.shippingAddress &&
                        "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive bg-destructive/5"
                    )}
                  />
                  {errors.shippingAddress && (
                    <p className="text-xs font-medium text-destructive mt-2">
                      {errors.shippingAddress.message as string}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="shippingPostalCode" className="mb-3 block text-sm font-semibold">
                      کد پستی
                    </Label>
                    <Input
                      id="shippingPostalCode"
                      {...register("shippingPostalCode")}
                      placeholder="1234567890"
                      className={cn(
                        "h-12 persian-number",
                        errors.shippingPostalCode &&
                          "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive bg-destructive/5"
                      )}
                    />
                    {errors.shippingPostalCode && (
                      <p className="text-xs font-medium text-destructive mt-2">
                        {errors.shippingPostalCode.message as string}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end text-xs text-muted-foreground">
                    کد پستی: ۱۰ رقم (بدون خط تیره)
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="mb-3 block text-sm font-semibold">
                    توضیحات سفارش (اختیاری)
                  </Label>
                  <textarea
                    id="notes"
                    {...register("notes")}
                    className={cn(
                      "w-full px-5 py-4 border-2 border-input bg-background rounded-xl min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:border-primary/50 transition-all duration-300 resize-none focus-editorial",
                      errors.notes &&
                        "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive bg-destructive/5"
                    )}
                    placeholder="توضیحات خاصی اگر دارید بنویسید..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full btn-editorial h-14 text-base"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
                  پرداخت و تکمیل خرید
                </Button>
                <p className="text-xs text-muted-foreground">روش پرداخت: درگاه امن</p>
              </form>
            </CardContent>
          </StyledCard>
        </div>

        <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
          <StyledCard variant="subtle" className="border-border/40">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-base md:text-title">خلاصه سفارش</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
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
                    {shippingCost === null
                      ? "..."
                      : `${shippingCost.toLocaleString("fa-IR")} تومان`}
                  </span>
                </div>
              </div>
              <div className="border-t border-border/50 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-subtitle font-bold">مبلغ قابل پرداخت:</span>
                  {total === null ? (
                    <span className="font-semibold persian-number">...</span>
                  ) : (
                    <Price price={total} size="lg" />
                  )}
                </div>
              </div>
            </CardContent>
          </StyledCard>
        </div>
      </div>
    </PageContainer>
  )
}
