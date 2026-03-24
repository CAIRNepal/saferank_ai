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
}

export function DataTable({ columns, rows }: Props) {
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
            <tr key={row.key}>
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
