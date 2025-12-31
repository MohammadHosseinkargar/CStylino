"use client"

import Image, { type ImageProps } from "next/image"
import { useEffect, useState } from "react"
import {
  PRODUCT_PLACEHOLDER_SRC,
  normalizeProductImageSrc,
} from "@/lib/product-image"

type ProductImageProps = Omit<ImageProps, "src"> & {
  src?: string | null
}

export function ProductImage({
  src,
  alt = "",
  onError,
  ...props
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() =>
    normalizeProductImageSrc(src)
  )

  useEffect(() => {
    setCurrentSrc(normalizeProductImageSrc(src))
  }, [src])

  const handleError: ImageProps["onError"] = (event) => {
    onError?.(event)
    setCurrentSrc((prev) =>
      prev === PRODUCT_PLACEHOLDER_SRC ? prev : PRODUCT_PLACEHOLDER_SRC
    )
  }

  return <Image {...props} src={currentSrc} alt={alt} onError={handleError} />
}
