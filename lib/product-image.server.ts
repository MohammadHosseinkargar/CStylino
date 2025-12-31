import fs from "fs"
import path from "path"
import {
  PRODUCT_PLACEHOLDER_SRC,
  isRemoteImageSrc,
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

    if (isRemoteImageSrc(src) || src.startsWith("data:")) {
      return src
    }

    if (isLocalImageSrc(src)) {
      const publicPath = resolvePublicPath(src)
      return fs.existsSync(publicPath) ? src : PRODUCT_PLACEHOLDER_SRC
    }

    return PRODUCT_PLACEHOLDER_SRC
  })
}
