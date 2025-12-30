import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { fa } from "@/lib/copy/fa"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type FormatPriceOptions = {
  usePersianDigits?: boolean
}

export function formatPrice(price: number, options: FormatPriceOptions = {}): string {
  const { usePersianDigits = true } = options
  const locale = usePersianDigits ? "fa-IR" : "en-US"
  return (
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(price) + ` ${fa.common.currency}`
  )
}

export function generateAffiliateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}
