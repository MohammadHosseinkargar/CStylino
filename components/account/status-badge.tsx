import * as React from "react"

import { cn } from "@/lib/utils"

type StatusVariant = "success" | "info" | "warning" | "neutral" | "danger"

type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusVariant
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  neutral: "bg-slate-50 text-slate-700 border-slate-100",
  danger: "bg-red-50 text-red-700 border-red-100",
}

export function StatusBadge({
  variant = "neutral",
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
