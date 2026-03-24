import type { ReactNode } from 'react'

type Props = {
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: Props) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
