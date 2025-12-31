"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "framer-motion"

const persianDigits = "۰۱۲۳۴۵۶۷۸۹"
const arabicDigits = "٠١٢٣٤٥٦٧٨٩"

const toLatinDigits = (value: string) =>
  value
    .split("")
    .map((char) => {
      const persianIndex = persianDigits.indexOf(char)
      if (persianIndex >= 0) return String(persianIndex)
      const arabicIndex = arabicDigits.indexOf(char)
      if (arabicIndex >= 0) return String(arabicIndex)
      return char
    })
    .join("")

const parseNumericValue = (value: string) => {
  const normalized = toLatinDigits(value)
  const match = normalized.match(/[\d.]+/)
  if (!match) return null
  const numberValue = Number(match[0])
  if (Number.isNaN(numberValue)) return null
  const suffix = normalized.replace(match[0], "").trim()
  return { numberValue, suffix, decimals: match[0].includes(".") ? 1 : 0 }
}

type AnimatedCounterProps = {
  value: string
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px" })
  const parsed = useMemo(() => parseNumericValue(value), [value])
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!inView) {
      return
    }
    if (!parsed) {
      setDisplay(value)
      return
    }

    if (prefersReducedMotion) {
      const formatted = parsed.numberValue.toLocaleString("fa-IR", {
        maximumFractionDigits: parsed.decimals,
      })
      setDisplay(`${formatted}${parsed.suffix ? parsed.suffix : ""}`)
      return
    }

    const controls = animate(0, parsed.numberValue, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => {
        const formatted = latest.toLocaleString("fa-IR", {
          maximumFractionDigits: parsed.decimals,
        })
        setDisplay(`${formatted}${parsed.suffix ? parsed.suffix : ""}`)
      },
    })

    return () => controls.stop()
  }, [inView, parsed, prefersReducedMotion, value])

  return (
    <span className={className} dir="ltr" ref={ref}>
      {display}
    </span>
  )
}
