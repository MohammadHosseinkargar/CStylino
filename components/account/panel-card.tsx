import * as React from "react"

import { cn } from "@/lib/utils"

type PanelCardProps = React.HTMLAttributes<HTMLDivElement>

export const PanelCard = React.forwardRef<HTMLDivElement, PanelCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm",
        "p-5 sm:p-6",
        className
      )}
      {...props}
    />
  )
)
PanelCard.displayName = "PanelCard"
