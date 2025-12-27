"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/storefront/price"
import { useCartStore } from "@/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import {
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Ruler,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  Headphones,
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as Dialog from "@radix-ui/react-dialog"

// ==================== INTERFACE DEFINITIONS ====================
interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  priceOverride?: number;
  stockOnHand: number;
  stockReserved?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  variants: ProductVariant[];
}

interface ProductData {
  product: Product;
  relatedProducts: any[];
}

// ==================== MAIN COMPONENT ====================

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  // State Management
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)

  // ==================== DATA FETCHING ====================
  const { data: productData, isLoading } = useQuery<ProductData>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`)
      if (!res.ok) throw new Error("Failed to fetch product")
      return res.json()
    },
  })

  const product = productData?.product
  const variants = product?.variants || []
  const relatedProducts = productData?.relatedProducts || []

  // Default Selection Logic
  useEffect(() => {
    if (variants.length > 0 && !selectedSize && !selectedColor) {
      const firstVariant = variants[0]
      setSelectedSize(firstVariant.size)
      setSelectedColor(firstVariant.color)
    }
  }, [variants])

  // Variant & Stock Logic
  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  )

  const price = selectedVariant?.priceOverride ?? product?.basePrice ?? 0
  const stock = selectedVariant
    ? Math.max(0, selectedVariant.stockOnHand - (selectedVariant.stockReserved || 0))
    : 0
  const isOutOfStock = selectedVariant ? stock <= 0 : false

  const availableSizes: string[] = Array.from(new Set(variants.map(v => v.size)))
  const availableColors = Array.from(
    new Map(
      variants
        .filter(v => !selectedSize || v.size === selectedSize)
        .map(v => [v.color, { color: v.color, hex: v.colorHex }])
    ).values()
  )

  // Add to Cart Logic
  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({
        title: "انتخاب لازم است",
        description: "لطفاً سایز و رنگ محصول را انتخاب کنید",
        variant: "destructive",
      })
      return
    }

    if (isOutOfStock) {
      toast({
        title: "محصول ناموجود است",
        description: "متاسفانه این محصول در حال حاضر موجود نمی‌باشد",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)

    addItem({
      productId: product!.id,
      variantId: selectedVariant.id,
      slug: product!.slug,
      productName: product!.name,
      variantSize: selectedSize,
      variantColor: selectedColor,
      variantColorHex: selectedVariant.colorHex,
      price,
      quantity,
      image: product!.images[0] || "",
      availableStock: stock,
    })

    toast({
      title: "🎉 افزوده شد به سبد خرید",
      description: "محصول با موفقیت به سبد خرید شما اضافه شد",
      className: "border-[#d7b242] bg-gradient-to-r from-[#fdf9e8] to-white",
    })

    setShowSuccess(true)
    setTimeout(() => {
      setIsAdding(false)
      setShowSuccess(false)
    }, 1500)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#d7b242]" />
      </div>
    )
  }

  // Not Found State
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold">محصول یافت نشد</h2>
        <Button onClick={() => window.history.back()}>بازگشت</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* RIGHT COLUMN: Images (با همان منطق گالری قبلی شما) */}
          <div className="space-y-6 order-1">
             <div className="relative group">
                <div className="relative aspect-[3/4] md:aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                  {product.images[currentImage] && (
                    <Image
                      src={product.images[currentImage]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  )}
                  
                  {/* دکمه‌های ناوبری گالری */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-5 left-5">
                    <div className="px-4 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/30">
                      ویژه
                    </div>
                  </div>
                </div>
             </div>

             {/* Thumbnails */}
             {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={cn(
                        "relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all",
                        currentImage === idx ? "border-[#d7b242] shadow-md opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
             )}
          </div>

          {/* LEFT COLUMN: Product Details (طرح جدید درخواستی) */}
          <div className="flex flex-col space-y-6 order-2 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
            
            {/* Header: Stock & Size Guide */}
            <div className="flex items-center justify-between">
              <div className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2",
                stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}>
                <span className={cn("w-2 h-2 rounded-full", stock > 0 ? "bg-emerald-500" : "bg-rose-500")}></span>
                {stock > 0 ? `موجود در انبار (${stock} عدد)` : "ناموجود"}
              </div>

              {/* Size Guide Dialog */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button className="text-gray-400 hover:text-[#d7b242] text-xs font-bold flex items-center gap-1 transition-colors">
                    <Ruler size={14} />
                    راهنمای سایز
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 w-full max-w-md z-50 shadow-2xl">
                     <Dialog.Title className="text-lg font-bold mb-4 text-center">راهنمای سایز</Dialog.Title>
                     <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full text-sm text-center">
                          <thead className="bg-[#FFF9E5]">
                            <tr><th className="p-3">سایز</th><th className="p-3">سینه</th><th className="p-3">کمر</th></tr>
                          </thead>
                          <tbody>
                            <tr><td className="p-3 font-bold">S</td><td className="p-3">82-86</td><td className="p-3">62-66</td></tr>
                            <tr><td className="p-3 font-bold">M</td><td className="p-3">86-90</td><td className="p-3">66-70</td></tr>
                            <tr><td className="p-3 font-bold">L</td><td className="p-3">90-94</td><td className="p-3">70-74</td></tr>
                          </tbody>
                        </table>
                     </div>
                     <Dialog.Close asChild>
                       <Button className="w-full mt-4 bg-[#d7b242] hover:bg-[#c09a2b] text-black font-bold rounded-xl">بستن</Button>
                     </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            {/* Title & Price */}
            <div>
              <div className="text-xs text-gray-400 mb-2 font-medium">
                 {productData?.product?.variants?.length ? "کالکشن جدید" : "تک محصول"}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="text-3xl font-black text-[#6F7BFF] dark:text-[#d7b242]">
                <Price price={price} />
              </div>
            </div>

            {/* Selectors Section */}
            <div className="space-y-6 pt-4 border-t border-gray-50">
               
               {/* Controls Row */}
               <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
                  
                  {/* Colors */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500 font-bold block">انتخاب رنگ: {selectedColor}</span>
                    <div className="flex items-center gap-2">
                      {availableColors.map(({ color, hex }) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center relative transition-all duration-300",
                            selectedColor === color ? "ring-2 ring-offset-2 ring-[#d7b242] scale-110" : "hover:scale-105 border border-gray-200"
                          )}
                          style={{ backgroundColor: hex }}
                          title={color}
                        >
                          {selectedColor === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500 font-bold block">انتخاب سایز</span>
                    <div className="flex items-center gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2",
                            selectedSize === size
                              ? "bg-black border-black text-white shadow-lg scale-105"
                              : "bg-white border-gray-100 text-gray-600 hover:border-gray-300"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500 font-bold block">تعداد</span>
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 h-10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-white rounded-r-xl transition-colors disabled:opacity-30"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= stock}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-white rounded-l-xl transition-colors disabled:opacity-30"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Info Box (Yellow) */}
            <div className="bg-[#FFF9E5] p-5 rounded-2xl border border-[#FFEFB3]">
               <div className="flex items-center mb-3 gap-2">
                  <Truck className="text-[#B48E2D]" size={20} />
                  <h3 className="font-bold text-gray-900 text-sm">سفارش آسان، تحویل سریع</h3>
               </div>
               <p className="text-xs text-gray-600 mb-4 leading-relaxed opacity-80">
                  ما تضمین می‌کنیم محصول شما در سریع‌ترین زمان ممکن و با بسته‌بندی ایمن به دستتان برسد.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-[#FFEFB3]/50 flex items-center gap-3">
                     <div className="bg-[#FFF9E5] p-1.5 rounded-lg"><Clock className="text-[#B48E2D]" size={16} /></div>
                     <div>
                        <div className="font-bold text-xs text-gray-900">ارسال فوری</div>
                        <div className="text-[10px] text-gray-500">زیر ۲۴ ساعت در تهران</div>
                     </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-[#FFEFB3]/50 flex items-center gap-3">
                     <div className="bg-[#FFF9E5] p-1.5 rounded-lg"><Headphones className="text-[#B48E2D]" size={16} /></div>
                     <div>
                        <div className="font-bold text-xs text-gray-900">پشتیبانی</div>
                        <div className="text-[10px] text-gray-500">پاسخگویی آنلاین</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
               <Button
                  className={cn(
                    "w-full h-14 rounded-xl font-black text-base shadow-xl shadow-[#d7b242]/20 transition-all duration-300",
                    showSuccess 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                      : "bg-[#d7b242] hover:bg-[#c09a2b] text-black hover:scale-[1.01]"
                  )}
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock || !selectedVariant}
               >
                  {isAdding ? <Loader2 className="ml-2 animate-spin" /> : showSuccess ? <CheckCircle className="ml-2" /> : <ShoppingCart className="ml-2" />}
                  {showSuccess ? "اضافه شد" : isOutOfStock ? "ناموجود" : "افزودن به سبد خرید"}
               </Button>
               
               <div className="grid grid-cols-2 gap-3">
                  <button 
                     className="h-12 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                     <Share2 size={16} /> اشتراک
                  </button>
                  <button 
                     onClick={() => setIsFavorite(!isFavorite)}
                     className={cn(
                       "h-12 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all",
                       isFavorite ? "text-rose-500 border-rose-200 bg-rose-50" : "text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                     )}
                  >
                     <Heart size={16} className={cn(isFavorite && "fill-rose-500")} /> علاقه‌مندی
                  </button>
               </div>
            </div>

          </div>
        </div>

        {/* بخش توضیحات (پایین) */}
        <div className="mt-16 md:mt-24">
           <div className="max-w-4xl mx-auto">
              <div className="border-b border-gray-200 mb-6">
                 <h2 className="text-xl font-black text-gray-900 pb-4 border-b-2 border-[#d7b242] inline-block">توضیحات محصول</h2>
              </div>
              <p className="text-gray-600 leading-8 text-justify">
                {product.description || "توضیحات تکمیلی برای این محصول ثبت نشده است."}
              </p>
           </div>
        </div>

        {/* محصولات مشابه */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-gray-900">محصولات مشابه</h2>
               <Button variant="ghost" className="text-[#d7b242] hover:text-[#c09a2b]">مشاهده همه <ChevronLeft className="w-4 h-4 mr-1"/></Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((item: any) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-gray-100">
                    <Image src={item.images?.[0]} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#d7b242] transition-colors">{item.name}</h3>
                  <div className="text-[#d7b242] font-black text-sm"><Price price={item.basePrice} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sticky Bar (برای موبایل) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between gap-4">
              <div>
                 <div className="text-[10px] text-gray-500">قیمت نهایی</div>
                 <div className="text-lg font-black text-[#d7b242]"><Price price={price * quantity} /></div>
              </div>
              <Button 
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className="flex-1 bg-[#d7b242] hover:bg-[#c09a2b] text-black font-bold rounded-xl h-12"
              >
                 {isAdding ? "..." : "افزودن به سبد"}
              </Button>
           </div>
        </div>

      </div>
    </div>
  )
}