import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const styledCardVariants = cva(
  "border border-border/60 bg-card text-card-foreground transition-shadow duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-md hover:shadow-lg",
        subtle: "bg-muted/40 shadow-none",
        glass: "bg-background/70 backdrop-blur-sm shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StyledCardProps
  extends React.ComponentPropsWithoutRef<typeof Card>,
    VariantProps<typeof styledCardVariants> {}

export const StyledCard = React.forwardRef<HTMLDivElement, StyledCardProps>(
  ({ className, variant, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(styledCardVariants({ variant }), className)}
      {...props}
    />
  )
)
StyledCard.displayName = "StyledCard"
