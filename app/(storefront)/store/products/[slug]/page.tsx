"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from "framer-motion"
import { QueryProvider } from "@/components/query-provider"
import { useCartStore } from "@/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useWishlistStore } from "@/store/wishlist-store"
import { Container } from "@/components/ui/container"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductMedia } from "@/components/storefront/pdp/product-media"
import { PurchasePanel } from "@/components/storefront/pdp/purchase-panel"
import { ProductTabs } from "@/components/storefront/pdp/product-tabs"
import { SimilarProductsGrid } from "@/components/storefront/pdp/similar-products-grid"
import { ReviewsSection } from "@/components/storefront/pdp/reviews-section"
import { StickyMobileCTA } from "@/components/storefront/pdp/sticky-mobile-cta"
import { PackageSearch } from "lucide-react"
import { fa } from "@/lib/copy/fa"

interface ProductVariant {
  id: string
  size: string
  color: string
  colorHex: string
  priceOverride?: number
  stockOnHand: number
  stockReserved?: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  images: string[]
  variants: ProductVariant[]
}

interface ProductData {
  product: Product
  relatedProducts: Product[]
}

const getStock = (variant: ProductVariant) =>
  Math.max(0, variant.stockOnHand - (variant.stockReserved || 0))

const normalizeVariants = (items: ProductVariant[]) =>
  items.map((variant) => ({
    ...variant,
    stockReserved: variant.stockReserved ?? 0,
  }))

