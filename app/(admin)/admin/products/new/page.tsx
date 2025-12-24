"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Plus, X } from "lucide-react"

interface Variant {
  size: string
  color: string
  colorHex: string
  stock: number
  sku: string
  priceOverride?: number
}

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    slug: "",
    description: "",
    descriptionEn: "",
    basePrice: "",
    categoryId: "",
    images: [""],
    isActive: true,
    featured: false,
  })
  const [variants, setVariants] = useState<Variant[]>([
    { size: "", color: "", colorHex: "#000000", stock: 0, sku: "" },
  ])

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] })
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", colorHex: "#000000", stock: 0, sku: "" }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.slug || !formData.basePrice || !formData.categoryId) {
        toast({
          title: "خطا",
          description: "لطفاً تمام فیلدهای الزامی را پر کنید",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (variants.length === 0 || variants.some((v) => !v.size || !v.color || !v.sku)) {
        toast({
          title: "خطا",
          description: "لطفاً حداقل یک واریانت با تمام فیلدها اضافه کنید",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (formData.images.filter((img) => img.trim()).length === 0) {
        toast({
          title: "خطا",
          description: "لطفاً حداقل یک تصویر اضافه کنید",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const productData = {
        ...formData,
        basePrice: parseInt(formData.basePrice),
        images: formData.images.filter((img) => img.trim()),
        variants: variants.map((v) => ({
          ...v,
          stock: Number(v.stock),
          priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
        })),
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "خطا در ایجاد محصول")
      }

      toast({
        title: "موفق",
        description: "محصول با موفقیت ایجاد شد",
      })

      router.push("/admin/products")
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ایجاد محصول",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">افزودن محصول جدید</h1>
        <p className="text-muted-foreground">اطلاعات محصول را وارد کنید</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>اطلاعات اصلی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">نام محصول *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">نام انگلیسی (اختیاری)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">اسلاگ *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="basePrice">قیمت پایه (تومان) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="persian-number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">دسته‌بندی *</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>تصاویر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="URL تصویر"
                />
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImageField(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addImageField}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن تصویر
            </Button>
          </CardContent>
        </Card>

        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>واریانت‌ها *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="p-4 border border-border rounded-xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">واریانت {index + 1}</h4>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>سایز *</Label>
                    <Input
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                      placeholder="مثال: S, M, L"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رنگ *</Label>
                    <Input
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                      placeholder="مثال: قرمز"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>کد رنگ</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={variant.colorHex}
                        onChange={(e) => handleVariantChange(index, "colorHex", e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={variant.colorHex}
                        onChange={(e) => handleVariantChange(index, "colorHex", e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>موجودی *</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, "stock", parseInt(e.target.value) || 0)}
                      className="persian-number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                      placeholder="کد محصول"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>قیمت ویژه (اختیاری)</Label>
                    <Input
                      type="number"
                      value={variant.priceOverride || ""}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "priceOverride",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      className="persian-number"
                      placeholder="خالی = قیمت پایه"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addVariant}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن واریانت
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="btn-editorial" disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره محصول"}
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            انصراف
          </Button>
        </div>
      </form>
    </div>
  )
}

