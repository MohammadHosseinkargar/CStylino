"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowDown, ArrowUp, Link2, Upload, X } from "lucide-react"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024

type ImagePickerProps = {
  value: string[]
  onChange: (images: string[]) => void
  label?: string
  helperText?: string
}

export function ImagePicker({
  value,
  onChange,
  label = "تصاویر محصول",
  helperText = "برای نمایش بهتر، چند تصویر از زوایای مختلف اضافه کنید.",
}: ImagePickerProps) {
  const { toast } = useToast()
  const placeholderImage = "/placeholders/N1.png"
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")
  const [urlInput, setUrlInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const images = useMemo(() => value.filter((item) => item.trim()), [value])

  useEffect(() => {
    setImageErrors((prev) => {
      if (!Object.keys(prev).length) return prev
      const next: Record<string, boolean> = {}
      images.forEach((image) => {
        if (prev[image]) next[image] = true
      })
      return next
    })
  }, [images])

  const normalizeImageInput = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (/^blob:/i.test(trimmed) || /^file:\/\//i.test(trimmed)) return null
    if (/^[a-zA-Z]:[\\/]/.test(trimmed)) return null
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith("//")) return null
    const normalized = trimmed.replace(/\\/g, "/")
    return normalized.startsWith("/") ? normalized : `/${normalized}`
  }

  const addImage = (url: string) => {
    const normalized = normalizeImageInput(url)
    if (!normalized) {
      toast({
        title: "???? ???????",
        description: "?? ?????? ???? ????.",
        variant: "destructive",
      })
      return
    }
    if (images.includes(normalized)) {
      toast({
        title: "تصویر تکراری",
        description: "این تصویر قبلا اضافه شده است.",
        variant: "destructive",
      })
      return
    }
    onChange([...images, normalized])
  }

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    onChange(next)
  }

  const moveImage = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= images.length) return
    const next = [...images]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    onChange(next)
  }


  const uploadFile = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload")
      xhr.responseType = "json"

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        setUploadProgress(Math.round((event.loaded / event.total) * 100))
      }

      xhr.onload = () => {
        const response = xhr.response || {}
        if (xhr.status >= 200 && xhr.status < 300 && response.url) {
          resolve(response.url)
        } else {
          reject(response.error || "خطا در آپلود تصویر.")
        }
      }

      xhr.onerror = () => reject("ارتباط با سرور برقرار نشد.")

      xhr.send(formData)
    })
  }

  const handleUploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (!list.length) return

    for (const file of list) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({
          title: "فرمت نامعتبر",
          description: "فرمت های jpg، png و webp مجاز هستند.",
          variant: "destructive",
        })
        continue
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast({
          title: "حجم زیاد",
          description: "حداکثر حجم مجاز ۵ مگابایت است.",
          variant: "destructive",
        })
        continue
      }

      try {
        setIsUploading(true)
        setUploadProgress(0)
        const url = await uploadFile(file)
        addImage(url)
        toast({
          title: "آپلود شد",
          description: "تصویر با موفقیت اضافه شد.",
        })
      } catch (error: any) {
        toast({
          title: "خطا",
          description: error?.message || String(error),
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        setUploadProgress(null)
      }
    }
  }

  const handleUrlAdd = () => {
    const trimmed = urlInput.trim()
    if (!trimmed || !normalizeImageInput(trimmed)) {
      toast({
        title: "آدرس نامعتبر",
        description: "یک آدرس معتبر وارد کنید.",
        variant: "destructive",
      })
      return
    }
    addImage(trimmed)
    setUrlInput("")
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="space-y-2">
        <Label className="text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground">{helperText}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeTab === "upload" ? "default" : "outline"}
          className="gap-2"
          onClick={() => setActiveTab("upload")}
        >
          <Upload className="h-4 w-4" />
          آپلود فایل
        </Button>
        <Button
          type="button"
          variant={activeTab === "url" ? "default" : "outline"}
          className="gap-2"
          onClick={() => setActiveTab("url")}
        >
          <Link2 className="h-4 w-4" />
          لینک تصویر
        </Button>
      </div>

      {activeTab === "upload" ? (
        <div className="space-y-3">
          <div
            className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition ${
              isDragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragActive(false)
              if (event.dataTransfer.files?.length) {
                void handleUploadFiles(event.dataTransfer.files)
              }
            }}
          >
            <p className="text-sm font-medium">فایل را اینجا رها کنید</p>
            <p className="text-xs text-muted-foreground">یا برای انتخاب فایل کلیک کنید</p>
            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                انتخاب فایل
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  multiple
                  className="hidden"
                  disabled={isUploading}
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      void handleUploadFiles(event.target.files)
                      event.currentTarget.value = ""
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>در حال آپلود...</span>
                <span>{uploadProgress ?? 0}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress ?? 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            type="url"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          <Button type="button" onClick={handleUrlAdd} className="gap-2">
            افزودن
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {images.length === 0 ? (
          <p className="text-xs text-muted-foreground">هنوز تصویری اضافه نشده است.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="rounded-xl border border-border p-2">
                <div className="relative h-36 w-full overflow-hidden rounded-lg bg-muted sm:h-40 md:h-44">
                  <Image
                    src={imageErrors[image] ? placeholderImage : image}
                    alt={`product-image-${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                    onError={() => {
                      if (imageErrors[image]) return
                      setImageErrors((prev) => ({ ...prev, [image]: true }))
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      aria-label="جابجایی تصویر به بالا"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                      aria-label="جابجایی تصویر به پایین"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(index)}
                    aria-label="حذف تصویر"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {index === 0 && (
                  <p className="mt-1 text-center text-xs text-muted-foreground">تصویر اصلی</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
