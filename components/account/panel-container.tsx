import * as React from "react"

import { cn } from "@/lib/utils"

type PanelContainerProps<T extends React.ElementType = "div"> = {
  as?: T
  className?: string
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">

export function PanelContainer<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: PanelContainerProps<T>) {
  const Comp = as ?? "div"
  return (
    <Comp
      className={cn(
        "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 pb-[calc(var(--mobile-bottom-nav-height)+1.5rem)] md:pb-8",
        className
      )}
      {...props}
    />
  )
}
