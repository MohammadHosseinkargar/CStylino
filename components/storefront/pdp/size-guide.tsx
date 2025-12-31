import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { Ruler } from "lucide-react"
import { fa } from "@/lib/copy/fa"

export function SizeGuide() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="ghost" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
          <Ruler className="me-2 h-4 w-4" />
          {fa.pdp.sizeGuide}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-background p-6 shadow-2xl">
          <Dialog.Title className="text-title font-bold text-center mb-4">
            {fa.pdp.sizeGuide}
          </Dialog.Title>
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-sm text-center">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3">سایز</th>
                  <th className="p-3">دور سینه (سانتی‌متر)</th>
                  <th className="p-3">دور کمر (سانتی‌متر)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/50">
                  <td className="p-3 font-semibold">S</td>
                  <td className="p-3">82-86</td>
                  <td className="p-3">62-66</td>
                </tr>
                <tr className="border-t border-border/50">
                  <td className="p-3 font-semibold">M</td>
                  <td className="p-3">86-90</td>
                  <td className="p-3">66-70</td>
                </tr>
                <tr className="border-t border-border/50">
                  <td className="p-3 font-semibold">L</td>
                  <td className="p-3">90-94</td>
                  <td className="p-3">70-74</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Dialog.Close asChild>
            <Button className="mt-5 w-full">{fa.pdp.close}</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
