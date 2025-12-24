import * as React from "react"

import { cn } from "@/lib/utils"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements
}

export function PageContainer({
  as: Comp = "div",
  className,
  ...props
}: PageContainerProps) {
  return <Comp className={cn("page-container", className)} {...props} />
}
