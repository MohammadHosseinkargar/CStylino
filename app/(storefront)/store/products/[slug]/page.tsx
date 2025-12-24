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
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  Ruler,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
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

  // Derived state for available options
  const availableSizes = Array.from(new Set(variants.map((v: any) => v.size))) as string[]
  const availableColors = Array.from(
    new Map(variants.map((v: any) => [v.color, { color: v.color, hex: v.colorHex }])).values()
  ) as Array<{ color: string; hex: string }>

  useEffect(() => {
    if (variants.length === 1 && !selectedSize && !selectedColor) {
      const singleVariant = variants[0]
      setSelectedSize(singleVariant.size)
      setSelectedColor(singleVariant.color)
    }
  }, [variants, selectedSize, selectedColor])

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        variant: "destructive",
        title: "لطفا سایز و رنگ را انتخاب کنید",
      })
      return
    }

    const variant = variants.find(
      (v: any) => v.size === selectedSize && v.color === selectedColor
    )

    if (!variant) return

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      price: product.basePrice,
      image: product.images[0],
      variantSize: selectedSize,
      variantColor: selectedColor,
      variantColorHex: variant.colorHex,
      quantity: 1,
      stock: variant.stock ?? 10,
    })

    toast({
      title: "به سبد خرید اضافه شد",
      description: `${product.name} - ${selectedSize} / ${selectedColor}`,
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-[60vh] w-full rounded-2xl" />
        <div className="space-y-4">
           <Skeleton className="h-10 w-3/4" />
           <Skeleton className="h-6 w-1/4" />
           <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-0 md:px-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12">
          
          {/* Gallery Section - Full width on mobile, 7 cols on desktop */}
          <div className="lg:col-span-7">
            {/* Desktop Grid Gallery */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {product.images.map((img: string, i: number) => (
                <div 
                   key={i} 
                   className={cn(
                     "relative rounded-2xl overflow-hidden cursor-zoom-in bg-muted",
                     i === 0 ? "col-span-2 aspect-[4/5]" : "aspect-[3/4]"
                   )}
                   onClick={() => setCurrentImageIndex(i)} // Could open lightbox here
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {/* Mobile Carousel Gallery */}
            <div className="lg:hidden relative h-[60vh] w-full bg-muted overflow-hidden">
               <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar" style={{ scrollBehavior: 'smooth' }}>
                 {product.images.map((img: string, i: number) => (
                   <div key={i} className="min-w-full h-full relative snap-center">
                     <Image
                       src={img}
                       alt={`${product.name} - ${i + 1}`}
                       fill
                       className="object-cover"
                       priority={i === 0}
                     />
                   </div>
                 ))}
               </div>
               {/* Dots indicators would go here */}
               <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                 {product.images.map((_: any, i: number) => (
                   <div key={i} className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm" />
                 ))}
               </div>
            </div>
          </div>

          {/* Details Section - 5 cols on desktop, Sticky */}
          <div className="lg:col-span-5 px-6 pt-8 lg:pt-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              
              <div className="space-y-4 border-b border-border/40 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-display font-medium text-balance">{product.name}</h1>
                    <p className="text-muted-foreground mt-2">کد محصول: {variants[0]?.sku || product.id.slice(0, 8)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Heart className="w-6 h-6" />
                  </Button>
                </div>
                <Price price={product.basePrice} className="text-2xl font-medium" />
              </div>

              <VariantSelector
                variants={variants}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeSelect={setSelectedSize}
                onColorSelect={setSelectedColor}
                availableSizes={availableSizes}
                availableColors={availableColors}
              />

              <div className="flex flex-col gap-4 pt-4">
                 {/* Desktop Add to Cart */}
                 <Button 
                   size="lg" 
                   className="w-full text-lg h-14 rounded-xl hidden lg:flex"
                   onClick={handleAddToCart}
                 >
                   <ShoppingCart className="mr-2 w-5 h-5" />
                   افزودن به سبد خرید
                 </Button>
                 
                 <p className="text-xs text-center text-muted-foreground">
                   ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان
                 </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description">
                  <AccordionTrigger>توضیحات محصول</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {product.description || "توضیحاتی برای این محصول ثبت نشده است."}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="details">
                  <AccordionTrigger>مشخصات و ویژگی‌ها</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> ضمانت اصالت و سلامت کالا
                      </li>
                      <li className="flex items-center gap-2">
                         <Truck className="w-4 h-4" /> ارسال سریع به سراسر ایران
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sizing">
                   <AccordionTrigger>راهنمای سایز</AccordionTrigger>
                   <AccordionContent>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Ruler className="w-4 h-4" /> جدول راهنمای سایز (به زودی)
                     </div>
                   </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 px-6 lg:px-0">
             <h2 className="text-2xl md:text-3xl font-display mb-8">محصولات مشابه</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p: any) => (
                  <ProductCard key={p.id} {...p} />
                ))}
             </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4 lg:hidden z-50 pb-safe">
        <div className="flex gap-4 items-center">
           <div className="flex-1">
              <Price price={product.basePrice} className="text-lg font-bold" />
              <p className="text-xs text-muted-foreground">{selectedSize && selectedColor ? `${selectedSize} / ${selectedColor}` : 'انتخاب کنید'}</p>
           </div>
           <Button className="flex-1 rounded-xl h-12 text-base shadow-lg" onClick={handleAddToCart}>
             افزودن به سبد
           </Button>
        </div>
      </div>
    </div>
  )
}
