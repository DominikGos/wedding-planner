import { useEffect, useState } from 'react'
import { Outlet, useNavigate, Link, useLocation, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { RootState } from '../../store'
import { getEvents, toWedding } from '../../api/eventApi'
import { logout, setActiveWeddingId, setEvents, setEventsError, setEventsLoading } from '../../store/slices/authSlice'
import { MainNav } from './MainNav'
import { NotificationsPanel } from './NotificationsPanel'

export function AppShell() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const { user, token, activeWeddingId, weddings } = useSelector((state: RootState) => state.auth)


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => (
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  ))
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
    window.dispatchEvent(new Event('theme:change'))
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'pl' ? 'en' : 'pl'
    void i18n.changeLanguage(nextLang)
  }

  const activeWedding = weddings.find(w => w.id === activeWeddingId)
  const userDisplayName = user?.email?.split('@')[0] || t('common.user')

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout())
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    
    document.documentElement.removeAttribute('data-theme')

    const syncTheme = () => {
      setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')
    }

    window.addEventListener('theme:change', syncTheme)
    window.addEventListener('storage', syncTheme)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
      window.removeEventListener('theme:change', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [dispatch])

  useEffect(() => {
    if (!user || !token) return
    let active = true

    const loadEvents = async () => {
      dispatch(setEventsLoading())

      try {
        const events = await getEvents({ token })
        if (!active) return
        const weddings = events.map(toWedding)
        dispatch(setEvents(weddings))
        if (weddings.length === 0 && user?.role === 'couple') {
          navigate('/events/new', { replace: true })
        }
      } catch {
        if (active) {
          dispatch(setEventsError('Nie udało się pobrać wydarzeń z backendu.'))
        }
      }
    }

    void loadEvents()
    return () => {
      active = false
    }
  }, [dispatch, navigate, token, user])

  if ((!user || !token) && pathname !== '/') {
    return <Navigate to="/login?tab=login" replace />
  }

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
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, var(--bg-accent), var(--bg))', display: 'flex', flexDirection: 'column' }}>
      
      {/* Premium Top Brand/Nav Bar */}
      <header className='app-header' style={{
        background: 'rgba(255, 255, 253, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(47, 42, 36, 0.03)'
      }}>
        <style>
          {`
            .center-header-section .main-nav {
              flex-wrap: nowrap !important;
              white-space: nowrap;
              align-items: center;
              justify-content: center;
              gap: 0.45rem !important;
            }

            .center-header-section .main-nav a {
              padding: 0.4rem 0.7rem !important;
              white-space: nowrap;
            }
          `}
        </style>
        <div className="app-header-grid" style={{
          width: '100%',
          maxWidth: 'none',
          padding: '0.9rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {/* Brand Logo */}
          <div className="app-header-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
            <div className="app-brand-stack">
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
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
              {activeWedding && (
                <span className="mobile-wedding-name">
                  {activeWedding.name}
                </span>
              )}
            </div>
            
            {/* active wedding indicator in header */}
            {activeWedding && (
              <div className="active-wedding-pill" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                background: 'var(--primary-soft)',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 600,
                border: '1px solid rgba(184, 90, 31, 0.15)',
                marginLeft: 0,
                maxWidth: '180px',
                flexShrink: 1,
                minWidth: 0
              }}>
                <span style={{ fontSize: '0.75rem' }}>💍</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeWedding.name}
                </span>
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
          <div className="center-header-section desktop-nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MainNav />
          </div>
          
          {/* User Auth actions */}
          <div className="right-header-section desktop-nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', minWidth: 0 }}>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                color: 'var(--text)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--surface-soft)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'none';
              }}
              title={t('settings.themeRowTitle')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0 0.5rem',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--surface-soft)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'none';
              }}
              title={t('settings.langRowTitle')}
            >
              {i18n.language === 'pl' ? '🇬🇧 EN' : '🇵🇱 PL'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.75rem', flexShrink: 0 }}>
              {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <NotificationsPanel token={token} />
                   {/* Avatar bubble with tooltip */}
                   <div
                     title={userDisplayName}
                     style={{
                       width: '34px',
                       height: '34px',
                       borderRadius: '50%',
                       background: user.role === 'planner' ? 'var(--primary)' : 'var(--primary-soft)',
                       color: user.role === 'planner' ? '#fff' : 'var(--primary)',
                       display: 'grid',
                       placeItems: 'center',
                       fontWeight: 700,
                       fontSize: '0.85rem',
                       border: '1px solid var(--border)',
                       flexShrink: 0,
                       cursor: 'default'
                     }}
                   >
                     {userDisplayName.charAt(0).toUpperCase()}
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
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link 
                    to="/login?tab=login" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'var(--surface-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--surface)';
                    }}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link 
                    to="/login?tab=register" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '12px',
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
                    {t('nav.register')}
                  </Link>
                </div>
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
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
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
        <div className="mobile-menu-panel" style={{
          background: 'var(--surface)',
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>{t('settings.themeRowTitle')}</span>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.9rem',
                color: 'var(--text)',
                transition: 'all 0.2s'
              }}
            >
              {theme === 'dark' ? `☀️ ${t('settings.themeLight')}` : `🌙 ${t('settings.themeDark')}`}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>{t('settings.langRowTitle')}</span>
            <button
              onClick={toggleLanguage}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.9rem',
                color: 'var(--text)',
                transition: 'all 0.2s'
              }}
            >
              {i18n.language === 'pl' ? '🇬🇧 English' : '🇵🇱 Polski'}
            </button>
          </div>
          {user && (
            <div className="mobile-notifications-row">
              <NotificationsPanel token={token} />
            </div>
          )}
          
          <div className="mobile-menu-user" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userDisplayName}
                  </span>
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
                  {t('settings.logoutButton')}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                <Link 
                  to="/login?tab=login" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/login?tab=register" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}
                >
                  {t('nav.register')}
                </Link>
              </div>
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
      <footer className='app-footer' style={{
        background: 'var(--surface)',
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
            {t('footer.rights', { year: new Date().getFullYear() })}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'sans-serif', marginTop: '0.5rem' }}>
            <Link to="/rsvp" style={{ textDecoration: 'underline' }}>{t('footer.rsvp')}</Link>
            <span>•</span>
            <Link to="/" style={{ textDecoration: 'underline' }}>{t('footer.about')}</Link>
            <span>•</span>
            <Link to="/auth" style={{ textDecoration: 'underline' }}>{t('footer.managerPanel')}</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
