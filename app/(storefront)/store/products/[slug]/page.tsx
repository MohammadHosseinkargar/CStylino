"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { VariantSelector } from "@/components/storefront/variant-selector"
import { Price } from "@/components/storefront/price"
import { useCartStore } from "@/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import {
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Share2,
  Truck,
  Shield,
  X,
  Loader2,
  Check,
} from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"
import { cn } from "@/lib/utils"

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [highlightSelectors, setHighlightSelectors] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchDeltaX, setTouchDeltaX] = useState(0)

  const selectorsRef = useRef<HTMLDivElement | null>(null)
  const mobileGalleryRef = useRef<HTMLDivElement | null>(null)
  const addTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    if (justAdded) {
      successTimeoutRef.current = setTimeout(() => setJustAdded(false), 1600)
    }

    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [justAdded])

  useEffect(() => {
    return () => {
      if (addTimeoutRef.current) {
        clearTimeout(addTimeoutRef.current)
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(media.matches)
    update()
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

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
  const anyInStock = variants.some((v: any) => v.stock > 0)
  const stockBadge = selectedVariant ? (stock > 0 ? "موجود" : "ناموجود") : anyInStock ? "موجود" : "ناموجود"
  const ctaDisabled = isAdding || (selectedVariant ? isOutOfStock : false)
  const ctaLabel = needsSelection
    ? "انتخاب سایز/رنگ"
    : isAdding
      ? "در حال افزودن..."
      : justAdded
        ? "به سبد اضافه شد"
        : isOutOfStock
          ? "ناموجود"
          : "افزودن به سبد خرید"

  const totalImages = product?.images?.length ?? 0
  const indexLabel = totalImages
    ? `${(lightboxIndex + 1).toLocaleString("fa-IR")} / ${totalImages.toLocaleString("fa-IR")}`
    : ""

  const scrollToSelectors = () => {
    selectorsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" })
    setHighlightSelectors(true)
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }
    highlightTimeoutRef.current = setTimeout(() => setHighlightSelectors(false), 600)
  }

  const handleAddToCart = () => {
    if (needsSelection) {
      toast({
        title: "توجه",
        description: "لطفاً سایز/رنگ را انتخاب کنید.",
        variant: "destructive",
      })
      scrollToSelectors()
      return
    }

    if (!selectedVariant || isOutOfStock || stock < quantity) {
      toast({
        title: "توجه",
        description: "موجودی انتخاب‌شده کافی نیست.",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)

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
      title: "اضافه شد",
      description: "این محصول به سبد خرید اضافه شد.",
    })

    setJustAdded(true)
    addTimeoutRef.current = setTimeout(() => setIsAdding(false), 800)
  }

  const goToImage = (index: number) => {
    if (!totalImages) return
    const nextIndex = (index + totalImages) % totalImages
    setSelectedImage(nextIndex)
    setLightboxIndex(nextIndex)
  }

  const nextImage = () => goToImage(selectedImage + 1)
  const prevImage = () => goToImage(selectedImage - 1)

  const handleMobileScroll = () => {
    if (!mobileGalleryRef.current) return
    const { scrollLeft, clientWidth } = mobileGalleryRef.current
    if (!clientWidth) return
    const index = Math.round(scrollLeft / clientWidth)
    if (index !== selectedImage) {
      setSelectedImage(index)
    }
  }

  const scrollToImage = (index: number) => {
    if (!mobileGalleryRef.current) return
    mobileGalleryRef.current.scrollTo({
      left: mobileGalleryRef.current.clientWidth * index,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false)
      }
      if (event.key === "ArrowRight") {
        nextImage()
      }
      if (event.key === "ArrowLeft") {
        prevImage()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxOpen, selectedImage, totalImages])

  const handleLightboxTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    setTouchStartX(event.touches[0]?.clientX ?? null)
    setTouchDeltaX(0)
  }

  const handleLightboxTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (reduceMotion || touchStartX === null) return
    const currentX = event.touches[0]?.clientX ?? 0
    setTouchDeltaX(currentX - touchStartX)
  }

  const handleLightboxTouchEnd = () => {
    if (reduceMotion || touchStartX === null) return
    if (touchDeltaX > 60) {
      prevImage()
    } else if (touchDeltaX < -60) {
      nextImage()
    }
    setTouchStartX(null)
    setTouchDeltaX(0)
  }

  useEffect(() => {
    if (lightboxOpen && lightboxIndex !== selectedImage) {
      setSelectedImage(lightboxIndex)
    }
  }, [lightboxIndex, lightboxOpen, selectedImage])

  useEffect(() => {
    if (lightboxOpen && selectedImage !== lightboxIndex) {
      setLightboxIndex(selectedImage)
    }
  }, [selectedImage, lightboxOpen, lightboxIndex])

  useEffect(() => {
    scrollToImage(selectedImage)
  }, [selectedImage])

  if (isLoading) {
    return (
      <div className="page-container py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-caption text-muted-foreground">در حال دریافت اطلاعات...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-container py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-title font-bold mb-3">محصول پیدا نشد</h2>
          <p className="text-body text-muted-foreground">
            محصول مورد نظر شما یافت نشد یا از فروشگاه حذف شده است.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="page-container py-12 md:py-20 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-20"
      dir="rtl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
        <div className="space-y-4 md:space-y-6">
          <div className="hidden md:block space-y-4">
            <button
              type="button"
              onClick={() => openLightbox(selectedImage)}
              className="relative aspect-[4/5] w-full bg-muted/20 rounded-2xl overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              aria-label="مشاهده تصویر بزرگ"
            >
              {!loadedImages[selectedImage] && (
                <div className="absolute inset-0 animate-pulse motion-reduce:animate-none bg-muted/30" />
              )}
              {product.images[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none",
                    loadedImages[selectedImage] ? "opacity-100" : "opacity-0"
                  )}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onLoadingComplete={() =>
                    setLoadedImages((prev) => ({ ...prev, [selectedImage]: true }))
                  }
                />
              )}
            </button>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => goToImage(idx)}
                    className={cn(
                      "relative h-20 w-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-transform duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                      selectedImage === idx
                        ? "border-primary ring-2 ring-primary/20 scale-105"
                        : "border-border/40 hover:border-primary/50"
                    )}
                    aria-label={`تصویر ${idx + 1}`}
                  >
                    {!loadedImages[idx] && (
                      <div className="absolute inset-0 bg-muted/30 animate-pulse motion-reduce:animate-none" />
                    )}
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className={cn(
                        "object-cover transition-opacity duration-300 motion-reduce:transition-none",
                        loadedImages[idx] ? "opacity-100" : "opacity-0"
                      )}
                      sizes="80px"
                      onLoadingComplete={() =>
                        setLoadedImages((prev) => ({ ...prev, [idx]: true }))
                      }
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:hidden space-y-4">
            <div
              ref={mobileGalleryRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
              onScroll={handleMobileScroll}
            >
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className="relative w-full flex-shrink-0 snap-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  aria-label={`تصویر ${idx + 1}`}
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted/20">
                    {!loadedImages[idx] && (
                      <div className="absolute inset-0 animate-pulse motion-reduce:animate-none bg-muted/30" />
                    )}
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className={cn(
                        "object-cover transition-opacity duration-300 motion-reduce:transition-none",
                        loadedImages[idx] ? "opacity-100" : "opacity-0"
                      )}
                      sizes="100vw"
                      priority={idx === 0}
                      onLoadingComplete={() =>
                        setLoadedImages((prev) => ({ ...prev, [idx]: true }))
                      }
                    />
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              {product.images.map((_, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    goToImage(idx)
                    scrollToImage(idx)
                  }}
                  className="h-2 w-6 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  aria-label={`رفتن به تصویر ${idx + 1}`}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full transition-transform duration-300 motion-reduce:transition-none",
                      selectedImage === idx ? "bg-primary scale-150" : "bg-border scale-100"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-title md:text-hero font-bold leading-tight">{product.name}</h1>
              <span
                className={cn(
                  "text-caption font-semibold px-3 py-1 rounded-full border",
                  stockBadge === "موجود"
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                    : "border-rose-500/30 text-rose-500 bg-rose-500/10"
                )}
              >
                {stockBadge}
              </span>
            </div>
            <Price price={price} size="lg" />
          </div>

          <div
            className={cn(
              "space-y-6 md:space-y-8 rounded-2xl",
              highlightSelectors &&
                "ring-2 ring-primary/40 shadow-lg animate-pulse motion-reduce:animate-none"
            )}
            ref={selectorsRef}
          >
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
              <label className="block text-caption font-semibold mb-3 text-foreground">تعداد</label>
              <div className="flex items-center gap-3 w-fit">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="کاهش تعداد"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-title font-bold w-12 text-center persian-number">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock || !selectedVariant}
                  aria-label="افزایش تعداد"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {needsSelection ? (
                <p className="text-caption text-muted-foreground mt-3">
                  لطفاً سایز/رنگ را انتخاب کنید.
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
              onClick={needsSelection ? scrollToSelectors : handleAddToCart}
              disabled={ctaDisabled}
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              ) : justAdded ? (
                <Check className="w-5 h-5 ml-2" />
              ) : (
                <ShoppingCart className="w-5 h-5 ml-2" />
              )}
              {ctaLabel}
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
                افزودن به علاقه‌مندی‌ها
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Share product
                }}
              >
                <Share2 className="w-4 h-4 ml-2" />
                اشتراک‌گذاری
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/40">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-body font-semibold mb-1">ارسال رایگان</div>
                <div className="text-caption text-muted-foreground leading-relaxed">
                  ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-body font-semibold mb-1">ضمانت اصالت</div>
                <div className="text-caption text-muted-foreground leading-relaxed">
                  تضمین اصالت کالا و گارانتی بازگشت وجه
                </div>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full border-t border-border/40 pt-6">
            <AccordionItem value="description">
              <AccordionTrigger className="text-body font-semibold">توضیحات</AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground leading-relaxed pt-2">
                {product.description || "هیچ توضیحی برای این محصول ثبت نشده است."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sizing">
              <AccordionTrigger className="text-body font-semibold">راهنمای سایز</AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground leading-relaxed pt-2">
                برای انتخاب بهترین سایز، لطفاً به جدول راهنمای سایز مراجعه کنید.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-body font-semibold">ارسال و مرجوعی</AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground leading-relaxed pt-2">
                ارسال و مرجوعی برای تمامی سفارش‌ها رایگان است. تا ۷ روز ضمانت بازگشت کالا وجود دارد.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl">
        <div className="page-container px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-caption text-muted-foreground mb-1">قیمت</div>
              <Price price={price} size="lg" />
            </div>
            <Button
              size="lg"
              className="btn-editorial h-12 px-6 flex-shrink-0"
              onClick={needsSelection ? scrollToSelectors : handleAddToCart}
              disabled={ctaDisabled}
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              ) : justAdded ? (
                <Check className="w-5 h-5 ml-2" />
              ) : (
                <ShoppingCart className="w-5 h-5 ml-2" />
              )}
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>

      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in motion-reduce:animate-none" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-[90vw] max-w-5xl max-h-[90vh] aspect-[4/5] md:aspect-[3/4] bg-black/20 rounded-2xl overflow-hidden"
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={handleLightboxTouchEnd}
            >
              {product.images[lightboxIndex] && (
                <Image
                  src={product.images[lightboxIndex]}
                  alt={`${product.name} ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              )}
              <div className="pointer-events-none absolute inset-x-0 top-4 flex items-center justify-center">
                <span className="text-caption text-white/90 bg-black/40 px-3 py-1 rounded-full">
                  {indexLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="تصویر قبلی"
              >
                <span className="text-xl">‹</span>
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="تصویر بعدی"
              >
                <span className="text-xl">›</span>
              </button>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
