export const PRODUCT_PLACEHOLDER_SRC = "/images/placeholder-product.jpg"

export const normalizeProductImageSrc = (src?: string | null) =>
  src && src.trim().length > 0 ? src : PRODUCT_PLACEHOLDER_SRC

export const isRemoteImageSrc = (src: string) => /^https?:\/\//i.test(src)

export const stripQueryAndHash = (src: string) => src.split(/[?#]/)[0]
