"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { VariantSelector } from "@/components/storefront/variant-selector"
import { Price } from "@/components/storefront/price"
import { useCartStore } from "@/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Plus, Minus, Heart, Share2, Truck, Shield } from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"
import { cn } from "@/lib/utils"

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`)
      if (!res.ok) throw new Error("Failed to fetch product")
      return res.json()
    },
    enabled: Boolean(slug),
  })

  const product = data?.product
  const relatedProducts = data?.relatedProducts ?? []
  const variants = product?.variants ?? []

  useEffect(() => {
    if (variants.length === 1 && !selectedSize && !selectedColor) {
      const singleVariant = variants[0]
      setSelectedSize(singleVariant.size)
      setSelectedColor(singleVariant.color)
    }
  }, [variants, selectedSize, selectedColor])

  const availableSizes = Array.from(new Set(variants.map((v: any) => v.size)))
  const availableColors = Array.from(
    new Map(
      variants
        .filter((v: any) => !selectedSize || v.size === selectedSize)
        .map((v: any) => [v.color, { color: v.color, hex: v.colorHex }])
    ).values()
  )

  const selectedVariant = variants.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  )

  const price = selectedVariant?.priceOverride ?? product?.basePrice ?? 0
  const stock = selectedVariant?.stock ?? 0
  const isOutOfStock = selectedVariant ? stock <= 0 : false
  const needsSelection = !selectedSize || !selectedColor

  const handleAddToCart = () => {
    if (needsSelection) {
      toast({
        title: "خطا",
        description: "لطفا اندازه و رنگ را انتخاب کنید.",
        variant: "destructive",
      })
      return
    }

    if (!selectedVariant || isOutOfStock || stock < quantity) {
      toast({
        title: "خطا",
        description: "موجودی کافی نیست.",
        variant: "destructive",
      })
      return
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      productName: product.name,
      variantSize: selectedSize,
      variantColor: selectedColor,
      variantColorHex: selectedVariant.colorHex,
      price,
      quantity,
      image: product.images[0] || "",
      stock,
    })

    toast({
      title: "موفق",
      description: "محصول به سبد خرید اضافه شد.",
    })
  }

  if (isLoading) {
    return (
      <div className="container py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-hero font-bold mb-3">محصول پیدا نشد</h2>
          <p className="text-body text-muted-foreground">
            ممکن است محصول مورد نظر موجود نباشد یا حذف شده باشد.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="editorial-container py-12 md:py-20 pb-24 md:pb-20" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
        <div className="space-y-3 md:space-y-4">
          <div className="aspect-[4/5] relative bg-muted/20 rounded-xl md:rounded-2xl overflow-hidden group">
            {product.images[selectedImage] && (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative h-16 w-16 md:h-24 md:w-24 rounded-lg md:rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300",
                    selectedImage === idx
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-border/40 hover:border-primary/50"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 64px, 96px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 md:space-y-8">
          <div>
            <h1 className="text-2xl md:text-hero font-bold mb-3 md:mb-4 leading-tight">
              {product.name}
            </h1>
            <Price price={price} size="lg" />
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-body text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="space-y-6 md:space-y-8">
            <VariantSelector
              variants={variants}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              onSizeSelect={setSelectedSize}
              onColorSelect={setSelectedColor}
              availableSizes={availableSizes}
              availableColors={availableColors}
            />

            <div>
              <label className="block text-sm font-semibold mb-3 md:mb-4 text-foreground">تعداد</label>
              <div className="flex items-center gap-3 md:gap-4 w-fit">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="کاهش تعداد"
                >
                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <span className="text-xl md:text-2xl font-bold w-12 md:w-16 text-center persian-number">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock || !selectedVariant}
                  aria-label="افزایش تعداد"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
              {needsSelection ? (
                <p className="text-caption text-muted-foreground mt-3">
                  لطفا اندازه و رنگ را انتخاب کنید.
                </p>
              ) : stock > 0 ? (
                <p className="text-caption text-muted-foreground mt-3 persian-number">
                  موجودی: {stock} عدد
                </p>
              ) : (
                <p className="text-caption text-destructive mt-3">ناموجود</p>
              )}
            </div>
          </div>

          <div className="hidden md:block space-y-3 pt-4">
            <Button
              size="lg"
              className="w-full btn-editorial h-14"
              onClick={handleAddToCart}
              disabled={needsSelection || isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              {needsSelection
                ? "انتخاب گزینه ها"
                : isOutOfStock
                  ? "ناموجود"
                  : "افزودن به سبد خرید"}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Add to favorites
                }}
              >
                <Heart className="w-4 h-4 ml-2" />
                افزودن به علاقه مندی ها
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Share product
                }}
              >
                <Share2 className="w-4 h-4 ml-2" />
                اشتراک گذاری
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/40">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">ارسال سریع</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  ارسال بین ۲۴ تا ۷۲ ساعت کاری در سراسر کشور
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">ضمانت اصالت</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  تضمین کیفیت و اصالت کالا
                </div>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full border-t border-border/40 pt-6">
            <AccordionItem value="description">
              <AccordionTrigger className="text-base font-semibold">توضیحات</AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground leading-relaxed pt-2">
                {product.description || "توضیحی برای این محصول ثبت نشده است."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sizing">
              <AccordionTrigger className="text-base font-semibold">راهنمای سایز</AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground leading-relaxed pt-2">
                برای انتخاب سایز مناسب به جدول سایزبندی مراجعه کنید.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-base font-semibold">ارسال و بازگشت</AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground leading-relaxed pt-2">
                امکان بازگشت کالا تا ۷ روز پس از دریافت وجود دارد.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl">
        <div className="editorial-container px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground mb-1">قیمت</div>
              <Price price={price} size="lg" />
            </div>
            <Button
              size="lg"
              className="btn-editorial h-12 px-6 flex-shrink-0"
              onClick={handleAddToCart}
              disabled={needsSelection || isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              {needsSelection
                ? "انتخاب گزینه ها"
                : isOutOfStock
                  ? "ناموجود"
                  : "افزودن به سبد خرید"}
            </Button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-32 pt-16 border-t border-border/40">
          <h2 className="text-hero font-bold mb-12">محصولات مرتبط</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {relatedProducts.map((related: any) => (
              <ProductCard
                key={related.id}
                id={related.id}
                name={related.name}
                slug={related.slug}
                basePrice={related.basePrice}
                images={related.images}
                variants={related.variants}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
