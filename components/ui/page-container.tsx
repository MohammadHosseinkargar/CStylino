import * as React from "react"

import { cn } from "@/lib/utils"

type PageContainerProps<T extends React.ElementType = "div"> = {
  as?: T
  className?: string
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">

export function PageContainer<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: PageContainerProps<T>) {
  const Comp = as ?? "div"
  return <Comp className={cn("page-container", className)} {...props} />
}
