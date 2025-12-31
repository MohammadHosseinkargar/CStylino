import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LuxuryButtonProps = ButtonProps & {
  tone?: "primary" | "ghost"
}

export function LuxuryButton({
  tone = "primary",
  className,
  ...props
}: LuxuryButtonProps) {
  return (
    <Button
      {...props}
      variant={tone === "ghost" ? "ghost" : "default"}
      className={cn(
        "h-14 rounded-2xl px-9 text-base tracking-tight",
        tone === "primary"
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary/90"
          : "border border-border bg-background/70 text-foreground hover:bg-accent/40",
        className
      )}
    />
  )
}
