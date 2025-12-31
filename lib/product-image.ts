export const PRODUCT_PLACEHOLDER_SRC = "/images/placeholder-product.jpg"

export const normalizeLocalImageSrc = (src?: string | null): string | null => {
  if (!src) return null
  if (src.startsWith("/") || src.startsWith("//") || src.startsWith("data:")) {
    return src
  }
  if (isRemoteImageSrc(src)) {
    return src
  }
  return `/${src}`
}

export const normalizeProductImageSrc = (src?: string | null): string => {
  if (!src || src.trim().length === 0) {
    return PRODUCT_PLACEHOLDER_SRC
  }
  return normalizeLocalImageSrc(src.trim()) ?? PRODUCT_PLACEHOLDER_SRC
}

export const isRemoteImageSrc = (src: string) => /^https?:\/\//i.test(src)

export const stripQueryAndHash = (src: string) => src.split(/[?#]/)[0]
