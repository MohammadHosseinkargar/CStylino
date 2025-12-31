"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Surface } from "@/components/ui/surface"
import { Button } from "@/components/ui/button"

interface ProductTabsProps {
  description?: string
  sizes: string[]
  colors: string[]
}

export function ProductTabs({ description, sizes, colors }: ProductTabsProps) {
  const specItems = [
    { label: "سایزبندی", value: sizes.length ? sizes.join("، ") : "نامشخص" },
    { label: "رنگ‌بندی", value: colors.length ? colors.join("، ") : "نامشخص" },
    { label: "جنس و متریال", value: "پارچه باکیفیت با بافت لطیف و دوام بالا." },
    { label: "راهنمای نگهداری", value: "شست‌وشو با آب سرد و شوینده ملایم؛ از خشک‌کن استفاده نشود." },
  ]

  const shippingItems = [
    "ارسال سریع با بسته‌بندی ایمن و شکیل.",
    "امکان تعویض سایز تا ۷ روز پس از دریافت.",
    "بازگشت کالا مطابق شرایط بهداشت و سلامت محصول.",
  ]

  const renderDescription = (
    <Surface className="p-6 md:p-8">
      <p className="text-body text-muted-foreground leading-relaxed">
        {description || "برای این محصول توضیحی ثبت نشده است."}
      </p>
    </Surface>
  )

  const renderSpecs = (
    <Surface className="p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        {specItems.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="text-xs font-semibold text-muted-foreground">{item.label}</div>
            <div className="text-sm text-foreground leading-relaxed">{item.value}</div>
          </div>
        ))}
      </div>
    </Surface>
  )

  const renderShipping = (
    <Surface className="p-6 md:p-8">
      <ul className="space-y-3 text-sm text-muted-foreground">
        {shippingItems.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant="link" className="mt-4 px-0 text-primary">
        <Link href="/store/shipping">جزئیات ارسال و بازگشت</Link>
      </Button>
    </Surface>
  )

  const renderReviews = (
    <Surface className="p-6 md:p-8">
      <p className="text-sm text-muted-foreground leading-relaxed">
        نظر شما پس از خرید نمایش داده می‌شود و به انتخاب بهتر دیگران کمک می‌کند.
      </p>
      <Button asChild variant="link" className="mt-4 px-0 text-primary">
        <Link href="#reviews">ثبت نظر</Link>
      </Button>
    </Surface>
  )

  return (
    <div>
      <div className="hidden lg:block">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/30">
            <TabsTrigger value="description">توضیحات</TabsTrigger>
            <TabsTrigger value="specs">مشخصات</TabsTrigger>
            <TabsTrigger value="shipping">ارسال و بازگشت</TabsTrigger>
            <TabsTrigger value="reviews">نقد و بررسی</TabsTrigger>
          </TabsList>
          <TabsContent value="description">{renderDescription}</TabsContent>
          <TabsContent value="specs">{renderSpecs}</TabsContent>
          <TabsContent value="shipping">{renderShipping}</TabsContent>
          <TabsContent value="reviews">{renderReviews}</TabsContent>
        </Tabs>
      </div>

      <div className="lg:hidden">
        <Accordion type="single" collapsible defaultValue="description">
          <AccordionItem value="description">
            <AccordionTrigger>توضیحات</AccordionTrigger>
            <AccordionContent>{renderDescription}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="specs">
            <AccordionTrigger>مشخصات</AccordionTrigger>
            <AccordionContent>{renderSpecs}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>ارسال و بازگشت</AccordionTrigger>
            <AccordionContent>{renderShipping}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="reviews">
            <AccordionTrigger>نقد و بررسی</AccordionTrigger>
            <AccordionContent>{renderReviews}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
