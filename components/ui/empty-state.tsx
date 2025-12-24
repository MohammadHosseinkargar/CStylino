import * as React from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-sm">
          {icon}
        </div>
      )}
      <div className="text-title font-semibold">{title}</div>
      {description && <div className="mt-2 text-body text-muted-foreground">{description}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
