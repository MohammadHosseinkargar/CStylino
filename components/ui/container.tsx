import * as React from "react"

import { cn } from "@/lib/utils"

type ContainerProps<T extends React.ElementType = "div"> = {
  as?: T
  className?: string
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">

export function Container<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Comp = as ?? "div"
  return (
    <Comp
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
}
