import type { ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'neutral' | 'positive' | 'warning' | 'danger' | 'info'

type Props = {
  variant?: Variant
  children: ReactNode
}

export function Badge({ variant = 'neutral', children }: Props) {
  return <span className={clsx('badge', `badge-${variant}`)}>{children}</span>
}
