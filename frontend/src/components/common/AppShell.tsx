import { useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import { logout, setActiveWeddingId } from '../../store/slices/authSlice'
import { MainNav } from './MainNav'

export function AppShell() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, activeWeddingId, weddings } = useSelector((state: RootState) => state.auth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeWedding = weddings.find(w => w.id === activeWeddingId)

  const handleLogout = () => {
    dispatch(logout())
    setMobileMenuOpen(false)
    navigate('/')
  }

  const handleBackToPlanner = () => {
    dispatch(setActiveWeddingId(null))
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, var(--bg-accent), var(--bg))', display: 'flex', flexDirection: 'column' }}>
      
      {/* Premium Top Brand/Nav Bar */}
      <header style={{
        background: 'rgba(255, 255, 253, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(47, 42, 36, 0.03)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.9rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>✨</span>
              <strong style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.25rem',
                letterSpacing: '0.04em',
                color: 'var(--text)',
                fontWeight: 600
              }}>
                WEDDING PLANNER
              </strong>
            </Link>
            
            {/* active wedding indicator in header */}
            {activeWedding && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--primary-soft)',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 600,
                border: '1px solid rgba(184, 90, 31, 0.15)',
                marginLeft: '0.5rem'
              }}>
                <span style={{ fontSize: '0.75rem' }}>💍</span>
                <span>{activeWedding.name}</span>
                {user?.role === 'planner' && (
                  <button 
                    onClick={handleBackToPlanner}
                    title="Zmień wesele"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '0 0 0 4px',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav-container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <MainNav />
            
            {/* User Auth actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {user.role === 'planner' ? 'Wedding Planner' : 'Para Młoda'}
                    </div>
                  </div>
                  
                  {/* Avatar bubble */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: user.role === 'planner' ? 'var(--primary)' : 'var(--primary-soft)',
                    color: user.role === 'planner' ? '#fff' : 'var(--primary)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: '1px solid var(--border)'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#c53030'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                  >
                    Wyloguj
                  </button>
                </div>
              ) : (
                <Link 
                  to="/auth" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '999px',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  Strefa Klienta
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Hamburger menu button */}
          <button 
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none', // Shown in CSS media queries
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--text)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <line x1="18" y1="6" x2="6" y2="18"></line>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>

        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          zIndex: 99,
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <MainNav mobileCallback={() => setMobileMenuOpen(false)} />
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '8px',
                    background: '#fff5f5',
                    color: '#c53030',
                    border: '1px solid #fed7d7',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Wyloguj się
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                Zaloguj się / Rejestracja
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="app-shell" style={{
        flex: 1,
        width: 'min(1200px, 100% - 2rem)',
        margin: '1.5rem auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '22px',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="app-shell__content" style={{ padding: '2rem', flex: 1 }}>
          <Outlet />
        </div>
      </main>

      {/* Luxury Footer */}
      <footer style={{
        background: '#fff',
        borderTop: '1px solid var(--border)',
        padding: '2.5rem 1.5rem',
        marginTop: 'auto',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.2rem', letterSpacing: '0.04em', color: 'var(--text)' }}>
            ✨ WEDDING PLANNER ✨
          </span>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', fontFamily: 'sans-serif' }}>
            © {new Date().getFullYear()} Premium Wedding Planner Pro. Wszelkie prawa zastrzeżone.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'sans-serif', marginTop: '0.5rem' }}>
            <Link to="/rsvp" style={{ textDecoration: 'underline' }}>RSVP dla Gości</Link>
            <span>•</span>
            <Link to="/" style={{ textDecoration: 'underline' }}>O nas</Link>
            <span>•</span>
            <Link to="/auth" style={{ textDecoration: 'underline' }}>Panel Managera</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
