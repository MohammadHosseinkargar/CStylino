import * as React from "react"

import { cn } from "@/lib/utils"

interface ListCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
}

export function ListCard({
  title,
  subtitle,
  meta,
  actions,
  className,
  children,
  ...props
}: ListCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-5 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {title && <div className="text-subtitle font-semibold">{title}</div>}
          {subtitle && <div className="text-caption text-muted-foreground">{subtitle}</div>}
        </div>
        {meta && <div className="text-caption text-muted-foreground">{meta}</div>}
      </div>
      {children && <div className="mt-4 space-y-2 text-body">{children}</div>}
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
