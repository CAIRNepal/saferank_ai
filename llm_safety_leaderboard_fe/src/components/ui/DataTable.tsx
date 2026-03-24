import type { ReactNode } from 'react'

type Column = {
  key: string
  title: string
}

type Row = {
  key: string
  cells: ReactNode[]
}

type Props = {
  columns: Column[]
  rows: Row[]
  onRowClick?: (key: string) => void
}

export function DataTable({ columns, rows, onRowClick }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              onClick={
                onRowClick
                  ? (e) => {
                      const target = e.target as HTMLElement
                      if (target.closest('a, button')) return
                      onRowClick(row.key)
                    }
                  : undefined
              }
              className={onRowClick ? 'table-row-clickable' : undefined}
            >
              {row.cells.map((cell, index) => (
                <td key={`${row.key}-${index}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
