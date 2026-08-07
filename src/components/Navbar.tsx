import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const links = [
  { to: '/', label: 'Portal', exact: true },
  { to: '/caen', label: 'CAEN Rev. 3', exact: false },
  { to: '/siruta', label: 'SIRUTA', exact: false },
  { to: '/firme', label: 'Firme', exact: false },
  { to: '/conversie-caen', label: 'Conversie CAEN v2–v3', exact: false },
  { to: '/schimb', label: 'Curs Valutar', exact: false },
  { to: '/coduri-postale', label: 'Coduri Poștale', exact: false },
  { to: '/zile-libere', label: 'Zile Libere', exact: false },
  { to: '/documentatie', label: 'Documentație API', exact: false },
  { to: '/despre', label: 'Despre', exact: false },
]

function NavItem({ to, label, exact, onClick }: { to: string; label: string; exact: boolean; onClick?: () => void }) {
  const id = `nav-link-${to.replace(/\//g, '').replace(/[^a-z0-9-]/gi, '-') || 'portal'}`
  return (
    <NavLink
      id={id}
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        isActive
          ? 'text-blue-600 font-medium'
          : 'text-gray-600 hover:text-gray-900 transition-colors'
      }
    >
      {label}
    </NavLink>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header id="navbar" className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <nav id="navbar-inner" className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <NavLink
          id="navbar-logo"
          to="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Date Deschise România" className="h-8 w-auto" />
        </NavLink>

        {/* Desktop links */}
        <ul id="navbar-desktop-links" className="hidden items-center gap-7 text-sm sm:flex">
          {links.map(l => (
            <li key={l.to}>
              <NavItem to={l.to} label={l.label} exact={l.exact} />
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          id="navbar-hamburger"
          className="flex items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 sm:hidden"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Închide meniul' : 'Deschide meniul'}
          aria-expanded={open}
          aria-controls="navbar-mobile-links"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul id="navbar-mobile-links" className="flex flex-col border-t border-gray-100 px-6 pb-4 pt-2 text-sm sm:hidden gap-1">
          {links.map(l => (
            <li key={l.to}>
              <NavItem
                to={l.to}
                label={l.label}
                exact={l.exact}
                onClick={() => setOpen(false)}
              />
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
