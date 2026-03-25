import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { Modal } from '../../components/ui/Modal'
import cairNepalLogo from '../../assets/cair-nepal-logo.png'

const navItems = [
  { to: '/saferank_ai/', label: 'Overview' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/arena', label: 'Arena' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/changelog', label: 'Changelog' },
]

type Props = {
  children: ReactNode
}

function ShieldLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M16 3L4 8v8c0 6.627 5.148 11.956 12 13 6.852-1.044 12-6.373 12-13V8L16 3z"
        fill="var(--accent)"
        opacity="0.18"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M11 16.5l3.5 3.5 7-7"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function AppShell({ children }: Props) {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  // Close mobile nav on Escape
  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNavOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="shell-outer">
      <header className="site-header" role="banner">
        <div className="app-shell header-inner">
          {/* Brand */}
          <NavLink to="/saferank_ai/" className="brand-link" aria-label="SafeRank AI — home">
            <ShieldLogo />
            <div>
              <span className="brand-name">SafeRank AI</span>
              <span className="brand-tagline">LLM Safety Leaderboard</span>
            </div>
          </NavLink>

          {/* Nav + actions */}
          <div className="header-right">
            <nav className="main-nav" aria-label="Primary navigation">
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

            <div className="header-actions">
              <button
                className="icon-button"
                onClick={() => setIsDark((d) => !d)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
              <button
                className="button button-ghost button-sm"
                onClick={() => setIsDownloadOpen(true)}
                title="Export report"
              >
                ↓ Report
              </button>
              <NavLink className="button button-primary button-sm" to="/submit">
                Submit model
              </NavLink>
              {/* Hamburger — mobile only */}
              <button
                className="icon-button hamburger-btn"
                onClick={() => setMobileNavOpen((o) => !o)}
                aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileNavOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <div className="app-shell mobile-nav-inner">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink className="mobile-nav-link mobile-nav-submit" to="/submit">
                Submit model
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="app-shell content" role="main">
        {children}
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="app-shell footer-inner">
          <div className="footer-brand">
            <a
              href="https://cair-nepal.org"
              target="_blank"
              rel="noopener noreferrer"
              className="cair-logo-link"
              aria-label="CAIR-Nepal — visit website"
            >
              <img
                src={cairNepalLogo}
                alt="CAIR-Nepal"
                className="cair-logo"
                loading="lazy"
              />
            </a>
            <p className="text-muted footer-copy">
              SafeRank AI is a project by{' '}
              <a
                href="https://cair-nepal.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                CAIR-Nepal
              </a>
              . Evaluation results are public and reproducible.
            </p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <NavLink className="text-link" to="/methodology">Methodology</NavLink>
            <NavLink className="text-link" to="/submit">Submit a model</NavLink>
            <NavLink className="text-link" to="/changelog">Changelog</NavLink>
          </nav>
        </div>
      </footer>

      <Modal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} title="Export report">
        <p className="text-muted">
          Export is currently in preview mode. The final release will include a privacy-safe, versioned report
          package in CSV and JSON formats.
        </p>
        <div className="inline-gap" style={{ marginTop: '16px' }}>
          <button className="button button-secondary" disabled>Download CSV</button>
          <button className="button button-secondary" disabled>Download JSON</button>
        </div>
      </Modal>
    </div>
  )
}
