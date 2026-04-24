import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Panel' },
  { to: '/events', label: 'Harmonogram' },
  { to: '/tasks', label: 'Zadania' },
  { to: '/budget', label: 'Budzet' },
  { to: '/vendors', label: 'Dostawcy' },
  { to: '/guests', label: 'Goscie' },
]

export function MainNav() {
  return (
    <nav className='main-nav' aria-label='Nawigacja glowna'>
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? 'active' : '')}
          end={item.to === '/'}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
