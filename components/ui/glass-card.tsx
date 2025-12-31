import * as React from "react"

import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border/50 bg-background/70 shadow-md backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
)
GlassCard.displayName = "GlassCard"
