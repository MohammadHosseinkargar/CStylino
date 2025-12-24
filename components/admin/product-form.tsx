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

interface VariantForm {
  id?: string
  size: string
  color: string
  colorHex: string
  stock: number
  sku: string
  priceOverride?: number | null
}

interface ProductFormData {
  name: string
  nameEn: string
  slug: string
  description: string
  descriptionEn: string
  basePrice: string
  categoryId: string
  images: string[]
  isActive: boolean
  featured: boolean
}

interface ProductFormProps {
  initialData?: {
    id: string
    name: string
    nameEn?: string | null
    slug: string
    description?: string | null
    descriptionEn?: string | null
    basePrice: number
    categoryId: string
    images: string[]
    isActive: boolean
    featured: boolean
    variants: VariantForm[]
  }
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = Boolean(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    name: initialData?.name ?? "",
    nameEn: initialData?.nameEn ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    descriptionEn: initialData?.descriptionEn ?? "",
    basePrice: initialData ? String(initialData.basePrice) : "",
    categoryId: initialData?.categoryId ?? "",
    images: initialData?.images?.length ? initialData.images : [""],
    isActive: initialData?.isActive ?? true,
    featured: initialData?.featured ?? false,
  }))
  const [variants, setVariants] = useState<VariantForm[]>(() => {
    if (initialData?.variants?.length) {
      return initialData.variants.map((variant) => ({
        ...variant,
        priceOverride: variant.priceOverride ?? null,
      }))
    }
    return [{ size: "", color: "", colorHex: "#000000", stock: 0, sku: "" }]
  })

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories")
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

  const handleVariantChange = (
    index: number,
    field: keyof VariantForm,
    value: string | number | null
  ) => {
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
      if (!formData.name || !formData.slug || !formData.basePrice || !formData.categoryId) {
        toast({
          title: "Error",
          description: "Name, slug, base price, and category are required.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (variants.length === 0 || variants.some((v) => !v.size || !v.color || !v.sku)) {
        toast({
          title: "Error",
          description: "All variants must include size, color, and SKU.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (formData.images.filter((img) => img.trim()).length === 0) {
        toast({
          title: "Error",
          description: "At least one image is required.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const productData = {
        ...formData,
        basePrice: parseInt(formData.basePrice, 10),
        images: formData.images.filter((img) => img.trim()),
        variants: variants.map((variant) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          stock: Number(variant.stock),
          sku: variant.sku,
          priceOverride:
            variant.priceOverride === null || variant.priceOverride === undefined
              ? null
              : Number(variant.priceOverride),
        })),
      }

      const res = await fetch(
        isEdit ? `/api/admin/products/${initialData?.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        }
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save product")
      }

      toast({
        title: "Success",
        description: isEdit ? "Product updated." : "Product created.",
      })

      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          {isEdit ? "Edit Product" : "Create New Product"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit ? "Update the product details." : "Fill in the details to create a product."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">Product Name (English)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (Toman) *</Label>
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
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
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
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="Image URL"
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
              Add Image
            </Button>
          </CardContent>
        </Card>

        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>Variants *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((variant, index) => (
              <div key={variant.id ?? index} className="p-4 border border-border rounded-xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Variant {index + 1}</h4>
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
                    <Label>Size *</Label>
                    <Input
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                      placeholder="e.g. S, M, L"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color *</Label>
                    <Input
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                      placeholder="e.g. Red"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color Hex</Label>
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
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(index, "stock", parseInt(e.target.value, 10) || 0)
                      }
                      className="persian-number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                      placeholder="Unique SKU"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price Override</Label>
                    <Input
                      type="number"
                      value={variant.priceOverride ?? ""}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "priceOverride",
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      className="persian-number"
                      placeholder="Leave empty to use base price"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addVariant}>
              <Plus className="w-4 h-4 ml-2" />
              Add Variant
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="btn-editorial" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
