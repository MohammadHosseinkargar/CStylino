import Image from "next/image"
import { cn } from "@/lib/utils"
import { SurfaceCard } from "@/components/ui/surface-card"
import { fa } from "@/lib/copy/fa"

type ProductPreviewCardProps = {
  title: string
  price: number
  image: string
  className?: string
}

export function ProductPreviewCard({
  title,
  price,
  image,
  className,
}: ProductPreviewCardProps) {
  return (
    <SurfaceCard className={cn("group overflow-hidden", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
        <Image
          src={image}
          alt={title}
          width={900}
          height={1125}
          quality={100}
          className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold leading-relaxed text-foreground">{title}</h3>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span dir="ltr" className="persian-number">
            {price.toLocaleString("fa-IR")}
          </span>
          <span>{fa.common.currency}</span>
        </div>
      </div>
    </SurfaceCard>
  )
}
