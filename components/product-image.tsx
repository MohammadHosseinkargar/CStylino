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
  onError,
  ...props
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() =>
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

  return <Image {...props} src={currentSrc} onError={handleError} />
}
