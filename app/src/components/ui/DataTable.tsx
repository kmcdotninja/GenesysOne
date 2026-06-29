import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { EmptyState } from './misc'

export interface Column<Row> {
  key: string
  header: ReactNode
  align?: 'left' | 'right' | 'center'
  cell: (row: Row) => ReactNode
  headClassName?: string
  cellClassName?: string
}

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  rowId,
  rowClassName,
  onRowClick,
  empty,
}: {
  columns: Column<Row>[]
  rows: Row[]
  rowKey: (row: Row, index: number) => string
  rowId?: (row: Row, index: number) => string
  rowClassName?: (row: Row, index: number) => string
  onRowClick?: (row: Row) => void
  empty?: ReactNode
}) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-hair">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-3 pb-3 text-xs font-medium text-forest-400',
                  alignClass[col.align ?? 'left'],
                  col.headClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6">
                {empty ?? (
                  <EmptyState
                    compact
                    variant="search"
                    title="Nothing here yet"
                    description="Items will show up here once they're added."
                  />
                )}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              id={rowId?.(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-hair/60 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-panel/70',
                rowClassName?.(row, i),
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-3 py-4 text-sm text-forest-500 align-middle',
                    alignClass[col.align ?? 'left'],
                    col.cellClassName,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
