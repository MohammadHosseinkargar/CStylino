"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"

interface DeleteProductButtonProps {
  productId: string
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "خطا در حذف محصول")
      }

      toast({
        title: "حذف شد",
        description: "محصول حذف شد.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در حذف محصول",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="w-4 h-4 ml-2" />
      حذف
    </Button>
  )
}
