import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface WishlistItem {
  productId: string
  slug: string
  name: string
  image?: string
}

interface WishlistStore {
  items: WishlistItem[]
  toggleItem: (item: WishlistItem) => void
  hasItem: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId)
        set({
          items: exists
            ? get().items.filter((i) => i.productId !== item.productId)
            : [...get().items, item],
        })
      },
      hasItem: (productId) => get().items.some((i) => i.productId === productId),
    }),
    {
      name: "stylino-wishlist",
    }
  )
)
