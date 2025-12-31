import * as React from "react"

import { cn } from "@/lib/utils"
import { Surface } from "@/components/ui/surface"

export interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SurfaceCard = React.forwardRef<HTMLDivElement, SurfaceCardProps>(
  ({ className, ...props }, ref) => (
    <Surface
      ref={ref}
      className={cn(
        "rounded-[1.6rem] border-border/40 bg-card/90 shadow-md",
        className
      )}
      {...props}
    />
  )
)
SurfaceCard.displayName = "SurfaceCard"
