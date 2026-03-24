import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'

const navItems = [
  { to: '/overview', label: 'Overview' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/arena', label: 'Arena' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/changelog', label: 'Changelog' },
]

type Props = {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="app-header" role="banner">
        <div>
          <p className="eyebrow">Bias & Safety LLM Leaderboard</p>
          <h1 className="site-title">Trust-first model evaluation</h1>
        </div>
        <div className="header-actions">
          <NavLink className="button button-secondary" to="/arena">
            Compare models
          </NavLink>
          <button className="button button-primary" onClick={() => setIsDownloadOpen(true)}>
            Download report
          </button>
        </div>
      </header>

      <nav className="main-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="content" role="main">
        {children}
      </main>

      <Modal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} title="Report export">
        <p className="text-muted">
          Export is currently in placeholder mode. Final release will include a privacy-safe, versioned
          report package.
        </p>
      </Modal>
    </div>
  )
}
