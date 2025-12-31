import * as React from "react"

import { cn } from "@/lib/utils"

interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  kicker?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}

export function SectionHeader({
  kicker,
  title,
  subtitle,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        {kicker && (
          <div className="text-xs tracking-[0.3em] text-muted-foreground">
            {kicker}
          </div>
        )}
        <div className="text-title font-bold">{title}</div>
        {subtitle && <div className="text-body text-muted-foreground">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
