import { NavLink, useSearchParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

interface MainNavProps {
  mobileCallback?: () => void
}

export function MainNav({ mobileCallback }: MainNavProps) {
  const { user, activeWeddingId } = useSelector((state: RootState) => state.auth)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  
  const currentTab = searchParams.get('tab') || 'about'

  // If NOT logged in, show public landing tabs
  if (!user) {
    const publicLinks = [
      { tab: 'about', label: 'O nas' },
      { tab: 'services', label: 'Oferta' },
      { tab: 'gallery', label: 'Galeria' },
      { tab: 'contact', label: 'Kontakt' },
    ]

    return (
      <nav className="main-nav" aria-label="Nawigacja publiczna" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {publicLinks.map((link) => {
          const isActive = location.pathname === '/' && currentTab === link.tab
          return (
            <NavLink
              key={link.tab}
              to={`/?tab=${link.tab}`}
              onClick={mobileCallback}
              className={isActive ? 'active' : ''}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '999px',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.92rem',
                transition: 'all 0.2s'
              }}
            >
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    )
  }

  // If logged in but has NO active wedding event selected/created
  if (!activeWeddingId) {
    return (
      <nav className="main-nav" aria-label="Nawigacja zalogowanego" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <NavLink
          to="/"
          onClick={mobileCallback}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            color: 'var(--primary)',
            background: 'var(--primary-soft)',
            fontWeight: 600,
            fontSize: '0.92rem'
          }}
        >
          {user.role === 'planner' ? 'Wybór Wesela' : 'Panel'}
        </NavLink>
        <NavLink
          to="/settings"
          onClick={mobileCallback}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={({ isActive }) => ({
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            color: isActive ? 'var(--primary)' : 'var(--muted)',
            background: isActive ? 'var(--primary-soft)' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.92rem'
          })}
        >
          ⚙ Ustawienia
        </NavLink>
      </nav>
    )
  }

  // If logged in AND has an active wedding event
  const toolLinks = [
    { to: '/', label: 'Pulpit', end: true },
    { to: '/events', label: 'Harmonogram' },
    { to: '/tasks', label: 'Zadania' },
    { to: '/budget', label: 'Budżet' },
    { to: '/vendors', label: 'Dostawcy' },
    { to: '/guests', label: 'Goście' },
    { to: '/catering', label: 'Catering' },
    { to: '/settings', label: 'Ustawienia' },
  ]

  return (
    <nav className="main-nav" aria-label="Nawigacja organizacyjna" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {toolLinks.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={mobileCallback}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={({ isActive }) => ({
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            color: isActive ? 'var(--primary)' : 'var(--muted)',
            background: isActive ? 'var(--primary-soft)' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.92rem',
            transition: 'all 0.2s'
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
