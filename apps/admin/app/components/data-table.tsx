import { cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@einao/ui'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { type ReactNode, useState } from 'react'

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Stable key for each row (defaults to row index ... pass a function for stable React keys). */
  getRowId?: (row: TData, index: number) => string
  /** Initial sort state. */
  initialSorting?: SortingState
  /** Rendered inside the table when `data` is empty. */
  emptyState?: ReactNode
  /** Optional row click handler. */
  onRowClick?: (row: Row<TData>) => void
  /** Extra class for the outer Table element. */
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  initialSorting = [],
  emptyState,
  onRowClick,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  })

  if (data.length === 0 && emptyState) {
    return <div className="px-6 py-16 text-center text-sm text-muted-foreground">{emptyState}</div>
  }

  return (
    <div className="data-table-wrapper overflow-x-auto">
      <Table className={cn('min-w-[600px] sm:min-w-0', className)}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort()
              const sortDir = header.column.getIsSorted()
              const meta = header.column.columnDef.meta as { headerClassName?: string } | undefined

              return (
                <TableHead
                  key={header.id}
                  className={cn(meta?.headerClassName, canSort && 'cursor-pointer select-none')}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                >
                  {header.isPlaceholder ? null : (
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && <SortIcon direction={sortDir === false ? null : sortDir} />}
                    </span>
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          const clickable = Boolean(onRowClick)
          return (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
              className={clickable ? 'cursor-pointer' : undefined}
              onClick={clickable ? () => onRowClick?.(row) : undefined}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as { cellClassName?: string } | undefined
                return (
                  <TableCell key={cell.id} className={meta?.cellClassName}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
      </Table>
    </div>
  )
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (direction === 'asc') return <ArrowUp className="size-3.5 text-foreground" />
  if (direction === 'desc') return <ArrowDown className="size-3.5 text-foreground" />
  return <ChevronsUpDown className="size-3.5 text-muted-foreground/50" />
}
