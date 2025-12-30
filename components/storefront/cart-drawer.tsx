"use client"

import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"
import Link from "next/link"
import { X, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/storefront/price"
import { cn, formatPrice } from "@/lib/utils"
import { fa } from "@/lib/copy/fa"

interface CartDrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export function CartDrawer({ open, onOpenChange, children }: CartDrawerProps) {
  const { items, removeItem, getTotal } = useCartStore()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content
          dir="rtl"
          className={cn(
            "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl border-l border-border/40",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-border/40">
              <Dialog.Title className="text-lg font-bold">{fa.cart.title}</Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              {items.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">{fa.cart.emptyTitle}</div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex gap-3 rounded-2xl border border-border/40 p-3 bg-background/60"
                    >
                      <Link
                        href={`/store/products/${item.slug || item.productId}`}
                        className="relative h-20 w-16 rounded-xl overflow-hidden bg-muted/20 flex-shrink-0"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/store/products/${item.slug || item.productId}`}>
                          <div className="font-semibold text-sm line-clamp-2">{item.productName}</div>
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.variantSize} / {item.variantColor}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground persian-number">
                            {fa.cart.quantityHeader}: {item.quantity}
                          </span>
                          <Price price={item.price * item.quantity} size="sm" />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={fa.cart.removeItem}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/40 px-5 sm:px-6 py-4 space-y-4 bg-background">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{fa.cart.itemsTotal}</span>
                <span className="font-semibold persian-number">{formatPrice(getTotal())}</span>
              </div>
              <Link href="/store/cart" className="block">
                <Button className="w-full btn-editorial h-12">{fa.cart.checkout}</Button>
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
