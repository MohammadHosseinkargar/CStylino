import fs from "fs"
import path from "path"
import {
  PRODUCT_PLACEHOLDER_SRC,
  isRemoteImageSrc,
  normalizeLocalImageSrc,
  stripQueryAndHash,
} from "@/lib/product-image"

const isLocalImageSrc = (src: string) =>
  src.startsWith("/") && !src.startsWith("//") && !src.startsWith("data:")

const resolvePublicPath = (src: string) => {
  const cleaned = stripQueryAndHash(src).replace(/^\/+/, "")
  return path.join(process.cwd(), "public", cleaned)
}

export const normalizeProductImages = (images?: string[] | null) => {
  if (!images || images.length === 0) {
    return [PRODUCT_PLACEHOLDER_SRC]
  }

  return images.map((src) => {
    if (!src || src.trim().length === 0) {
      return PRODUCT_PLACEHOLDER_SRC
    }

    const normalized = normalizeLocalImageSrc(src.trim())

    if (!normalized) {
      return PRODUCT_PLACEHOLDER_SRC
    }

    if (isRemoteImageSrc(normalized) || normalized.startsWith("data:")) {
      return normalized
    }

    if (isLocalImageSrc(normalized)) {
      const publicPath = resolvePublicPath(normalized)
      return fs.existsSync(publicPath) ? normalized : PRODUCT_PLACEHOLDER_SRC
    }

    return PRODUCT_PLACEHOLDER_SRC
  })
}
