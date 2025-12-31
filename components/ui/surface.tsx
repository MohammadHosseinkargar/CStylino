import * as React from "react"

import { cn } from "@/lib/utils"

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl border border-border/50 bg-card shadow-sm", className)}
      {...props}
    />
  )
)
Surface.displayName = "Surface"