function ProductPageContent() {
  const params = useParams()
  const slug = params?.slug as string

  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const { data: productData, isLoading } = useQuery<ProductData>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`)
      if (!res.ok) throw new Error("دریافت اطلاعات محصول ناموفق بود.")
      return res.json()
    },
  })

  const product = productData?.product
  const relatedProducts = productData?.relatedProducts || []
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isWishlisted = useWishlistStore((state) =>
    product ? state.hasItem(product.id) : false
  )

  const normalizedVariants = useMemo(
    () => normalizeVariants(product?.variants ?? []),
    [product?.variants]
  )

  const availableSizes = useMemo(
    () => Array.from(new Set(normalizedVariants.map((variant) => variant.size))),
    [normalizedVariants]
  )

  const allColors = useMemo(
    () => Array.from(new Set(normalizedVariants.map((variant) => variant.color))),
    [normalizedVariants]
  )

  const heroVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 26 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.55, ease: [0.22, 0.61, 0.36, 1] },
      },
    }),
    [prefersReducedMotion]
  )

  const colorsForSize = useMemo(() => {
    const candidates = selectedSize
      ? normalizedVariants.filter((variant) => variant.size === selectedSize)
      : normalizedVariants
    return Array.from(
      new Map(
        candidates.map((variant) => [
          `${variant.color}-${variant.colorHex}`,
          { color: variant.color, hex: variant.colorHex },
        ])
      ).values()
    )
  }, [normalizedVariants, selectedSize])

  const sizesForColor = useMemo(() => {
    if (!selectedColor) return availableSizes
    return Array.from(
      new Set(
        normalizedVariants
          .filter((variant) => variant.color === selectedColor)
          .map((variant) => variant.size)
      )
    )
  }, [availableSizes, normalizedVariants, selectedColor])

  useEffect(() => {
    if (!normalizedVariants.length) return

    if (!selectedSize || !selectedColor) {
      const firstAvailable =
        normalizedVariants.find((variant) => getStock(variant) > 0) ||
        normalizedVariants[0]
      setSelectedSize(firstAvailable.size)
      setSelectedColor(firstAvailable.color)
      return
    }

    if (!availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || "")
    }

    if (selectedSize) {
      const colorMatch = colorsForSize.find((colorItem) => colorItem.color === selectedColor)
      if (!colorMatch) {
        setSelectedColor(colorsForSize[0]?.color || "")
      }
    }
  }, [availableSizes, colorsForSize, normalizedVariants, selectedColor, selectedSize])

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    const colors = normalizedVariants
      .filter((variant) => variant.size === size)
      .map((variant) => ({ color: variant.color, hex: variant.colorHex }))
    const nextColor = colors.find((colorItem) => colorItem.color === selectedColor)?.color
    setSelectedColor(nextColor || colors[0]?.color || "")
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    const sizes = normalizedVariants
      .filter((variant) => variant.color === color)
      .map((variant) => variant.size)
    const nextSize = sizes.includes(selectedSize) ? selectedSize : sizes[0]
    setSelectedSize(nextSize || "")
  }

  const selectedVariant = normalizedVariants.find(
    (variant) => variant.size === selectedSize && variant.color === selectedColor
  )

  const price = selectedVariant?.priceOverride ?? product?.basePrice ?? 0
  const stock = selectedVariant ? getStock(selectedVariant) : 0
  const isOutOfStock = !selectedVariant || stock <= 0

  useEffect(() => {
    if (stock > 0 && quantity > stock) {
      setQuantity(stock)
    }
  }, [quantity, stock])

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast({
        title: fa.price.noVariantTitle,
        description: fa.price.noVariantDescription,
        variant: "destructive",
      })
      return
    }

    if (isOutOfStock) {
      toast({
        title: fa.price.outOfStockTitle,
        description: fa.price.outOfStockDescription,
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
      variantSize: selectedVariant.size,
      variantColor: selectedVariant.color,
      variantColorHex: selectedVariant.colorHex,
      price,
      quantity,
      image: product.images[0] || "",
      availableStock: stock,
    })

    toast({
      title: fa.price.addedToCartTitle,
      description: fa.price.addedToCartDescription,
    })

    setShowSuccess(true)
    setTimeout(() => {
      setIsAdding(false)
      setShowSuccess(false)
    }, 1400)
  }

  const handleWishlistToggle = () => {
    if (!product) return
    toggleWishlist({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0] })
  }

  const handleShare = async () => {
    if (!product) return
    const shareData = {
      title: product.name,
      text: product.description || product.name,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (shareData.url) {
        await navigator.clipboard.writeText(shareData.url)
        toast({ title: "پیوند کپی شد." })
      }
    } catch (error) {
      toast({ title: "اشتراک‌گذاری با خطا مواجه شد.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <Container className="py-10 md:py-14" dir="rtl">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container className="py-16" dir="rtl">
        <EmptyState
          icon={<PackageSearch className="h-7 w-7 text-muted-foreground" />}
          title="محصولی یافت نشد"
          description="محصول موردنظر در دسترس نیست یا حذف شده است."
          action={
            <Link href="/store/products">
              <span className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                بازگشت به محصولات
              </span>
            </Link>
          }
        />
      </Container>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <Container className="py-8 md:py-12 lg:py-16 pb-28" dir="rtl">
          <m.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start"
            variants={heroVariants}
            initial="hidden"
            animate="show"
          >
            <ProductMedia
              images={product.images}
              name={product.name}
              currentIndex={currentImage}
              onChange={setCurrentImage}
              badge={isOutOfStock ? fa.price.outOfStock : undefined}
            />
            <PurchasePanel
              variants={normalizedVariants}
              name={product.name}
              price={price}
              stock={stock}
              isOutOfStock={isOutOfStock}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              availableSizes={sizesForColor}
              availableColors={colorsForSize}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onSizeSelect={handleSizeSelect}
              onColorSelect={handleColorSelect}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
              showSuccess={showSuccess}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleWishlistToggle}
              onShare={handleShare}
            />
          </m.div>

          <div className="mt-14 md:mt-20 space-y-12">
            <section className="space-y-6">
              <SectionHeader
                title="جزئیات محصول"
                subtitle="تمامی مشخصات، سایزبندی و رنگ‌بندی این محصول را بررسی کنید."
              />
              <ProductTabs
                description={product.description}
                sizes={availableSizes}
                colors={allColors}
              />
            </section>

            <section className="space-y-6">
              <SectionHeader
                title="محصولات مشابه"
                subtitle="گزینه‌های هم‌خانواده و پیشنهادی برای انتخابی مطمئن."
              />
              <SimilarProductsGrid
                products={relatedProducts}
                normalizeVariants={normalizeVariants}
              />
            </section>

            <ReviewsSection />
          </div>

          <StickyMobileCTA
            price={price * quantity}
            disabled={isAdding || isOutOfStock}
            isAdding={isAdding}
            onAddToCart={handleAddToCart}
          />
        </Container>
      </MotionConfig>
    </LazyMotion>
  )
}

export default function ProductPage() {
  return (
    <QueryProvider>
      <ProductPageContent />
    </QueryProvider>
  )
}
