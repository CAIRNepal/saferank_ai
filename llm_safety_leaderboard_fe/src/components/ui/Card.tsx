import type { ReactNode } from 'react'

type Props = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function Card({ title, subtitle, actions, children }: Props) {
  return (
    <section className="card">
      {(title || subtitle || actions) && (
        <header className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
