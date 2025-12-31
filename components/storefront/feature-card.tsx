import * as React from "react"
import { cn } from "@/lib/utils"
import { SurfaceCard } from "@/components/ui/surface-card"

type FeatureCardProps = {
  title: string
  body: string
  icon: React.ReactNode
  className?: string
}

export function FeatureCard({ title, body, icon, className }: FeatureCardProps) {
  return (
    <SurfaceCard className={cn("p-8 sm:p-10 text-center", className)}>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-3 text-title font-bold">{title}</h3>
      <p className="text-body text-muted-foreground leading-relaxed">{body}</p>
    </SurfaceCard>
  )
}
