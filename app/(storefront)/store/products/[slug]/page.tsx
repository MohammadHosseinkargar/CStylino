"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useCartStore } from "@/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useWishlistStore } from "@/store/wishlist-store"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductGallery } from "@/components/storefront/pdp/product-gallery"
import { ProductInfo } from "@/components/storefront/pdp/product-info"
import { StickyMobileCTA } from "@/components/storefront/pdp/sticky-mobile-cta"
import { ProductCard } from "@/components/storefront/product-card"
import { PackageSearch, Sparkles, Star, Truck } from "lucide-react"

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

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { data: productData, isLoading } = useQuery<ProductData>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`)
      if (!res.ok) throw new Error("خطا در دریافت محصول")
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
        title: "انتخاب نامعتبر",
        description: "لطفا سایز و رنگ را انتخاب کنید.",
        variant: "destructive",
      })
      return
    }

    if (isOutOfStock) {
      toast({
        title: "ناموجود",
        description: "این انتخاب در حال حاضر موجود نیست.",
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
      title: "به سبد خرید اضافه شد",
      description: "محصول با موفقیت به سبد خرید اضافه شد.",
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
        toast({ title: "لینک کپی شد" })
      }
    } catch (error) {
      toast({ title: "امکان اشتراک گذاری نیست", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <PageContainer className="py-10 md:py-14" dir="rtl">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!product) {
    return (
      <PageContainer className="py-16" dir="rtl">
        <EmptyState
          icon={<PackageSearch className="h-7 w-7 text-muted-foreground" />}
          title="محصول پیدا نشد"
          description="کالای مورد نظر شما در حال حاضر در دسترس نیست."
          action={
            <Link href="/store/products">
              <span className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                بازگشت به محصولات
              </span>
            </Link>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 md:py-12 lg:py-16 pb-28" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <ProductGallery
          images={product.images}
          name={product.name}
          currentIndex={currentImage}
          onChange={setCurrentImage}
        />
        <ProductInfo
          variants={normalizedVariants}
          name={product.name}
          price={price}
          stock={stock}
          isOutOfStock={isOutOfStock}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          availableSizes={availableSizes}
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
      </div>

      <div className="mt-16 md:mt-24 space-y-10">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-title font-bold">جزئیات محصول</h2>
          <p className="text-body text-muted-foreground leading-relaxed">
            {product.description || "جزئیات این محصول به زودی تکمیل می شود."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StyledCard variant="subtle" className="border-border/50">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                جنس و نگهداری
              </div>
              <p className="text-body text-muted-foreground">
                پارچه باکیفیت و لطیف. شستشو با آب سرد و خشک کردن در سطح صاف.
              </p>
            </div>
          </StyledCard>
          <StyledCard variant="subtle" className="border-border/50">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Star className="h-4 w-4 text-primary" />
                فیت و ایستایی
              </div>
              <p className="text-body text-muted-foreground">
                فیت متعادل و خوش ایست. سایز انتخابی خود را مطابق راهنما بردارید.
              </p>
            </div>
          </StyledCard>
          <StyledCard variant="subtle" className="border-border/50">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Truck className="h-4 w-4 text-primary" />
                ارسال و مرجوعی
              </div>
              <p className="text-body text-muted-foreground">
                ارسال بین ۲ تا ۴ روز کاری. مرجوعی تا ۷ روز با حفظ شرایط کالا.
              </p>
              <Link href="/store/shipping" className="text-sm font-semibold text-primary">
                مشاهده قوانین
              </Link>
            </div>
          </StyledCard>
        </div>

        <SectionHeader
          title="محصولات مرتبط"
          subtitle="استایل خود را با انتخاب های هماهنگ کامل کنید."
        />
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                slug={item.slug}
                basePrice={item.basePrice}
                images={item.images}
                variants={normalizeVariants(item.variants)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="h-6 w-6 text-muted-foreground" />}
            title="محصول مرتبطی یافت نشد"
            description="به زودی محصولات هماهنگ را اینجا قرار می دهیم."
          />
        )}

        <SectionHeader title="نظرات مشتریان" subtitle="بازخورد خریداران اینجا نمایش داده می شود." />
        <EmptyState
          icon={<Star className="h-6 w-6 text-muted-foreground" />}
          title="هنوز نظری ثبت نشده"
          description="اولین نفر باشید که تجربه خود را به اشتراک می گذارد."
        />
      </div>

      <StickyMobileCTA
        price={price * quantity}
        disabled={isAdding || isOutOfStock}
        isAdding={isAdding}
        onAddToCart={handleAddToCart}
      />
    </PageContainer>
  )
}
