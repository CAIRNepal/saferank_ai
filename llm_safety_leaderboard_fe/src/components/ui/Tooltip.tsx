import type { ReactNode } from 'react'

type Props = {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: Props) {
  return (
    <span className="tooltip" tabIndex={0} aria-label={content} data-tip={content}>
      {children}
    </span>
  )
}
