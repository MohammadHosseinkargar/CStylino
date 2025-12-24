import * as React from "react"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableColumn = {
  key: string
  header: React.ReactNode
  className?: string
}

interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn[]
  data: T[]
  renderRow: (item: T) => React.ReactNode
  emptyState?: React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  renderRow,
  emptyState,
  className,
  ...props
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-border/60", className)} {...props}>
      {data.length === 0 && emptyState ? (
        <div className="p-10">{emptyState}</div>
      ) : (
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{data.map((item) => renderRow(item))}</TableBody>
        </Table>
      )}
    </div>
  )
}
